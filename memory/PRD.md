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
- **File Storage**: Cloudinary (videos, job card photos, invoices)
- **Email**: Resend (verified domain: bootleggertechnical.coffee)
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
- Describe issue, select machine type, set urgency
- Auto-generates ticket number (e.g., TKT-20260314-1645)

### 2. Video Upload (Optional)
- Record/upload video showing the issue via Cloudinary
- Max 100MB

### 3. Email Notification
- Automatic email FROM service@bootleggertechnical.coffee
- TO: service@rockandroller.coffee, doctorg@rockandroller.coffee, roasting@rockandroller.coffee, gm@rockandroller.coffee

### 4. Admin Assessment
- View ticket with video
- Choose resolution type: Telephonic or Onsite
- If onsite: Assign technician, schedule date/time

### 5. Technician Dispatch
- Technician sees assigned tickets
- Updates status, uploads signed job card photo via Cloudinary

### 6. Invoice Attachment
- Accounting views completed tickets
- Attaches invoice (PDF or image) with reference number via Cloudinary

### 7. Monthly Statements
- Accounting uploads monthly statements

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register with company email
- `POST /api/auth/login` - Login
- `POST /api/auth/generate-reset-code` - Admin generates reset code
- `POST /api/auth/reset-password` - Reset with code

### Tickets
- `POST /api/tickets` - Create new ticket (triggers email)
- `GET /api/tickets` - List tickets (filtered by role)
- `GET /api/tickets/{id}` - Get ticket details
- `PUT /api/tickets/{id}` - Update ticket (status, assignment, schedule)
- `PUT /api/tickets/{id}/video` - Add video
- `POST /api/tickets/{id}/jobcard` - Upload job card (JSON body: job_card_url, job_card_public_id, completion_notes)
- `POST /api/tickets/{id}/invoice` - Attach invoice (JSON body: invoice_url, invoice_number)

### Cloudinary
- `GET /api/cloudinary/signature` - Signed upload params (supports image, video, raw)

### Admin
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/{id}` - Update user role
- `GET /api/admin/technicians` - List technicians
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/login-history` - Login audit trail
- `GET /api/admin/reset-codes` - Password reset codes

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

## Test Credentials
- Admin: john@bootlegger.co.za / newpassword123
- Technician: tech@rockandroller.coffee / test123456
- Accounting: accounts@rockandroller.coffee / test123456

## Implementation Status

### Completed
- [x] User authentication with 6 allowed email domains
- [x] Auto role assignment (Bootlegger → store_staff, Rock & Roller → technician, gm@rockandroller.coffee → admin)
- [x] Role-based access control (4 roles)
- [x] Service ticket creation with auto-numbering
- [x] Video upload via Cloudinary
- [x] Email notifications via Resend (verified domain)
- [x] Ticket management (status, assignment, scheduling)
- [x] Dashboard with live ticket stats
- [x] Team members management with role changes
- [x] Password reset with admin codes
- [x] Login history tracking
- [x] Mobile-responsive design
- [x] Job card photo upload (technician role) via Cloudinary
- [x] Invoice attachment (accounting role) via Cloudinary
- [x] Role-based authorization on upload endpoints
- [x] PWA support — installable on Android & iOS as native app
- [x] 513 historical service records imported (in data.js)

### Pending
- [ ] Full end-to-end workflow test by user
- [ ] Deployment to bootleggertechnical.coffee

## Prioritized Backlog

### P1 - High Priority
- Full user workflow test (all roles, all statuses)
- WhatsApp notifications (Twilio)

### P2 - Medium Priority
- Migrate 513 historical records from data.js to MongoDB
- Monthly statement upload UI
- Report generation
- Digital signature capture

## Brand Guidelines
- Primary Gold: #c9a84c
- Background: #0f1117
- Accent Orange: #f59c0a
- Font Display: Rajdhani
- Font Body: Inter
