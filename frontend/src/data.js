// ============================================================
// BOOTLEGGER ASSET TRACKER — DATA STORE
// Generated from: Coffee_Machine_Service_Schedule_-_BHO.xlsx
//   + Bootlegger_up_to_date.csv + Bootlegger_up_2024.csv
//   + Tech reports (AND, C, D, IF, MD, Sergio, Tyron, ZAR)
// Data as at: 13 March 2026
// ============================================================

export const APP_CONFIG = {
  companyName: "BOOTLEGGER",
  appName: "ASSET TRACKER",
  recordsSince: 2018,
  userInitial: "A",
};

// ── REAL STATS (from source data) ─────────────────────────
export const STATS = {
  totalAssets: 60,      // physical machines + grinders across all stores
  totalRecords: 1198,   // unique invoices across all CSV files, deduplicated
  activeCallouts: 0,
  overdueAssets: 18,    // stores with overdue next-service date
  dueSoon: 9,           // stores with next service within 30 days
};

// ── GROUPS (records by technician team) ───────────────────
export const GROUPS = [
  { id: "wcbho",        name: "WC BHO",        color: "#3b82f6", totalRecords: 343, services: 287, repairs: 56 },
  { id: "wcfranchised", name: "WC Franchised",  color: "#f59c0a", totalRecords: 552, services: 458, repairs: 94 },
  { id: "wholesale",    name: "Wholesale",      color: "#10b981", totalRecords: 194, services: 181, repairs: 13 },
];

// ── TECHNICIANS ────────────────────────────────────────────
export const TECHNICIANS = [
  { code: "C",      name: "Tech C",       records: 321, group: "WC BHO" },
  { code: "ZAR",    name: "Tech ZAR",     records: 309, group: "WC Franchised" },
  { code: "IF",     name: "Tech IF",      records: 182, group: "WC Franchised" },
  { code: "AND",    name: "Tech AND",     records: 64,  group: "WC Franchised" },
  { code: "D",      name: "Tech D",       records: 75,  group: "WC Franchised" },
  { code: "Sergio", name: "Sergio",       records: 28,  group: "WC Franchised" },
  { code: "MD",     name: "Tech MD",      records: 22,  group: "WC BHO" },
  { code: "Tyron",  name: "Tyron",        records: 2,   group: "WC Franchised" },
  { code: "W",      name: "Wholesale",    records: 194, group: "Wholesale" },
];

// ── FULL HISTORY 2018–2026 (from deduplicated CSV data) ───
export const HISTORY_BY_YEAR = [
  { year: "2018", count: 3,   isRecent: false },
  { year: "2019", count: 1,   isRecent: false },
  { year: "2020", count: 42,  isRecent: false },
  { year: "2021", count: 130, isRecent: false },
  { year: "2022", count: 178, isRecent: false },
  { year: "2023", count: 223, isRecent: false },
  { year: "2024", count: 306, isRecent: true  },
  { year: "2025", count: 274, isRecent: true  },
  { year: "2026", count: 41,  isRecent: true  },
];

// ── ACTIVITY — LAST 12 MONTHS (from CSV records) ──────────
export const ACTIVITY_12_MONTHS = [
  { month: "Apr\n25", count: 22 },
  { month: "May\n25", count: 25 },
  { month: "Jun\n25", count: 19 },
  { month: "Jul\n25", count: 27 },
  { month: "Aug\n25", count: 34 },
  { month: "Sep\n25", count: 14 },
  { month: "Oct\n25", count: 11 },
  { month: "Nov\n25", count: 18 },
  { month: "Dec\n25", count: 21 },
  { month: "Jan\n26", count: 20 },
  { month: "Feb\n26", count: 17 },
  { month: "Mar\n26", count: 4  },
];

