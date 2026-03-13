# Bootlegger Asset Tracker - PRD

## Overview
Mobile-first asset management web application for Bootlegger Coffee technical operations.

## Original Problem Statement
Client created an app with Claude AI for tracking coffee machine assets across multiple Bootlegger Coffee stores. The app needs to be accessible on mobile, tablet, laptop, and PC for employee testing and daily operations.

## Architecture
- **Frontend**: React 19 with Tailwind CSS
- **Backend**: Not required (static data)
- **Data Storage**: In-memory JavaScript (data.js)
- **Hosting**: Emergent Platform Preview

## Tech Stack
- React 19.0.0
- Tailwind CSS 3.4.17
- Lucide React (icons)
- No database required - all data in data.js

## User Personas
1. **Technicians**: View equipment status, raise callouts, follow self-help guides
2. **Administrators**: Manage users, oversee all stores and service schedules
3. **Store Managers**: Check their store's equipment status and service history

## Core Requirements
1. ✅ Dashboard with operational stats
2. ✅ Equipment tracking (63 stores)
3. ✅ Callout management system
4. ✅ Service history records
5. ✅ Self-help maintenance guides
6. ✅ User/technician listing
7. ✅ Mobile-first responsive design
8. ✅ Multi-device accessibility

## What's Been Implemented (Jan 2026)

### Dashboard
- Real-time stats: 60 assets, 1198 records, 18 overdue, 9 due soon
- Alert banner for overdue stores
- Historical activity charts (2018-2026)
- Monthly activity breakdown
- Group performance cards (WC BHO, WC Franchised, Wholesale)

### Equipment Page
- 63 stores with full details
- Search by store name or machine
- Filter by status (overdue, due soon, ok)
- Filter by group
- Asset detail modal with machine/grinder info

### Callouts
- Create new callouts with asset selection
- Priority levels (low, medium, high)
- Status tracking (open, in-progress, closed)
- Filter by status

### Service History
- 39 recent service records displayed
- Full history (1,198 records since 2018)
- Filter by type (Service/Repair)
- Filter by group
- Searchable by store, invoice, job card

### Self-Help Guides
- 7 maintenance guides available
- Categories: Cleaning, Maintenance, Inspection, Admin
- Step-by-step instructions

### Users
- 9 active technicians listed
- Role and group assignment
- Contact display

## Responsive Design
- Mobile (375px+)
- Tablet (768px+)
- Desktop (1024px+)
- PWA-ready structure

## Prioritized Backlog

### P0 - Critical (Future)
- [ ] Backend persistence for callouts (Supabase)
- [ ] User authentication/PIN lock

### P1 - High Priority
- [ ] Push notifications for overdue stores
- [ ] Wholesale store asset data

### P2 - Medium Priority
- [ ] PWA offline support
- [ ] Fill in machine data for 12 unscheduled franchised stores
- [ ] Export functionality for reports

## Next Tasks
1. Add backend persistence if client needs callout data to persist
2. Implement authentication if required
3. Add data sync with source Excel/CSV files

## Testing URLs
- Preview: https://claude-employee-hub.preview.emergentagent.com
- Works on all devices via browser

## Brand Guidelines
- Primary Gold: #c9a84c
- Background: #0f1117
- Accent Orange: #f59c0a
- Font Display: Rajdhani
- Font Logo: Playfair Display
