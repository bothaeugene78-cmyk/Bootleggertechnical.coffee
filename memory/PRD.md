# Bootlegger Service Management System - PRD

## Overview
Complete service management platform for Bootlegger Coffee technical operations. Features full service ticket workflow from customer call logging to invoice generation.

## Original Problem Statement
Client needs a streamlined workflow system:
1. Store staff log service calls with video upload
2. Auto-assign ticket numbers
3. Notify Rock & Roller via email
4. Assess: telephonic resolution or dispatch technician
5. Schedule technician visits
6. Technician completes job card on-site, uploads photo
7. Accounting creates invoices from job cards
8. Monthly statements uploaded

## Architecture
- **Frontend**: React 19 with Tailwind CSS
- **Backend**: FastAPI with JWT authentication
- **Database**: MongoDB (users, tickets, statements, login history)
- **File Storage**: Cloudinary (pending API keys)
- **Email**: Resend (pending API keys)
- **Target Domain**: bootleggertechnical.coffee

## User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access - view all tickets, assign technicians, schedule, manage users, generate reset codes |
| **Technician** | View assigned tickets, update status, upload job cards |
| **Accounting** | View completed tickets, attach invoices, upload statements |
| **Store Staff** | Log new service calls, view their store's tickets |

## Service Ticket Workflow

### 1. Store Staff Logs Call
- Select store from dropdown (63 stores available)
- Describe issue
- Select machine type (auto-filled from store data)
- Set urgency (Low / Medium / High / Critical)
- **Auto-generates ticket number** (e.g., TKT-20260314-1645)

### 2. Video Upload (Optional)
- Prompt to record/upload video showing the issue
- Helps technicians prepare tools and parts
- Max 100MB, stored in Cloudinary

### 3. Email Notification
- Automatic email to service@rockandroller.coffee
- Includes: ticket number, store, issue, urgency, video link

### 4. Admin Assessment
- View ticket with video
- Choose resolution type: **Telephonic** or **Onsite**
- If onsite: Assign technician, schedule date/time

### 5. Technician Dispatch
- Technician sees assigned tickets
- Updates status: In Progress → Completed
- Uploads job card photo (customer signature)

### 6. Invoice Generation
- Accounting views completed tickets
- Attaches invoice with reference number
- Status updates to "Invoiced"

### 7. Monthly Statements
- Accounting uploads monthly statements
- Stored with date reference

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register with company email
- `POST /api/auth/login` - Login
- `POST /api/auth/generate-reset-code` - Admin generates reset code
- `POST /api/auth/reset-password` - Reset with code

### Tickets
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets` - List tickets (filtered by role)
- `GET /api/tickets/{id}` - Get ticket details
- `PUT /api/tickets/{id}` - Update ticket
- `PUT /api/tickets/{id}/video` - Add video
- `POST /api/tickets/{id}/jobcard` - Upload job card
- `POST /api/tickets/{id}/invoice` - Attach invoice

### Admin
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/{id}` - Update user role
- `GET /api/admin/technicians` - List technicians
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/login-history` - Login audit trail

### Statements
- `POST /api/statements` - Upload statement
- `GET /api/statements` - List statements

## Ticket Statuses
1. **Open** - New ticket, awaiting assessment
2. **Assessing** - Under review
3. **Scheduled** - Technician assigned, visit scheduled
4. **In Progress** - Technician on-site
5. **Completed** - Job done, awaiting invoice
6. **Invoiced** - Invoice attached
7. **Closed** - Fully processed

## Pending Integrations

### Cloudinary (Video/Image Upload)
- Status: Code ready, awaiting API keys
- Required: Cloud Name, API Key, API Secret
- Get from: https://cloudinary.com

### Resend (Email Notifications)
- Status: Code ready, awaiting API key
- Required: API Key
- Sender: notifications@rockandroller.coffee
- Get from: https://resend.com

## Test Credentials
- Admin: john@bootlegger.co.za / newpassword123
- Preview: https://claude-employee-hub.preview.emergentagent.com

## Implementation Status

### Completed
- [x] User authentication with 6 allowed email domains
- [x] Role-based access control (4 roles)
- [x] Service ticket creation with auto-numbering
- [x] Video upload prompt (Cloudinary pending)
- [x] Ticket management (status, assignment, scheduling)
- [x] Dashboard with live ticket stats
- [x] Team members management with role changes
- [x] Password reset with admin codes
- [x] Login history tracking
- [x] Mobile-responsive design

### Pending
- [ ] Cloudinary API keys for video upload
- [ ] Resend API key for email notifications
- [ ] Job card photo upload with quality check
- [ ] Invoice attachment feature
- [ ] Statement upload feature
- [ ] Deployment to bootleggertechnical.coffee

## Prioritized Backlog

### P0 - Awaiting Keys
- Cloudinary integration
- Resend email notifications

### P1 - High Priority
- Job card photo upload with image quality detection
- Invoice creation from job cards
- WhatsApp notifications (Twilio)

### P2 - Medium Priority
- Monthly statement management
- Report generation
- Technician GPS tracking
- Digital signature capture

## Brand Guidelines
- Primary Gold: #c9a84c
- Background: #0f1117
- Accent Orange: #f59c0a
- Font Display: Rajdhani
- Font Body: Inter