// ── ASSETS / STORES ────────────────────────────────────────
// Source: Coffee_Machine_Service_Schedule_-_BHO.xlsx
// Columns: name, group, last service, next service, machines, grinders, CASMs
// Status: "overdue" = next_service < today | "due-soon" = within 30 days | "ok"
export const ASSETS = [

  // ── WC BHO — FULL STORES ──────────────────────────────
  {
    id: "A001", name: "Bakoven", group: "WC BHO", type: "Full Store",
    lastService: "2025-10-09", lastServiceRef: "INV0005637",
    nextService: "2026-01-15", status: "overdue", daysOverdue: 57,
    machine1: "Nouva Simonelli II 2grp", casm1: "B01034",
    grinder1: "Mythos 1", gcasm1: "B01038",
    grinder2: "SanRemo manual", gcasm2: "B01030",
  },
  {
    id: "A002", name: "Greenpoint", group: "WC BHO", type: "Full Store",
    lastService: "2025-10-27", lastServiceRef: "INV0005799",
    nextService: "2026-04-10", status: "due-soon", daysOverdue: 0,
    machine1: "Nouva Simonelli II 3grp", casm1: "478822",
    grinder1: "MDX-S", grinder2: "MDX-S",
  },
  {
    id: "A003", name: "Bree Street", group: "WC BHO", type: "Full Store",
    lastService: "2025-07-18", lastServiceRef: "INV0004907",
    nextService: "2025-11-18", status: "overdue", daysOverdue: 115,
    machine1: "Nouva Simonelli II 2grp",
    grinder1: "Mythos 1", grinder2: "SanRemo manual",
  },
  {
    id: "A004", name: "Harrington Street", group: "WC BHO", type: "Full Store",
    lastService: "2025-01-20", lastServiceRef: "INV0003208",
    nextService: "2025-05-20", status: "overdue", daysOverdue: 297,
    machine1: "Nouva Simonelli II 3grp",
    grinder1: "Mythos 1", grinder2: "SanRemo manual",
  },
  {
    id: "A005", name: "Claremont", group: "WC BHO", type: "Full Store",
    lastService: "2025-07-25", lastServiceRef: "INV0004962",
    nextService: "2025-11-25", status: "overdue", daysOverdue: 108,
    machine1: "Nouva Simonelli II 3grp", casm2: "B01021",
    grinder1: "Mythos 1", gcasm1: "B01025",
    grinder2: "MDX-S", gcasm2: "B01029",
  },
  {
    id: "A006", name: "Ndabeni", group: "WC BHO", type: "Full Store",
    lastService: "2025-01-17", lastServiceRef: "INV0003187",
    nextService: "2026-02-10", status: "overdue", daysOverdue: 31,
    machine1: "Nouva Simonelli Aurelia 2 V 2grp",
    grinder1: "Mahlkonig E65W GbS", gcasm1: "B00020",
    grinder2: "MDX-S",
  },
  {
    id: "A007", name: "Tokai", group: "WC BHO", type: "Full Store",
    lastService: "2025-04-11", lastServiceRef: "INV0003986",
    nextService: "2026-02-23", status: "overdue", daysOverdue: 18,
    machine1: "Nouva Simonelli Aurelia Wave 2grp",
    machine2: "Nouva Simonelli Aurelia Wave 2grp",
    grinder1: "Mythos 1", grinder2: "MDX-S",
  },
  {
    id: "A008", name: "Kalk Bay", group: "WC BHO", type: "Full Store",
    lastService: "2025-07-04", lastServiceRef: "INV0004744",
    nextService: "2026-03-12", status: "overdue", daysOverdue: 1,
    machine1: "Nouva Simonelli old Aurelia 2grp",
    grinder1: "Mythos 1", grinder2: "Anfim sp 1",
  },
  {
    id: "A009", name: "Canal Walk", group: "WC BHO", type: "Full Store",
    lastService: "2025-10-27", lastServiceRef: "INV0005798",
    nextService: "2026-03-17", status: "due-soon", daysOverdue: 0,
    machine1: "Nouva Simonelli Aurelia Wave 2grp",
    machine2: "Nouva Simonelli Aurelia Wave 2grp",
    grinder1: "Mythos MyOne", grinder2: "MDX-S x2", grinder3: "Mythos MyOne",
  },
  {
    id: "A010", name: "Kenilworth", group: "WC BHO", type: "Full Store",
    lastService: "2025-12-04", lastServiceRef: "INV0006164",
    nextService: "2026-04-04", status: "due-soon", daysOverdue: 0,
    machine1: "Nouva Simonelli II 3grp",
    grinder1: "Mythos My75", grinder2: "SanRemo manual",
  },
  {
    id: "A011", name: "Rockpool", group: "WC BHO", type: "Full Store",
    lastService: "2025-05-21", lastServiceRef: "INV0004355",
    nextService: "2026-04-20", status: "ok", daysOverdue: 0,
    machine1: "Nouva Simonelli Appia Life V 2grp",
    grinder1: "Mythos 1",
  },

  // ── WC BHO — XS STORES ────────────────────────────────
  {
    id: "A012", name: "Salt River", group: "WC BHO", type: "XS Store",
    lastService: "2025-01-17", lastServiceRef: "INV0003185",
    nextService: "2026-03-09", status: "overdue", daysOverdue: 4,
    machine1: "Nouva Simonelli II 2grp", casm1: "B01009",
    grinder1: "Mythos 1", gcasm1: "B01013",
    grinder2: "SanRemo manual",
  },
  {
    id: "A013", name: "Foreshore", group: "WC BHO", type: "XS Store",
    lastService: "2025-01-20", lastServiceRef: "INV0003212",
    nextService: "2025-05-20", status: "overdue", daysOverdue: 297,
    machine1: "Nouva Simonelli Aurelia Wave 2grp", casm1: "B01006",
    grinder1: "Mythos My75", grinder2: "MDX-S",
  },
  {
    id: "A014", name: "Pineworx", group: "WC BHO", type: "XS Store",
    lastService: "2025-08-19", lastServiceRef: "INV0005210",
    nextService: "2026-04-16", status: "ok", daysOverdue: 0,
    machine1: "Nouva Simonelli Aurelia Wave 2grp",
    grinder1: "Mythos My75", grinder2: "MDX-S",
  },
  {
    id: "A015", name: "Paardevlei", group: "WC BHO", type: "XS Store",
    lastService: "2025-08-18", lastServiceRef: "INV0005180",
    nextService: "2026-02-16", status: "overdue", daysOverdue: 25,
    machine1: "Nouva Simonelli Aurelia Wave 2grp",
    grinder1: "Mythos My75", grinder2: "MDX-S",
  },
  {
    id: "A016", name: "Muizenberg", group: "WC BHO", type: "XS Store",
    lastService: "2025-08-22", lastServiceRef: "INV0005251",
    nextService: "2026-01-19", status: "overdue", daysOverdue: 53,
    machine1: "Nouva Simonelli II 2grp",
    grinder1: "Mythos 1", grinder2: "SanRemo manual",
  },

  // ── WC BHO — NON-SCHEDULED ────────────────────────────
  {
    id: "A017", name: "St Cyprian", group: "WC BHO", type: "School",
    lastService: "2025-02-11", lastServiceRef: "INV0003442",
    nextService: null, status: "ok", daysOverdue: 0,
    machine1: "Nouva Simonelli Aurelia Wave 2grp",
    machine2: "Monroc 2grp & Appia Life 2grp",
    grinder1: "Mythos 1", grinder2: "Anfim sp 1", grinder3: "Hey Buddy grinder",
  },
  {
    id: "A018", name: "Westlake", group: "WC BHO", type: "XS Store",
    lastService: "2025-02-24", lastServiceRef: "INV0003562",
    nextService: null, status: "ok", daysOverdue: 0,
    machine1: "Nouva Simonelli Aurelia 2 V 2grp",
    grinder1: "Mythos MyOne", grinder2: "MDX-S",
  },
  {
    id: "A019", name: "Beach Road", group: "WC BHO", type: "XS Store",
    lastService: "2026-02-26", lastServiceRef: "INV0006860",
    nextService: null, status: "ok", daysOverdue: 0,
    machine1: "Nouva Simonelli Appia Life 2grp",
    grinder1: "MDX-S",
  },

  // ── WC FRANCHISED — FULL STORES ───────────────────────
  {
    id: "A020", name: "Dean Street Arcade", group: "WC Franchised", type: "Full Store",
    lastService: "2025-11-20", lastServiceRef: "JCIH00090",
    nextService: "2026-03-20", status: "due-soon", daysOverdue: 0,
    machine1: "Nuova Simonelli Aurelia Wave 2grp",
    grinder1: "Nuova Simonelli Mythos I",
  },
  {
    id: "A021", name: "Drakenstein", group: "WC Franchised", type: "Full Store",
    lastService: "2025-12-17", lastServiceRef: "JCIH00019",
    nextService: "2026-04-17", status: "ok", daysOverdue: 0,
    machine1: "Nuova Simonelli Aurelia Wave 2grp",
    grinder1: "Nuova Simonelli Mythos I", gcasm1: "RC0012128066875",
  },
  {
    id: "A022", name: "Rosmead", group: "WC Franchised", type: "Full Store",
    lastService: "2025-05-09", lastServiceRef: "JCT00127",
    nextService: "2025-09-09", status: "overdue", daysOverdue: 185,
    machine1: "Nuova Simonelli Aurelia Wave 3grp", casm1: "681534",
    grinder1: "Nuova Simonelli Mythos I",
  },
  {
    id: "A023", name: "Somerset West", group: "WC Franchised", type: "Full Store",
    lastService: "2025-11-20", lastServiceRef: "JCT00275",
    nextService: "2026-03-20", status: "due-soon", daysOverdue: 0,
    machine1: "Nuova Simonelli Aurelia Wave 2grp",
    grinder1: "Nuova Simonelli Mythos I",
  },
  {
    id: "A024", name: "Cape Quarter", group: "WC Franchised", type: "Full Store",
    lastService: "2026-01-14", lastServiceRef: "JCL00305",
    nextService: "2026-05-14", status: "ok", daysOverdue: 0,
  },
  {
    id: "A025", name: "Gardens", group: "WC Franchised", type: "Full Store",
    lastService: "2025-12-12", lastServiceRef: "JCIH00006",
    nextService: "2026-04-12", status: "due-soon", daysOverdue: 0,
  },
  {
    id: "A026", name: "Century City", group: "WC Franchised", type: "Full Store",
    lastService: "2026-01-15", lastServiceRef: "JCIH00039",
    nextService: "2026-05-15", status: "ok", daysOverdue: 0,
  },
  {
    id: "A027", name: "Table Bay", group: "WC Franchised", type: "Full Store",
    lastService: "2026-02-06", lastServiceRef: "JCT00330",
    nextService: "2026-06-06", status: "ok", daysOverdue: 0,
  },
  {
    id: "A028", name: "Vredehoek", group: "WC Franchised", type: "Full Store",
    lastService: "2026-02-20", lastServiceRef: "JCA00327",
    nextService: "2026-06-20", status: "ok", daysOverdue: 0,
  },
  {
    id: "A029", name: "Three Anchor Bay", group: "WC Franchised", type: "Full Store",
    lastService: "2026-02-20", lastServiceRef: "JCA00329",
    nextService: "2026-06-20", status: "ok", daysOverdue: 0,
    machine1: "Nuova Simonelli Aurelia ii 2grp", casm1: "452093",
    grinder1: "Sanremo SRATN", gcasm1: "T080200000000385",
  },
  {
    id: "A030", name: "Aquarium", group: "WC Franchised", type: "Full Store",
    lastService: "2026-02-17", lastServiceRef: "JCA00313",
    nextService: "2026-06-17", status: "ok", daysOverdue: 0,
    machine1: "Nuova Simonelli Appia I 3grp", casm1: "661669",
    machine2: "Nuova Simonelli Aurelia Wave 2grp", casm2: "712276",
    grinder1: "Nuova Simonelli Mythos 2", gcasm1: "RC0012142069034",
  },
  {
    id: "A031", name: "Stellenbosch", group: "WC Franchised", type: "Full Store",
    lastService: "2026-03-10", lastServiceRef: "INV0006923",
    nextService: "2026-07-10", status: "ok", daysOverdue: 0,
    machine1: "Nuova Simonelli Aurelia ii 3grp",
    grinder1: "Nuova Simonelli Mythos 1",
  },
  {
    id: "A032", name: "Gordon's Bay", group: "WC Franchised", type: "Full Store",
    lastService: "2025-11-20", lastServiceRef: "INV0006010",
    nextService: "2026-03-20", status: "due-soon", daysOverdue: 0,
    machine1: "Nuova Simonelli Aurelia Wave 2grp", casm1: "712304",
    grinder1: "Victoria Arduino Mythos MY75G", gcasm1: "N20012148000171",
  },
  {
    id: "A033", name: "Clara Anna", group: "WC Franchised", type: "Full Store",
    lastService: "2026-02-09", lastServiceRef: "INV0006672",
    nextService: "2026-06-09", status: "ok", daysOverdue: 0,
    machine1: "Nuova Simonelli Aurelia Wave 3grp", casm1: "661669",
    grinder1: "Nuova Simonelli MY75", gcasm1: "10072310001229",
  },
  {
    id: "A034", name: "Franschhoek", group: "WC Franchised", type: "Full Store",
    lastService: "2026-03-12", lastServiceRef: "INV0006934",
    nextService: "2026-07-12", status: "ok", daysOverdue: 0,
    machine1: "Nuova Simonelli Aurelia Wave 2grp", casm1: "712290",
    grinder1: "Nuova Simonelli Mythos MY75", gcasm1: "N10072310001233",
  },
  {
    id: "A035", name: "Blouberg", group: "WC Franchised", type: "Full Store",
    lastService: "2025-12-17", lastServiceRef: "INV0006281",
    nextService: "2026-04-17", status: "ok", daysOverdue: 0,
  },
  {
    id: "A036", name: "Durbanville", group: "WC Franchised", type: "Full Store",
    lastService: "2025-11-20", lastServiceRef: "INV0006011",
    nextService: "2026-03-20", status: "due-soon", daysOverdue: 0,
  },
  {
    id: "A037", name: "Frater Square", group: "WC Franchised", type: "Full Store",
    lastService: "2025-12-19", lastServiceRef: "INV0006277",
    nextService: "2026-04-19", status: "ok", daysOverdue: 0,
  },
  {
    id: "A038", name: "Hout Bay", group: "WC Franchised", type: "Full Store",
    lastService: "2025-08-19", lastServiceRef: "INV0005207",
    nextService: "2025-12-19", status: "overdue", daysOverdue: 84,
  },
  {
    id: "A039", name: "Sandown Retail Crossing", group: "WC Franchised", type: "Full Store",
    lastService: "2026-01-20", lastServiceRef: "INV0006494",
    nextService: "2026-05-20", status: "ok", daysOverdue: 0,
  },
  {
    id: "A040", name: "Bridgewater", group: "WC Franchised", type: "Full Store",
    lastService: "2025-09-29", lastServiceRef: "INV0005537",
    nextService: "2026-01-29", status: "overdue", daysOverdue: 43,
  },
  {
    id: "A041", name: "112 Kloof Street", group: "WC Franchised", type: "Full Store",
    lastService: "2026-02-27", lastServiceRef: "INV0006833",
    nextService: "2026-06-27", status: "ok", daysOverdue: 0,
  },
  {
    id: "A042", name: "Woodstock Quarter", group: "WC Franchised", type: "Full Store",
    lastService: "2025-09-22", lastServiceRef: "INV0005473",
    nextService: "2026-01-22", status: "overdue", daysOverdue: 50,
    machine1: "Nuova Simonelli Aurelia ii 2grp", casm1: "542437",
  },
  {
    id: "A043", name: "Point Mall", group: "WC Franchised", type: "Full Store",
    lastService: "2025-07-08", lastServiceRef: "INV0004804",
    nextService: "2025-11-08", status: "overdue", daysOverdue: 125,
  },

  // ── WC FRANCHISED — XS STORES ─────────────────────────
  {
    id: "A044", name: "Sea Point XS", group: "WC Franchised", type: "XS Store",
    lastService: "2026-02-27", lastServiceRef: "JCA00338",
    nextService: "2026-06-27", status: "ok", daysOverdue: 0,
  },
  {
    id: "A045", name: "V&A Waterfront XS", group: "WC Franchised", type: "XS Store",
    lastService: "2026-02-17", lastServiceRef: "JCA00311",
    nextService: "2026-06-17", status: "ok", daysOverdue: 0,
  },
  {
    id: "A046", name: "Grandwest XS", group: "WC Franchised", type: "XS Store",
    lastService: "2026-02-04", lastServiceRef: "JCL00337",
    nextService: "2026-06-04", status: "ok", daysOverdue: 0,
    machine1: "Nuova Simonelli", casm1: "712348",
  },
  {
    id: "A047", name: "Brackenfell XS", group: "WC Franchised", type: "XS Store",
    lastService: "2025-11-20", lastServiceRef: "JCT00272",
    nextService: "2026-03-20", status: "due-soon", daysOverdue: 0,
  },
  {
    id: "A048", name: "N1 City XS", group: "WC Franchised", type: "XS Store",
    lastService: "2025-03-19", lastServiceRef: "JCA00134",
    nextService: "2025-07-19", status: "overdue", daysOverdue: 237,
  },
  {
    id: "A049", name: "Cape Gate XS", group: "WC Franchised", type: "XS Store",
    lastService: "2025-12-17", lastServiceRef: "INV0006280",
    nextService: "2026-04-17", status: "ok", daysOverdue: 0,
  },
  {
    id: "A050", name: "Eikestad XS", group: "WC Franchised", type: "XS Store",
    lastService: "2025-05-09", lastServiceRef: "INV0005523",
    nextService: "2025-09-09", status: "overdue", daysOverdue: 185,
    machine1: "Nuova Simonelli Aurelia Wave 2grp",
    grinder1: "Nuova Simonelli Mythos 1", gcasm1: "RC0012128066874",
  },
  {
    id: "A051", name: "Brooklyn Junction XS", group: "WC Franchised", type: "XS Store",
    lastService: "2026-02-17", lastServiceRef: "INV0006753",
    nextService: "2026-06-17", status: "ok", daysOverdue: 0,
  },

  // ── WC FRANCHISED — NOT YET SCHEDULED ─────────────────
  { id: "A052", name: "Plattekloof Village",       group: "WC Franchised", type: "Full Store", lastService: null, nextService: null, status: "ok", daysOverdue: 0 },
  { id: "A053", name: "Strand Beach Road",          group: "WC Franchised", type: "Full Store", lastService: null, nextService: null, status: "ok", daysOverdue: 0 },
  { id: "A054", name: "Meadowridge Park n Shop",    group: "WC Franchised", type: "Full Store", lastService: null, nextService: null, status: "ok", daysOverdue: 0 },
  { id: "A055", name: "Courtenay Street George",    group: "WC Franchised", type: "Full Store", lastService: null, nextService: null, status: "ok", daysOverdue: 0 },
  { id: "A056", name: "Hartenbos",                  group: "WC Franchised", type: "Full Store", lastService: null, nextService: null, status: "ok", daysOverdue: 0 },
  { id: "A057", name: "Yellowwoods Centre",         group: "WC Franchised", type: "Full Store", lastService: null, nextService: null, status: "ok", daysOverdue: 0 },
  { id: "A058", name: "Milkwood Square",            group: "WC Franchised", type: "Full Store", lastService: null, nextService: null, status: "ok", daysOverdue: 0 },
  { id: "A059", name: "Somerset Mall",              group: "WC Franchised", type: "Full Store", lastService: null, nextService: null, status: "ok", daysOverdue: 0 },
  { id: "A060", name: "Laguna Mall XS",             group: "WC Franchised", type: "XS Store",   lastService: null, nextService: null, status: "ok", daysOverdue: 0 },
  { id: "A061", name: "N1 City Kiosk",              group: "WC Franchised", type: "Kiosk",       lastService: null, nextService: null, status: "ok", daysOverdue: 0 },
  { id: "A062", name: "Hermanus Kiosk",             group: "WC Franchised", type: "Kiosk",       lastService: null, nextService: null, status: "ok", daysOverdue: 0 },
  { id: "A063", name: "Paarl Mall",                 group: "WC Franchised", type: "Full Store", lastService: null, nextService: null, status: "ok", daysOverdue: 0 },
];

