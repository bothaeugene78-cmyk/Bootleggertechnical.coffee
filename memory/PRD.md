# Bootlegger Asset Tracker - PRD

## Overview
Mobile-first asset management web application for Bootlegger Coffee technical operations with secure employee authentication.

## Original Problem Statement
Client created an app with Claude AI for tracking coffee machine assets across multiple Bootlegger Coffee stores. The app needs to be accessible on mobile, tablet, laptop, and PC for employee testing and daily operations. **Authentication required** - only employees with company email domains can access.

## Architecture
- **Frontend**: React 19 with Tailwind CSS
- **Backend**: FastAPI with JWT authentication
- **Database**: MongoDB (users, login history)
- **Hosting**: Emergent Platform Preview

## Tech Stack
- React 19.0.0
- Tailwind CSS 3.4.17
- Lucide React (icons)
- FastAPI with JWT (PyJWT, bcrypt, passlib)
- MongoDB with Motor (async driver)

## User Personas
1. **Technicians**: View equipment status, raise callouts, follow self-help guides
2. **Administrators**: Manage users, oversee all stores, view login history
3. **Store Managers**: Check their store's equipment status and service history

## Core Requirements
1. ✅ Email/Password authentication
2. ✅ Domain-restricted access (6 allowed domains)
3. ✅ Login history tracking (user, date, time)
4. ✅ Dashboard with operational stats
5. ✅ Equipment tracking (63 stores)
6. ✅ Callout management system
7. ✅ Service history records
8. ✅ Self-help maintenance guides
9. ✅ User/technician listing
10. ✅ Mobile-first responsive design

## Authentication System (Implemented Jan 2026)

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
- User menu with logout and login history access

### Login History Tracking
- User name
- User email
- Login date
- Login time
- Stored in MongoDB for audit trail

## What's Been Implemented

### Authentication
- Login/Register pages with validation
- Domain restriction with clear error messages
- JWT token management
- Login history page with chronological list
- User menu dropdown with sign out

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

### P0 - Critical
- [x] User authentication - DONE
- [x] Domain restriction - DONE
- [x] Login tracking - DONE

### P1 - High Priority
- [ ] Deploy to bootleggertechnical.coffee domain
- [ ] Backend persistence for callouts
- [ ] Push notifications for overdue stores

### P2 - Medium Priority
- [ ] PWA offline support
- [ ] Password reset functionality
- [ ] Admin user role for managing other users
- [ ] Export functionality for reports

## Testing URLs
- Preview: https://claude-employee-hub.preview.emergentagent.com
- Test credentials: john@bootlegger.co.za / test123456

## Brand Guidelines
- Primary Gold: #c9a84c
- Background: #0f1117
- Accent Orange: #f59c0a
- Font Display: Rajdhani
- Font Logo: Playfair Display

## Domain Setup (Pending)
- Domain: bootleggertechnical.coffee
- Registrar: GoDaddy
- Status: Ready for deployment configuration
