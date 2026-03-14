# Bootlegger Asset Tracker - PRD

## Overview
Mobile-first asset management web application for Bootlegger Coffee technical operations with secure employee authentication and password reset.

## Original Problem Statement
Client created an app with Claude AI for tracking coffee machine assets across multiple Bootlegger Coffee stores. The app needs to be accessible on mobile, tablet, laptop, and PC for employee testing and daily operations. **Authentication required** - only employees with company email domains can access.

## Architecture
- **Frontend**: React 19 with Tailwind CSS
- **Backend**: FastAPI with JWT authentication
- **Database**: MongoDB (users, login history, reset codes)
- **Hosting**: Emergent Platform Preview
- **Target Domain**: bootleggertechnical.coffee (GoDaddy)

## Tech Stack
- React 19.0.0
- Tailwind CSS 3.4.17
- Lucide React (icons)
- FastAPI with JWT (PyJWT, bcrypt, passlib)
- MongoDB with Motor (async driver)

## User Personas
1. **Technicians**: View equipment status, raise callouts, follow self-help guides
2. **Administrators**: Manage users, oversee all stores, view login history, generate password reset codes
3. **Store Managers**: Check their store's equipment status and service history

## Core Requirements (All Implemented)
1. ✅ Email/Password authentication
2. ✅ Domain-restricted access (6 allowed domains)
3. ✅ Login history tracking (user, date, time)
4. ✅ Password reset with admin-generated codes
5. ✅ Dashboard with operational stats
6. ✅ Equipment tracking (63 stores)
7. ✅ Callout management system
8. ✅ Service history records
9. ✅ Self-help maintenance guides
10. ✅ User/technician listing
11. ✅ Mobile-first responsive design

## Authentication System

### Allowed Email Domains
- @bootlegger.co.za
- @bootlegger.com
- @bootlegger.coffee
- @rockandroller.coffee
- @rockandroller.co.za
- @rockandroller.com

### Features
- Email/password registration with domain validation
- Secure login with JWT tokens (7-day expiry)
- Password hashing with bcrypt
- Login history tracking in MongoDB
- Protected routes - dashboard only accessible after login
- User menu with logout and admin options

## Password Reset System (Implemented Jan 2026)

### How It Works
1. **Admin generates code**: Admin goes to Menu → Password Resets, selects user, clicks "Generate Code"
2. **Code displayed**: 6-character code shown (e.g., UK1KXI) with copy button
3. **Admin shares code**: Admin gives code to user (verbally, text, etc.)
4. **User resets**: User clicks "Forgot your password?" on login, enters email + code + new password
5. **Code expires**: Codes are valid for 1 hour, marked as USED after use

### Technical Details
- 6-character alphanumeric codes (uppercase)
- 1-hour expiry
- Codes stored in MongoDB with status (ACTIVE/USED/EXPIRED)
- Previous codes auto-invalidated when new code generated

## What's Been Implemented

### Authentication
- Login/Register pages with domain validation
- JWT token management
- Login history page
- Password reset (admin code generation + user reset)

### Dashboard
- Real-time stats: 60 assets, 1198 records, 18 overdue, 9 due soon
- Alert banner for overdue stores
- Historical activity charts (2018-2026)
- Monthly activity breakdown
- Group performance cards

### Equipment Page
- 63 stores with full details
- Search by store name or machine
- Filter by status and group
- Asset detail modal

### Callouts
- Create new callouts
- Priority levels (low, medium, high)
- Status tracking

### Service History
- 39 recent service records
- Filter and search functionality

### Self-Help Guides
- 7 maintenance guides
- Step-by-step instructions

### Users
- 9 active technicians listed

## Responsive Design
- Mobile (375px+)
- Tablet (768px+)
- Desktop (1024px+)

## Prioritized Backlog

### P0 - Critical (DONE)
- [x] User authentication
- [x] Domain restriction
- [x] Login tracking
- [x] Password reset

### P1 - High Priority
- [ ] Deploy to bootleggertechnical.coffee domain
- [ ] Backend persistence for callouts
- [ ] Push notifications for overdue stores

### P2 - Medium Priority
- [ ] PWA offline support
- [ ] Email-based password reset (optional upgrade)
- [ ] Admin role separation
- [ ] Export functionality for reports

## Testing URLs
- Preview: https://claude-employee-hub.preview.emergentagent.com
- Test credentials: john@bootlegger.co.za / newpassword123

## API Endpoints

### Auth
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user
- GET /api/auth/verify - Verify token
- POST /api/auth/generate-reset-code - Admin generates reset code
- POST /api/auth/reset-password - User resets password

### Admin
- GET /api/admin/login-history - Get all login history
- GET /api/admin/users - Get all users
- GET /api/admin/reset-codes - Get all reset codes

## Brand Guidelines
- Primary Gold: #c9a84c
- Background: #0f1117
- Accent Orange: #f59c0a
- Font Display: Rajdhani
- Font Logo: Playfair Display

## Domain Setup (Pending)
- Domain: bootleggertechnical.coffee
- Registrar: GoDaddy
- Status: Ready for deployment configuration when client is ready
