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
- **Database**: MongoDB (users, tickets, statements, login history, sla_subscriptions, payment_transactions)
- **File Storage**: Cloudinary (videos, job card photos, invoices)
- **Email**: Resend (verified domain: bootleggertechnical.coffee)
- **Payments**: Stripe (SLA subscriptions)
- **Target Domain**: bootleggertechnical.coffee
- **PWA**: Installable on Android & iOS

## User Roles & Auto-Assignment

| Email Domain | Auto Role |
|---|---|
| `gm@rockandroller.coffee` | Admin |
| `@rockandroller.*` | Technician |
| `@bootlegger.*` | Store Staff |

## Implementation Status

### Completed
- [x] User authentication with 6 allowed email domains
- [x] Auto role assignment based on email domain
- [x] Role-based access control (admin, technician, accounting, store_staff)
- [x] Service ticket creation with auto-numbering
- [x] Video upload via Cloudinary
- [x] Email notifications via Resend (4 recipients, verified domain)
- [x] Ticket management (status, assignment, scheduling)
- [x] Job card photo upload — available on all active tickets
- [x] Invoice attachment (accounting role) via Cloudinary
- [x] Dashboard with live ticket stats
- [x] Team members management with role changes
- [x] Password reset with admin codes
- [x] Login history tracking
- [x] Mobile-responsive design
- [x] PWA support — installable on Android & iOS
- [x] Actual Bootlegger logo integrated
- [x] SLA Subscription system — 3 tiers (Silver R1000, Gold R1250, Platinum R1500)
- [x] Stripe payment integration for SLA subscriptions
- [x] Admin manual SLA assignment
- [x] Data-driven SLA tier features (from 513 historical records analysis)
- [x] 513 historical service records imported
- [x] Saved to GitHub for cloning

### Pending
- [ ] User end-to-end workflow testing with real data
- [ ] Redeploy with latest changes

## Prioritized Backlog

### P1 - High Priority
- Full user workflow test (all roles, all statuses)

### P2 - Medium Priority
- Migrate 513 historical records from data.js to MongoDB
- Monthly statement upload UI
- WhatsApp notifications (Twilio)
- Digital signature capture
- Report generation

## SLA Tiers

| Tier | Price | Key Features |
|------|-------|-------------|
| Silver | R1,000/mo | 2x services/yr, Mon-Fri support, 48hr response, 10% parts discount |
| Gold | R1,250/mo | 4x services/yr, Mon-Sat support, 24hr response, 1x emergency/quarter, 15% parts |
| Platinum | R1,500/mo | 6x services/yr, 7-day priority support, same-day response, 2x emergency/quarter, 20% parts, deep clean, burr assessment |

All tiers: On-site visit if not resolved telephonically.

## Test Credentials
- Admin: john@bootlegger.co.za / newpassword123
- Technician: tech@rockandroller.coffee / test123456
- Accounting: accounts@rockandroller.coffee / test123456

## Brand Guidelines
- Primary Gold: #c9a84c
- Background: #0f1117
- Accent Orange: #f59c0a
- Font Display: Rajdhani
- Font Body: Inter
