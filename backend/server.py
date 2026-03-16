from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
import cloudinary
import cloudinary.utils
import cloudinary.uploader
import time

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'bootlegger-asset-tracker-secret-key-2026')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer()

# Cloudinary Configuration
if os.environ.get('CLOUDINARY_CLOUD_NAME'):
    cloudinary.config(
        cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
        api_key=os.environ.get('CLOUDINARY_API_KEY'),
        api_secret=os.environ.get('CLOUDINARY_API_SECRET'),
        secure=True
    )

# Resend Configuration
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'notifications@rockandroller.coffee')
NOTIFICATION_EMAILS = os.environ.get('NOTIFICATION_EMAILS', '').split(',')
NOTIFICATION_EMAILS = [e.strip() for e in NOTIFICATION_EMAILS if e.strip()]

# Allowed email domains
ALLOWED_DOMAINS = [
    "bootlegger.co.za",
    "bootlegger.com", 
    "bootlegger.coffee",
    "rockandroller.coffee",
    "rockandroller.co.za",
    "rockandroller.com"
]

# User Roles
USER_ROLES = ["store_staff", "technician", "admin", "accounting"]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ─── MODELS ─────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "store_staff"
    store_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    role: str = "store_staff"
    store_name: Optional[str] = None
    created_at: str
    last_login: Optional[str] = None

class UserUpdate(BaseModel):
    role: Optional[str] = None
    store_name: Optional[str] = None
    name: Optional[str] = None

class LoginHistoryResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    user_email: str
    user_name: str
    login_time: str
    
class AuthResponse(BaseModel):
    token: str
    user: UserResponse

# Ticket/Service Call Models
class TicketCreate(BaseModel):
    store_id: str
    store_name: str
    issue_description: str
    machine_type: Optional[str] = None
    urgency: str = "medium"  # low, medium, high, critical

class TicketUpdate(BaseModel):
    status: Optional[str] = None  # open, assessing, scheduled, in_progress, completed, invoiced, closed
    resolution_type: Optional[str] = None  # telephonic, onsite
    assigned_technician_id: Optional[str] = None
    assigned_technician_name: Optional[str] = None
    scheduled_date: Optional[str] = None
    scheduled_time: Optional[str] = None
    notes: Optional[str] = None

class TicketResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    ticket_number: str
    store_id: str
    store_name: str
    issue_description: str
    machine_type: Optional[str] = None
    urgency: str
    status: str
    resolution_type: Optional[str] = None
    video_url: Optional[str] = None
    video_public_id: Optional[str] = None
    assigned_technician_id: Optional[str] = None
    assigned_technician_name: Optional[str] = None
    scheduled_date: Optional[str] = None
    scheduled_time: Optional[str] = None
    job_card_url: Optional[str] = None
    job_card_public_id: Optional[str] = None
    invoice_url: Optional[str] = None
    invoice_number: Optional[str] = None
    notes: Optional[str] = None
    created_by_id: str
    created_by_name: str
    created_at: str
    updated_at: str

class JobCardUpload(BaseModel):
    job_card_url: str
    job_card_public_id: str
    completion_notes: Optional[str] = None

class InvoiceUpload(BaseModel):
    invoice_url: str
    invoice_number: str

class StatementUpload(BaseModel):
    month: str  # e.g., "2026-01"
    statement_url: str
    statement_public_id: str
    notes: Optional[str] = None

class StatementResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    month: str
    statement_url: str
    statement_public_id: str
    uploaded_by_id: str
    uploaded_by_name: str
    notes: Optional[str] = None
    created_at: str

# Password Reset Models
class GenerateResetCodeRequest(BaseModel):
    email: EmailStr

class ResetCodeResponse(BaseModel):
    email: str
    reset_code: str
    expires_at: str
    message: str

class PasswordResetRequest(BaseModel):
    email: EmailStr
    reset_code: str
    new_password: str

class ResetCodeListResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    reset_code: str
    created_at: str
    expires_at: str
    used: bool

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# ─── HELPER FUNCTIONS ───────────────────────────────────────