// ── ACTIVE CALLOUTS ────────────────────────────────────────
// Populate when callouts are raised
export const CALLOUTS = [];

// ── SERVICE RECORDS (from WC Franchised History sheet) ────
// Source: WC Franchised - History tab in service schedule xlsx
export const SERVICE_RECORDS = [
  // Dean Street Arcade
  { id: "R001", assetId: "A020", assetName: "Dean Street Arcade", location: "Dean Street Arcade", group: "WC Franchised", type: "Service", jobCard: "JC03048", invoice: "INV0001041", date: "2024-06-11", notes: "Service Run for June 2024", technician: "AND" },
  { id: "R002", assetId: "A020", assetName: "Dean Street Arcade", location: "Dean Street Arcade", group: "WC Franchised", type: "Service", jobCard: "JC04154", invoice: "INV0002299", date: "2024-10-11", notes: "Service Run for October", technician: "AND" },
  { id: "R003", assetId: "A020", assetName: "Dean Street Arcade", location: "Dean Street Arcade", group: "WC Franchised", type: "Service", jobCard: "JCA00115", invoice: "INV0003699", date: "2025-03-10", notes: "Service Run for February", technician: "AND" },
  { id: "R004", assetId: "A020", assetName: "Dean Street Arcade", location: "Dean Street Arcade", group: "WC Franchised", type: "Service", jobCard: "JCT00218", invoice: "INV0004801", date: "2025-07-08", notes: "Service Run for July 2025", technician: "AND" },
  { id: "R005", assetId: "A020", assetName: "Dean Street Arcade", location: "Dean Street Arcade", group: "WC Franchised", type: "Service", jobCard: "JCIH00090", invoice: "INV0006015", date: "2025-11-20", notes: "Service Run NOV 2025", technician: "AND" },
  // Drakenstein
  { id: "R006", assetId: "A021", assetName: "Drakenstein", location: "Drakenstein", group: "WC Franchised", type: "Service", invoice: "INV0000315", date: "2024-04-04", notes: "Service Run for April 2024", technician: "AND" },
  { id: "R007", assetId: "A021", assetName: "Drakenstein", location: "Drakenstein", group: "WC Franchised", type: "Service", jobCard: "JC03932", invoice: "INV0001967", date: "2024-09-11", notes: "Service Run for Aug 2024", technician: "AND" },
  { id: "R008", assetId: "A021", assetName: "Drakenstein", location: "Drakenstein", group: "WC Franchised", type: "Service", jobCard: "JC04473", invoice: "INV0003161", date: "2025-01-16", notes: "Service Run for January", technician: "AND" },
  { id: "R009", assetId: "A021", assetName: "Drakenstein", location: "Drakenstein", group: "WC Franchised", type: "Service", jobCard: "JCT00138", invoice: "INV0004315", date: "2025-05-15", notes: "Service", technician: "AND" },
  { id: "R010", assetId: "A021", assetName: "Drakenstein", location: "Drakenstein", group: "WC Franchised", type: "Service", jobCard: "JCM00116", invoice: "INV0005321", date: "2025-08-28", notes: "Service", technician: "AND" },
  { id: "R011", assetId: "A021", assetName: "Drakenstein", location: "Drakenstein", group: "WC Franchised", type: "Service", jobCard: "JCIH00019", invoice: "INV0006276", date: "2025-12-17", notes: "Service December 2025", technician: "AND" },
  { id: "R012", assetId: "A021", assetName: "Drakenstein", location: "Drakenstein", group: "WC Franchised", type: "Repair", invoice: "INV0006544", date: "2026-01-26", notes: "Call Out", technician: "AND" },
  // Rosmead
  { id: "R013", assetId: "A022", assetName: "Rosmead", location: "Rosmead", group: "WC Franchised", type: "Service", jobCard: "JC03903", invoice: "INV0001683", date: "2024-08-19", notes: "Service Run for June 2024", technician: "AND" },
  { id: "R014", assetId: "A022", assetName: "Rosmead", location: "Rosmead", group: "WC Franchised", type: "Repair",  jobCard: "JC03978", invoice: "INV0002054", date: "2024-09-18", notes: "Repair", technician: "AND" },
  { id: "R015", assetId: "A022", assetName: "Rosmead", location: "Rosmead", group: "WC Franchised", type: "Repair",  jobCard: "JC04098", invoice: "INV0002404", date: "2024-10-21", notes: "Repair", technician: "AND" },
  { id: "R016", assetId: "A022", assetName: "Rosmead", location: "Rosmead", group: "WC Franchised", type: "Service", jobCard: "JC04487", invoice: "INV0003221", date: "2025-01-21", notes: "Service Run for December", technician: "AND" },
  { id: "R017", assetId: "A022", assetName: "Rosmead", location: "Rosmead", group: "WC Franchised", type: "Service", jobCard: "JCT00127", invoice: "INV0004246", date: "2025-05-09", notes: "Service Run for May", technician: "AND" },
  { id: "R018", assetId: "A022", assetName: "Rosmead", location: "Rosmead", group: "WC Franchised", type: "Repair",  jobCard: "JCA00194", invoice: "INV0004482", date: "2025-06-05", notes: "Repairs", technician: "AND" },
  { id: "R019", assetId: "A022", assetName: "Rosmead", location: "Rosmead", group: "WC Franchised", type: "Repair",  jobCard: "JCA00200", invoice: "INV0004522", date: "2025-06-11", notes: "Repair", technician: "AND" },
  { id: "R020", assetId: "A022", assetName: "Rosmead", location: "Rosmead", group: "WC Franchised", type: "Repair",  jobCard: "JCL00079", invoice: "INV0005211", date: "2025-08-19", notes: "Repair", technician: "AND" },
  // BHO — Bakoven
  { id: "R021", assetId: "A001", assetName: "Bakoven", location: "Bakoven", group: "WC BHO", type: "Service", invoice: "INV0005637", date: "2025-10-09", notes: "Service", technician: "C" },
  // BHO — Greenpoint
  { id: "R022", assetId: "A002", assetName: "Greenpoint", location: "Greenpoint", group: "WC BHO", type: "Service", invoice: "INV0005799", date: "2025-10-27", notes: "Service", technician: "C" },
  // BHO — Bree Street
  { id: "R023", assetId: "A003", assetName: "Bree Street", location: "Bree Street", group: "WC BHO", type: "Service", invoice: "INV0004907", date: "2025-07-18", notes: "Service", technician: "C" },
  // BHO — Harrington
  { id: "R024", assetId: "A004", assetName: "Harrington Street", location: "Harrington Street", group: "WC BHO", type: "Service", invoice: "INV0003208", date: "2025-01-20", notes: "Service", technician: "C" },
  // BHO — Claremont
  { id: "R025", assetId: "A005", assetName: "Claremont", location: "Claremont", group: "WC BHO", type: "Service", invoice: "INV0004962", date: "2025-07-25", notes: "Service", technician: "C" },
  // BHO — Canal Walk
  { id: "R026", assetId: "A009", assetName: "Canal Walk", location: "Canal Walk", group: "WC BHO", type: "Service", invoice: "INV0005798", date: "2025-10-27", notes: "Service", technician: "C" },
  // BHO — Kenilworth
  { id: "R027", assetId: "A010", assetName: "Kenilworth", location: "Kenilworth", group: "WC BHO", type: "Service", invoice: "INV0006164", date: "2025-12-04", notes: "Service", technician: "Sergio" },
  // BHO — Rockpool
  { id: "R028", assetId: "A011", assetName: "Rockpool", location: "Rockpool", group: "WC BHO", type: "Service", invoice: "INV0004355", date: "2025-05-21", notes: "Service", technician: "C" },
  // BHO — Muizenberg
  { id: "R029", assetId: "A016", assetName: "Muizenberg", location: "Muizenberg", group: "WC BHO", type: "Service", invoice: "INV0005251", date: "2025-08-22", notes: "Service", technician: "C" },
  // BHO — Pineworx
  { id: "R030", assetId: "A014", assetName: "Pineworx", location: "Pineworx", group: "WC BHO", type: "Service", invoice: "INV0005210", date: "2025-08-19", notes: "Service", technician: "C" },
  // BHO — Paardevlei
  { id: "R031", assetId: "A015", assetName: "Paardevlei", location: "Paardevlei", group: "WC BHO", type: "Service", invoice: "INV0005180", date: "2025-08-18", notes: "Service", technician: "C" },
  // Franchised — Gordon's Bay
  { id: "R032", assetId: "A032", assetName: "Gordon's Bay", location: "Gordon's Bay", group: "WC Franchised", type: "Service", invoice: "INV0006010", date: "2025-11-20", notes: "Service", technician: "ZAR" },
  // Franchised — Stellenbosch
  { id: "R033", assetId: "A031", assetName: "Stellenbosch", location: "Stellenbosch", group: "WC Franchised", type: "Service", invoice: "INV0006923", date: "2026-03-10", notes: "Service", technician: "ZAR" },
  // Franchised — Clara Anna
  { id: "R034", assetId: "A033", assetName: "Clara Anna", location: "Clara Anna", group: "WC Franchised", type: "Service", invoice: "INV0006672", date: "2026-02-09", notes: "Service", technician: "IF" },
  // Franchised — Franschhoek
  { id: "R035", assetId: "A034", assetName: "Franschhoek", location: "Franschhoek", group: "WC Franchised", type: "Service", invoice: "INV0006934", date: "2026-03-12", notes: "Service", technician: "ZAR" },
  // Franchised — Somerset West
  { id: "R036", assetId: "A023", assetName: "Somerset West", location: "Somerset West", group: "WC Franchised", type: "Service", jobCard: "JCT00275", invoice: "INV0006011", date: "2025-11-20", notes: "Service", technician: "AND" },
  // Beach Road
  { id: "R037", assetId: "A019", assetName: "Beach Road", location: "Beach Road", group: "WC BHO", type: "Service", invoice: "INV0006860", date: "2026-02-26", notes: "Service", technician: "C" },
  // Woodstock Quarter
  { id: "R038", assetId: "A042", assetName: "Woodstock Quarter", location: "Woodstock Quarter", group: "WC Franchised", type: "Service", invoice: "INV0005473", date: "2025-09-22", notes: "Service", technician: "IF" },
  // Eikestad
  { id: "R039", assetId: "A050", assetName: "Eikestad XS", location: "Eikestad XS", group: "WC Franchised", type: "Repair", invoice: "INV0005523", date: "2025-05-09", notes: "Repair", technician: "ZAR" },
];

