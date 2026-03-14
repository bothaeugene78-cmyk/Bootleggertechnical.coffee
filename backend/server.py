from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext

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

# Allowed email domains
ALLOWED_DOMAINS = [
    "bootlegger.co.za",
    "bootlegger.com", 
    "bootlegger.coffee",
    "rockandroller.coffee",
    "rockandroller.co.za",
    "rockandroller.com"
]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ─── MODELS ─────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    created_at: str
    last_login: Optional[str] = None

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

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

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

# ─── HELPER FUNCTIONS ───────────────────────────────────────

def validate_email_domain(email: str) -> bool:
    """Check if email domain is in allowed list"""
    domain = email.split('@')[-1].lower()
    return domain in ALLOWED_DOMAINS

def generate_reset_code() -> str:
    """Generate a 6-character alphanumeric reset code"""
    import random
    import string
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

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
    
    # Create user
    now = datetime.now(timezone.utc).isoformat()
    user_doc = {
        "id": str(uuid.uuid4()),
        "email": user_data.email.lower(),
        "name": user_data.name,
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
    expires_at = now + timedelta(hours=1)  # Code valid for 1 hour
    
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
async def get_reset_codes(
    current_user: dict = Depends(get_current_user)
):
    """Get all reset codes (for admin view)"""
    codes = await db.reset_codes.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return codes

# ─── ADMIN ROUTES (Login History) ───────────────────────────

@api_router.get("/admin/login-history", response_model=List[LoginHistoryResponse])
async def get_login_history(
    limit: int = 100,
    current_user: dict = Depends(get_current_user)
):
    """Get login history - all logins tracked with user, date, time"""
    history = await db.login_history.find(
        {}, 
        {"_id": 0}
    ).sort("login_time", -1).to_list(limit)
    return history

@api_router.get("/admin/users", response_model=List[UserResponse])
async def get_all_users(current_user: dict = Depends(get_current_user)):
    """Get all registered users"""
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users

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