def validate_email_domain(email: str) -> bool:
    """Check if email domain is in allowed list"""
    domain = email.split('@')[-1].lower()
    return domain in ALLOWED_DOMAINS

ROCKANDROLLER_DOMAINS = ["rockandroller.coffee", "rockandroller.co.za", "rockandroller.com"]
BOOTLEGGER_DOMAINS = ["bootlegger.co.za", "bootlegger.com", "bootlegger.coffee"]

def get_role_from_email(email: str) -> str:
    """Auto-assign role based on email"""
    email_lower = email.lower()
    if email_lower == "gm@rockandroller.coffee":
        return "admin"
    domain = email_lower.split('@')[-1]
    if domain in ROCKANDROLLER_DOMAINS:
        return "technician"
    return "store_staff"

def generate_reset_code() -> str:
    """Generate a 6-character alphanumeric reset code"""
    import random
    import string
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

def generate_ticket_number() -> str:
    """Generate a ticket number like TKT-20260314-001"""
    today = datetime.now(timezone.utc).strftime('%Y%m%d')
    random_suffix = ''.join([str(__import__('random').randint(0, 9)) for _ in range(4)])
    return f"TKT-{today}-{random_suffix}"

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    payload = decode_token(token)
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def send_notification_email(to_emails: list, subject: str, html_content: str):
    """Send email notification using Resend to multiple recipients"""
    if not RESEND_API_KEY:
        logging.warning("RESEND_API_KEY not configured - email not sent")
        return None
    
    if not to_emails:
        logging.warning("No notification emails configured")
        return None
    
    try:
        import resend
        resend.api_key = RESEND_API_KEY
        
        params = {
            "from": SENDER_EMAIL,
            "to": to_emails,
            "subject": subject,
            "html": html_content
        }
        
        email = await asyncio.to_thread(resend.Emails.send, params)
        logging.info(f"Email sent to {to_emails}: {email.get('id')}")
        return email
    except Exception as e:
        logging.error(f"Failed to send email: {str(e)}")
        return None

