# BOOTLEGGER Asset Tracker

A mobile-first asset management app for Bootlegger Coffee technical operations.

**Live site:** https://bootleggertechnical.coffee  
**Stack:** React 18 + Vite 5 (static, no backend)  
**Hosting:** Vercel  

---

## Project Structure

```
bootlegger-app/
├── index.html              # App entry point
├── vite.config.js          # Vite configuration
├── vercel.json             # Vercel SPA routing
├── package.json            # Dependencies
├── .gitignore
├── public/
│   ├── favicon.svg
│   ├── logo.svg            # Bootlegger brand logo (SVG)
│   └── .htaccess           # Apache SPA routing (fallback)
└── src/
    ├── main.jsx            # React root
    ├── App.jsx             # Shell, navigation, Header, BottomNav
    ├── index.css           # All styles + CSS variables + dark theme
    ├── data.js             # ALL DATA LIVES HERE — edit this file
    └── pages/
        ├── Dashboard.jsx   # Overview, charts, alerts
        ├── Equipment.jsx   # Store list with service status
        ├── Callouts.jsx    # Active callouts management
        ├── History.jsx     # Service history records
        ├── SelfHelp.jsx    # Step-by-step guides
        └── Users.jsx       # Technician list
```

---

## Data Sources

All data is in `src/data.js` — generated from:

| File | Contents |
|------|----------|
| `Coffee_Machine_Service_Schedule_-_BHO.xlsx` | All store assets, service dates, machines, CASMs |
| `Bootlegger_up_to_date.csv` | Invoice records 2024–2026 |
| `Bootlegger_up_2024.csv` | Invoice records 2018–2024 |
| `Tech_-_*_-_Bootlegger_-_Technical_Report.xlsx` | Per-technician job records |

**Key stats (as at 13 March 2026):**
- 63 stores tracked (19 BHO + 32 Franchised + 12 pending)
- 1,198 total records since 2018
- 18 stores currently overdue for service
- 9 stores due within 30 days

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
# → http://localhost:4173
```

---

## Deployment (Vercel + GitHub)

Auto-deploys when you push to `main`.

### First-time setup
1. Push to GitHub
2. Import repo in Vercel → auto-detects Vite → Deploy
3. Add `bootleggertechnical.coffee` in Vercel → Domain Settings
4. Add DNS records in GoDaddy:
   ```
   A     @     76.76.21.21
   CNAME www   cname.vercel-dns.com
   ```

### Pushing updates
```bash
git add .
git commit -m "describe what changed"
git push
```
Vercel auto-deploys within ~45 seconds.

---

## Updating Data

All data is in **`src/data.js`**. Key exports:

| Export | What it controls |
|--------|-----------------|
| `STATS` | Dashboard headline numbers |
| `ASSETS` | All stores — service dates, machines, status |
| `GROUPS` | Group totals (BHO, Franchised, Wholesale) |
| `HISTORY_BY_YEAR` | Annual record counts for bar chart |
| `ACTIVITY_12_MONTHS` | Monthly activity chart |
| `SERVICE_RECORDS` | Individual service/repair records |
| `SELF_HELP_GUIDES` | Step-by-step maintenance guides |
| `USERS` | Technician list |
| `CALLOUTS` | Active callouts (in-memory only) |

### Asset status values
- `"overdue"` — next service date has passed
- `"due-soon"` — next service within 30 days
- `"ok"` — on schedule
- `"unknown"` — no service date set

---

## Pending / Future Work

- [ ] Backend persistence for callouts (Supabase recommended)
- [ ] Authentication / PIN lock
- [ ] Wholesale store asset data
- [ ] Fill in machine data for 12 unscheduled franchised stores
- [ ] PWA manifest for Add to Home Screen
- [ ] Push notifications for overdue stores

---

## Brand

- Primary gold: `#c9a84c`
- Background: `#0a0a0a`
- Accent orange: `#f59c0a`
- Font display: Rajdhani
- Font logo: Playfair Display

---

*Bootlegger Technical — bootleggertechnical.coffee*