// ── USERS ─────────────────────────────────────────────────
export const USERS = [
  { id: "U001", name: "Admin", initials: "A", role: "Administrator", status: "active", color: "#dc2626" },
  { id: "U002", name: "Tech C", initials: "TC", role: "Senior Tech — WC BHO", status: "active", color: "#3b82f6" },
  { id: "U003", name: "Tech ZAR", initials: "ZR", role: "Senior Tech — WC Franchised", status: "active", color: "#f59c0a" },
  { id: "U004", name: "Tech IF", initials: "IF", role: "Technician — WC Franchised", status: "active", color: "#8b5cf6" },
  { id: "U005", name: "Tech AND", initials: "AN", role: "Technician — WC Franchised", status: "active", color: "#10b981" },
  { id: "U006", name: "Tech D", initials: "TD", role: "Technician — WC Franchised", status: "active", color: "#06b6d4" },
  { id: "U007", name: "Sergio", initials: "SR", role: "Technician — WC BHO", status: "active", color: "#f97316" },
  { id: "U008", name: "Tech MD", initials: "MD", role: "Technician — WC BHO", status: "active", color: "#84cc16" },
  { id: "U009", name: "Tyron", initials: "TY", role: "Technician — WC Franchised", status: "active", color: "#ec4899" },
];