def create_ticket_notification_html(ticket: dict) -> str:
    """Create HTML email for new ticket notification"""
    return f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1d27; padding: 20px; text-align: center;">
            <h1 style="color: #c9a84c; margin: 0;">BOOTLEGGER</h1>
            <p style="color: #f59c0a; margin: 5px 0 0;">Service Call Alert</p>
        </div>
        
        <div style="background: #f5f5f5; padding: 20px;">
            <h2 style="color: #333; margin-top: 0;">New Service Call Logged</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Ticket #</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #f59c0a; font-size: 18px;">{ticket['ticket_number']}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Store</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">{ticket['store_name']}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Issue</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">{ticket['issue_description']}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Machine</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">{ticket.get('machine_type', 'Not specified')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Urgency</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                        <span style="background: {'#ef4444' if ticket['urgency'] == 'critical' else '#f59e0b' if ticket['urgency'] == 'high' else '#3b82f6'}; 
                               color: white; padding: 3px 10px; border-radius: 12px; font-size: 12px;">
                            {ticket['urgency'].upper()}
                        </span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Logged By</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">{ticket['created_by_name']}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; font-weight: bold;">Video</td>
                    <td style="padding: 10px;">{'<a href="' + ticket['video_url'] + '" style="color: #f59c0a;">View Video</a>' if ticket.get('video_url') else 'No video attached'}</td>
                </tr>
            </table>
            
            <p style="margin-top: 20px; color: #666; font-size: 14px;">
                Please assess this call and determine if it can be resolved telephonically or if a technician needs to be dispatched.
            </p>
        </div>
        
        <div style="background: #1a1d27; padding: 15px; text-align: center;">
            <p style="color: #6b7280; margin: 0; font-size: 12px;">Bootlegger Technical Service Management</p>
        </div>
    </div>
    """

# ─── AUTH ROUTES ────────────────────────────────────────────

@api_router.post("/auth/register", response_model=AuthResponse)
async def register(user_data: UserCreate):
    # Validate email domain
    if not validate_email_domain(user_data.email):
        allowed = ", ".join([f"@{d}" for d in ALLOWED_DOMAINS])
        raise HTTPException(
            status_code=400, 
            detail=f"Email domain not allowed. Please use a company email: {allowed}"
        )
    
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate password
    if len(user_data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    # Auto-assign role based on email domain
    assigned_role = get_role_from_email(user_data.email)
    
    # Create user
    now = datetime.now(timezone.utc).isoformat()
    user_doc = {
        "id": str(uuid.uuid4()),
        "email": user_data.email.lower(),
        "name": user_data.name,
        "role": assigned_role,
        "store_name": user_data.store_name,
        "password_hash": hash_password(user_data.password),
        "created_at": now,
        "last_login": now
    }
    
    await db.users.insert_one(user_doc)
    
    # Log the registration/first login
    login_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_doc["id"],
        "user_email": user_doc["email"],
        "user_name": user_doc["name"],
        "login_time": now
    }
    await db.login_history.insert_one(login_doc)
    
    # Create token
    token = create_token(user_doc["id"], user_doc["email"])
    
    return AuthResponse(
        token=token,
        user=UserResponse(
            id=user_doc["id"],
            email=user_doc["email"],
            name=user_doc["name"],
            role=user_doc["role"],
            store_name=user_doc.get("store_name"),
            created_at=user_doc["created_at"],
            last_login=user_doc["last_login"]
        )
    )

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(credentials: UserLogin):
    # Find user
    user = await db.users.find_one({"email": credentials.email.lower()}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Update last login
    now = datetime.now(timezone.utc).isoformat()
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"last_login": now}}
    )
    
    # Log the login
    login_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "user_email": user["email"],
        "user_name": user["name"],
        "login_time": now
    }
    await db.login_history.insert_one(login_doc)
    
    # Create token
    token = create_token(user["id"], user["email"])
    
    return AuthResponse(
        token=token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            role=user.get("role", "store_staff"),
            store_name=user.get("store_name"),
            created_at=user["created_at"],
            last_login=now
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        role=current_user.get("role", "store_staff"),
        store_name=current_user.get("store_name"),
        created_at=current_user["created_at"],
        last_login=current_user.get("last_login")
    )

@api_router.get("/auth/verify")
async def verify_token(current_user: dict = Depends(get_current_user)):
    return {"valid": True, "user_id": current_user["id"]}

# ─── PASSWORD RESET ROUTES ──────────────────────────────────

@api_router.post("/auth/generate-reset-code", response_model=ResetCodeResponse)
async def generate_password_reset_code(
    request: GenerateResetCodeRequest,
    current_user: dict = Depends(get_current_user)
):
    """Admin generates a reset code for a user"""
    # Check if user exists
    user = await db.users.find_one({"email": request.email.lower()})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Generate reset code
    reset_code = generate_reset_code()
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(hours=1)
    
    # Invalidate any existing reset codes for this user
    await db.reset_codes.update_many(
        {"email": request.email.lower(), "used": False},
        {"$set": {"used": True}}
    )
    
    # Store reset code
    reset_doc = {
        "id": str(uuid.uuid4()),
        "email": request.email.lower(),
        "reset_code": reset_code,
        "created_at": now.isoformat(),
        "expires_at": expires_at.isoformat(),
        "used": False
    }
    await db.reset_codes.insert_one(reset_doc)
    
    return ResetCodeResponse(
        email=request.email.lower(),
        reset_code=reset_code,
        expires_at=expires_at.isoformat(),
        message=f"Reset code generated. Give this code to the user: {reset_code}"
    )

@api_router.post("/auth/reset-password")
async def reset_password(request: PasswordResetRequest):
    """User resets password using reset code"""
    # Find valid reset code
    reset_doc = await db.reset_codes.find_one({
        "email": request.email.lower(),
        "reset_code": request.reset_code.upper(),
        "used": False
    })
    
    if not reset_doc:
        raise HTTPException(status_code=400, detail="Invalid or expired reset code")
    
    # Check if code expired
    expires_at = datetime.fromisoformat(reset_doc["expires_at"])
    if datetime.now(timezone.utc) > expires_at:
        await db.reset_codes.update_one(
            {"id": reset_doc["id"]},
            {"$set": {"used": True}}
        )
        raise HTTPException(status_code=400, detail="Reset code has expired")
    
    # Validate new password
    if len(request.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    # Update user password
    await db.users.update_one(
        {"email": request.email.lower()},
        {"$set": {"password_hash": hash_password(request.new_password)}}
    )
    
    # Mark reset code as used
    await db.reset_codes.update_one(
        {"id": reset_doc["id"]},
        {"$set": {"used": True}}
    )
    
    return {"message": "Password reset successful. You can now login with your new password."}

@api_router.get("/admin/reset-codes", response_model=List[ResetCodeListResponse])
async def get_reset_codes(current_user: dict = Depends(get_current_user)):
    """Get all reset codes (for admin view)"""
    codes = await db.reset_codes.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return codes

# ─── CLOUDINARY ROUTES ──────────────────────────────────────

@api_router.get("/cloudinary/signature")
async def get_cloudinary_signature(
    resource_type: str = Query("image", enum=["image", "video", "raw"]),
    folder: str = "tickets",
    current_user: dict = Depends(get_current_user)
):
    """Generate signed upload params for Cloudinary"""
    if not os.environ.get('CLOUDINARY_CLOUD_NAME'):
        raise HTTPException(status_code=503, detail="Cloudinary not configured")
    
    ALLOWED_FOLDERS = ("tickets/", "jobcards/", "invoices/", "statements/")
    if not any(folder.startswith(f) for f in ALLOWED_FOLDERS):
        folder = "tickets"
    
    timestamp = int(time.time())
    params = {
        "timestamp": timestamp,
        "folder": folder,
        "resource_type": resource_type
    }
    
    signature = cloudinary.utils.api_sign_request(
        params,
        os.environ.get('CLOUDINARY_API_SECRET')
    )
    
    return {
        "signature": signature,
        "timestamp": timestamp,
        "cloud_name": os.environ.get('CLOUDINARY_CLOUD_NAME'),
        "api_key": os.environ.get('CLOUDINARY_API_KEY'),
        "folder": folder,
        "resource_type": resource_type
    }

# ─── TICKET/SERVICE CALL ROUTES ─────────────────────────────

@api_router.post("/tickets", response_model=TicketResponse)
async def create_ticket(
    ticket_data: TicketCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new service ticket"""
    now = datetime.now(timezone.utc).isoformat()
    ticket_number = generate_ticket_number()
    
    ticket_doc = {
        "id": str(uuid.uuid4()),
        "ticket_number": ticket_number,
        "store_id": ticket_data.store_id,
        "store_name": ticket_data.store_name,
        "issue_description": ticket_data.issue_description,
        "machine_type": ticket_data.machine_type,
        "urgency": ticket_data.urgency,
        "status": "open",
        "resolution_type": None,
        "video_url": None,
        "video_public_id": None,
        "assigned_technician_id": None,
        "assigned_technician_name": None,
        "scheduled_date": None,
        "scheduled_time": None,
        "job_card_url": None,
        "job_card_public_id": None,
        "invoice_url": None,
        "invoice_number": None,
        "notes": None,
        "created_by_id": current_user["id"],
        "created_by_name": current_user["name"],
        "created_at": now,
        "updated_at": now
    }
    
    await db.tickets.insert_one(ticket_doc)
    
    # Send email notification to all configured recipients
    if NOTIFICATION_EMAILS:
        asyncio.create_task(send_notification_email(
            NOTIFICATION_EMAILS,
            f"New Service Call: {ticket_number} - {ticket_data.store_name}",
            create_ticket_notification_html(ticket_doc)
        ))
    
    return ticket_doc

@api_router.put("/tickets/{ticket_id}/video")
async def add_video_to_ticket(
    ticket_id: str,
    video_url: str,
    video_public_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Add video URL to an existing ticket"""
    ticket = await db.tickets.find_one({"id": ticket_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    now = datetime.now(timezone.utc).isoformat()
    await db.tickets.update_one(
        {"id": ticket_id},
        {"$set": {
            "video_url": video_url,
            "video_public_id": video_public_id,
            "updated_at": now
        }}
    )
    
    # Send updated notification with video
    ticket["video_url"] = video_url
    if NOTIFICATION_EMAILS:
        asyncio.create_task(send_notification_email(
            NOTIFICATION_EMAILS,
            f"Video Added: {ticket['ticket_number']} - {ticket['store_name']}",
            create_ticket_notification_html(ticket)
        ))
    
    return {"message": "Video added successfully"}

@api_router.get("/tickets", response_model=List[TicketResponse])
async def get_tickets(
    status: Optional[str] = None,
    store_id: Optional[str] = None,
    assigned_to: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all tickets with optional filters"""
    query = {}
    
    if status:
        query["status"] = status
    if store_id:
        query["store_id"] = store_id
    if assigned_to:
        query["assigned_technician_id"] = assigned_to
    
    # Store staff only see their store's tickets
    if current_user.get("role") == "store_staff" and current_user.get("store_name"):
        query["store_name"] = current_user["store_name"]
    
    # Technicians see their assigned tickets
    if current_user.get("role") == "technician":
        query["assigned_technician_id"] = current_user["id"]
    
    tickets = await db.tickets.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return tickets

@api_router.get("/tickets/{ticket_id}", response_model=TicketResponse)
async def get_ticket(
    ticket_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a single ticket by ID"""
    ticket = await db.tickets.find_one({"id": ticket_id}, {"_id": 0})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@api_router.put("/tickets/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: str,
    update_data: TicketUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update ticket status, assignment, scheduling, etc."""
    ticket = await db.tickets.find_one({"id": ticket_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Only admin can update tickets
    if current_user.get("role") not in ["admin", "technician", "accounting"]:
        raise HTTPException(status_code=403, detail="Not authorized to update tickets")
    
    update_dict = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    if update_data.status:
        update_dict["status"] = update_data.status
    if update_data.resolution_type:
        update_dict["resolution_type"] = update_data.resolution_type
    if update_data.assigned_technician_id:
        update_dict["assigned_technician_id"] = update_data.assigned_technician_id
    if update_data.assigned_technician_name:
        update_dict["assigned_technician_name"] = update_data.assigned_technician_name
    if update_data.scheduled_date:
        update_dict["scheduled_date"] = update_data.scheduled_date
    if update_data.scheduled_time:
        update_dict["scheduled_time"] = update_data.scheduled_time
    if update_data.notes is not None:
        update_dict["notes"] = update_data.notes
    
    await db.tickets.update_one({"id": ticket_id}, {"$set": update_dict})
    
    updated_ticket = await db.tickets.find_one({"id": ticket_id}, {"_id": 0})
    return updated_ticket

@api_router.post("/tickets/{ticket_id}/jobcard")
async def upload_job_card(
    ticket_id: str,
    data: JobCardUpload,
    current_user: dict = Depends(get_current_user)
):
    """Technician uploads completed job card"""
    if current_user.get("role") not in ["admin", "technician"]:
        raise HTTPException(status_code=403, detail="Only technicians can upload job cards")
    
    ticket = await db.tickets.find_one({"id": ticket_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    now = datetime.now(timezone.utc).isoformat()
    await db.tickets.update_one(
        {"id": ticket_id},
        {"$set": {
            "job_card_url": data.job_card_url,
            "job_card_public_id": data.job_card_public_id,
            "status": "completed",
            "notes": data.completion_notes if data.completion_notes else ticket.get("notes"),
            "updated_at": now
        }}
    )
    
    return {"message": "Job card uploaded successfully"}

@api_router.post("/tickets/{ticket_id}/invoice")
async def attach_invoice(
    ticket_id: str,
    data: InvoiceUpload,
    current_user: dict = Depends(get_current_user)
):
    """Accounting attaches invoice to ticket"""
    if current_user.get("role") not in ["admin", "accounting"]:
        raise HTTPException(status_code=403, detail="Only accounting can attach invoices")
    
    ticket = await db.tickets.find_one({"id": ticket_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    now = datetime.now(timezone.utc).isoformat()
    await db.tickets.update_one(
        {"id": ticket_id},
        {"$set": {
            "invoice_url": data.invoice_url,
            "invoice_number": data.invoice_number,
            "status": "invoiced",
            "updated_at": now
        }}
    )
    
    return {"message": "Invoice attached successfully"}

# ─── STATEMENTS ROUTES ──────────────────────────────────────

@api_router.post("/statements", response_model=StatementResponse)
async def upload_statement(
    statement_data: StatementUpload,
    current_user: dict = Depends(get_current_user)
):
    """Upload monthly statement"""
    if current_user.get("role") not in ["admin", "accounting"]:
        raise HTTPException(status_code=403, detail="Only accounting can upload statements")
    
    now = datetime.now(timezone.utc).isoformat()
    statement_doc = {
        "id": str(uuid.uuid4()),
        "month": statement_data.month,
        "statement_url": statement_data.statement_url,
        "statement_public_id": statement_data.statement_public_id,
        "uploaded_by_id": current_user["id"],
        "uploaded_by_name": current_user["name"],
        "notes": statement_data.notes,
        "created_at": now
    }
    
    await db.statements.insert_one(statement_doc)
    return statement_doc

@api_router.get("/statements", response_model=List[StatementResponse])
async def get_statements(current_user: dict = Depends(get_current_user)):
    """Get all statements"""
    statements = await db.statements.find({}, {"_id": 0}).sort("month", -1).to_list(100)
    return statements

# ─── ADMIN ROUTES ───────────────────────────────────────────

@api_router.get("/admin/login-history", response_model=List[LoginHistoryResponse])
async def get_login_history(
    limit: int = 100,
    current_user: dict = Depends(get_current_user)
):
    """Get login history"""
    history = await db.login_history.find({}, {"_id": 0}).sort("login_time", -1).to_list(limit)
    return history

@api_router.get("/admin/users", response_model=List[UserResponse])
async def get_all_users(current_user: dict = Depends(get_current_user)):
    """Get all registered users"""
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return [UserResponse(**u) for u in users]

@api_router.put("/admin/users/{user_id}")
async def update_user(
    user_id: str,
    update_data: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user role or store assignment"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admin can update users")
    
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_dict = {}
    if update_data.role and update_data.role in USER_ROLES:
        update_dict["role"] = update_data.role
    if update_data.store_name is not None:
        update_dict["store_name"] = update_data.store_name
    if update_data.name:
        update_dict["name"] = update_data.name
    
    if update_dict:
        await db.users.update_one({"id": user_id}, {"$set": update_dict})
    
    updated_user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    return updated_user

@api_router.get("/admin/technicians", response_model=List[UserResponse])
async def get_technicians(current_user: dict = Depends(get_current_user)):
    """Get all technicians"""
    technicians = await db.users.find({"role": "technician"}, {"_id": 0, "password_hash": 0}).to_list(100)
    return [UserResponse(**t) for t in technicians]

@api_router.get("/admin/stats")
async def get_stats(current_user: dict = Depends(get_current_user)):
    """Get dashboard statistics"""
    total_tickets = await db.tickets.count_documents({})
    open_tickets = await db.tickets.count_documents({"status": "open"})
    scheduled_tickets = await db.tickets.count_documents({"status": "scheduled"})
    in_progress = await db.tickets.count_documents({"status": "in_progress"})
    completed = await db.tickets.count_documents({"status": "completed"})
    invoiced = await db.tickets.count_documents({"status": "invoiced"})
    
    return {
        "total_tickets": total_tickets,
        "open_tickets": open_tickets,
        "scheduled_tickets": scheduled_tickets,
        "in_progress": in_progress,
        "completed": completed,
        "invoiced": invoiced
    }

# ─── EXISTING ROUTES ────────────────────────────────────────

@api_router.get("/")
async def root():
    return {"message": "Bootlegger Asset Tracker API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