// ── SELF HELP GUIDES ──────────────────────────────────────
export const SELF_HELP_GUIDES = [
  {
    id: "G001", title: "Nouva Simonelli — Daily Cleaning", category: "Cleaning", icon: "brush",
    desc: "Daily backflush and group head cleaning for Aurelia / Appia machines.",
    steps: [
      "Remove portafilter and knock out grounds",
      "Insert blind filter with 1 Cafetto cleaning tablet",
      "Run 5 backflush cycles (10 sec on, 5 sec off each)",
      "Remove blind filter and rinse thoroughly under hot water",
      "Wipe group head gasket and shower screen with damp cloth",
      "Purge steam wands for 3 seconds and wipe clean",
      "Document cleaning in daily log"
    ]
  },
  {
    id: "G002", title: "Espresso Machine — Descaling", category: "Maintenance", icon: "droplet",
    desc: "Full descale procedure. Do not attempt without tech approval.",
    steps: [
      "Prepare descaling solution per manufacturer ratio",
      "Fill water tank with solution",
      "Run full descale cycle via machine menu",
      "Run 3 full rinse cycles with clean water",
      "Check all connections for leaks",
      "Log date and solution used in service notes"
    ]
  },
  {
    id: "G003", title: "Mythos Grinder — Daily & Weekly", category: "Cleaning", icon: "settings",
    desc: "Daily and weekly cleaning procedures for Mythos 1 / MyOne / MY75 grinders.",
    steps: [
      "Daily: brush out hopper and grinding chamber",
      "Daily: wipe exterior and dosing chute with dry cloth",
      "Weekly: remove and wash hopper with warm water (dry fully before replacing)",
      "Weekly: use grinder cleaning tablets through full cycle",
      "Weekly: vacuum out any residual grounds from base",
      "Monthly: check burr gap — report to tech if extraction time has drifted"
    ]
  },
  {
    id: "G004", title: "Nouva Simonelli — Pressure Check", category: "Inspection", icon: "zap",
    desc: "How to check and record extraction pressure. For monitoring only.",
    steps: [
      "Ensure machine is fully heated — minimum 20 minutes warm-up",
      "Dose and tamp portafilter as normal",
      "Insert portafilter and begin extraction",
      "Watch the pressure gauge during the shot",
      "Ideal range: 8.5–9.5 bar",
      "If outside range: do not adjust pump yourself — log a callout"
    ]
  },
  {
    id: "G005", title: "SanRemo — Steam Wand Care", category: "Cleaning", icon: "thermometer",
    desc: "Keeping the SanRemo manual steam wands clean and blockage-free.",
    steps: [
      "After every use: purge the wand for 2 seconds immediately",
      "Wipe wand immediately with a damp cloth while hot",
      "End of day: soak tip in hot water for 10 minutes",
      "Remove tip and clear any milk build-up with a pin or tip brush",
      "Reattach tip securely and test steam flow",
      "Report any blockages that don't clear to your technician"
    ]
  },
  {
    id: "G006", title: "Reporting a Fault / Raising a Callout", category: "Admin", icon: "clipboard",
    desc: "How to log a fault in the system and get a technician assigned.",
    steps: [
      "Go to the Callouts tab at the bottom of the screen",
      "Tap the orange + button",
      "Select the correct store and machine from the dropdown",
      "Describe the fault clearly — include any error codes shown",
      "Set priority: High = machine completely down, Medium = partial issue, Low = minor",
      "Submit — a technician will be assigned and you will be updated"
    ]
  },
  {
    id: "G007", title: "Water Filtration — Filter Check", category: "Maintenance", icon: "droplets",
    desc: "Checking water filtration status. Technician replaces filters.",
    steps: [
      "Check the filter replacement date sticker on the unit",
      "If overdue: log a callout for filter replacement",
      "Check water pressure gauge if fitted — report low pressure",
      "Do not disconnect or replace filtration units yourself",
      "Ensure bypass valve is in correct position — do not adjust"
    ]
  },
];
