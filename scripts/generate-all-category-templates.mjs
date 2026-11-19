/**
 * One landing HTML per opportunity category → public/templates/business-landing/{id}.html
 * Run: node scripts/generate-all-category-templates.mjs
 */
import { writeFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import path from "node:path";

const outDir = path.join(process.cwd(), "public", "templates", "business-landing");
mkdirSync(outDir, { recursive: true });

const CATEGORIES = [
  { id: "restaurants", label: "Restaurants", group: "Food & Hospitality" },
  { id: "cafes", label: "Cafes", group: "Food & Hospitality" },
  { id: "bakeries", label: "Bakeries", group: "Food & Hospitality" },
  { id: "bars", label: "Bars", group: "Food & Hospitality" },
  { id: "fast-food", label: "Fast food", group: "Food & Hospitality" },
  { id: "food-shops", label: "Food shops", group: "Food & Hospitality" },
  { id: "catering", label: "Catering", group: "Food & Hospitality" },
  { id: "doctors", label: "Doctors", group: "Healthcare" },
  { id: "dentists", label: "Dentists", group: "Healthcare" },
  { id: "clinics", label: "Clinics", group: "Healthcare" },
  { id: "hospitals", label: "Hospitals", group: "Healthcare" },
  { id: "physiotherapists", label: "Physiotherapists", group: "Healthcare" },
  { id: "pharmacies", label: "Pharmacies", group: "Healthcare" },
  { id: "diagnostic-centers", label: "Diagnostic centers", group: "Healthcare" },
  { id: "barbers", label: "Barbers", group: "Personal Care" },
  { id: "hair-salons", label: "Hair salons", group: "Personal Care" },
  { id: "beauty-salons", label: "Beauty salons", group: "Personal Care" },
  { id: "spas", label: "Spas", group: "Personal Care" },
  { id: "nail-studios", label: "Nail studios", group: "Personal Care" },
  { id: "grocery-stores", label: "Grocery stores", group: "Retail" },
  { id: "supermarkets", label: "Supermarkets", group: "Retail" },
  { id: "toy-shops", label: "Toy shops", group: "Retail" },
  { id: "clothing-stores", label: "Clothing stores", group: "Retail" },
  { id: "shoe-stores", label: "Shoe stores", group: "Retail" },
  { id: "electronics-shops", label: "Electronics shops", group: "Retail" },
  { id: "furniture-stores", label: "Furniture stores", group: "Retail" },
  { id: "gift-shops", label: "Gift shops", group: "Retail" },
  { id: "pet-shops", label: "Pet shops", group: "Retail" },
  { id: "hardware-stores", label: "Hardware stores", group: "Retail" },
  { id: "bookstores", label: "Bookstores", group: "Retail" },
  { id: "lawyers", label: "Lawyers", group: "Professional Services" },
  { id: "accountants", label: "Accountants", group: "Professional Services" },
  { id: "consultants", label: "Consultants", group: "Professional Services" },
  { id: "architects", label: "Architects", group: "Professional Services" },
  { id: "real-estate", label: "Real estate agencies", group: "Professional Services" },
  { id: "marketing-agencies", label: "Marketing agencies", group: "Professional Services" },
  { id: "gyms", label: "Gyms", group: "Fitness and Recreation" },
  { id: "yoga-studios", label: "Yoga studios", group: "Fitness and Recreation" },
  { id: "sports-academies", label: "Sports academies", group: "Fitness and Recreation" },
  { id: "dance-studios", label: "Dance studios", group: "Fitness and Recreation" },
  { id: "car-repair", label: "Car repair shops", group: "Automotive" },
  { id: "auto-dealers", label: "Auto dealers", group: "Automotive" },
  { id: "bike-repair", label: "Bike repair shops", group: "Automotive" },
  { id: "car-washes", label: "Car washes", group: "Automotive" },
  { id: "schools", label: "Schools", group: "Education" },
  { id: "coaching-centers", label: "Coaching centers", group: "Education" },
  { id: "training-institutes", label: "Training institutes", group: "Education" },
  { id: "tutors", label: "Tutors", group: "Education" },
  { id: "plumbers", label: "Plumbers", group: "Home Services" },
  { id: "electricians", label: "Electricians", group: "Home Services" },
  { id: "interior-designers", label: "Interior designers", group: "Home Services" },
  { id: "cleaning-services", label: "Cleaning services", group: "Home Services" },
  { id: "pest-control", label: "Pest control", group: "Home Services" },
  { id: "construction", label: "Construction companies", group: "Home Services" },
];

const U = (id, w = 1000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const GROUP_THEMES = {
  "Food & Hospitality": {
    fonts:
      "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@400;500;600;700&display=swap",
    display: "'Libre Baskerville', Georgia, serif",
    body: "'Source Sans 3', system-ui, sans-serif",
    ink: "#1c1410",
    inkSoft: "#3a2418",
    muted: "#6d5c50",
    line: "#e8ddd3",
    bg: "#faf6f1",
    surface: "#ffffff",
    accent: "#b84a2e",
    accent2: "#8f3520",
    accentSoft: "#f3e4dc",
    warm: "#f3e4dc",
    topbar: "rgba(250,246,241,0.88)",
    bodyBg:
      "radial-gradient(1000px 500px at 85% -5%, rgba(184,74,46,0.12), transparent 55%), #faf6f1",
    contact: "linear-gradient(145deg, #1c1410, #3a2418 55%, #5a3420)",
    shadow: "0 18px 50px rgba(28,20,16,0.10)",
    btnText: "#fff",
  },
  Healthcare: {
    fonts:
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Manrope:wght@400;500;600;700&display=swap",
    display: "Fraunces, Georgia, serif",
    body: "Manrope, system-ui, sans-serif",
    ink: "#0f2744",
    inkSoft: "#243b55",
    muted: "#5b6f86",
    line: "#d7e3ef",
    bg: "#f3f7fb",
    surface: "#ffffff",
    accent: "#1a6f8b",
    accent2: "#0e8f7a",
    accentSoft: "#e5f3f7",
    warm: "#f6efe6",
    topbar: "rgba(243,247,251,0.82)",
    bodyBg:
      "radial-gradient(1200px 600px at 90% -10%, rgba(26,111,139,0.12), transparent 55%), #f3f7fb",
    contact: "linear-gradient(145deg, #102a44, #1a6f8b 70%, #0e8f7a)",
    shadow: "0 18px 50px rgba(15,39,68,0.10)",
    btnText: "#fff",
  },
  "Personal Care": {
    fonts:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;700&family=Outfit:wght@400;500;600;700&display=swap",
    display: "'Cormorant Garamond', Georgia, serif",
    body: "Outfit, system-ui, sans-serif",
    ink: "#f4f1ea",
    inkSoft: "#e7e0d4",
    muted: "#a8a29a",
    line: "#2a241c",
    bg: "#111214",
    surface: "#1a1c20",
    accent: "#d4a373",
    accent2: "#c08b55",
    accentSoft: "#2a241c",
    warm: "#2a241c",
    topbar: "rgba(17,18,20,0.88)",
    bodyBg:
      "radial-gradient(1000px 500px at 90% -10%, rgba(212,163,115,0.18), transparent 55%), #111214",
    contact: "linear-gradient(145deg, #0b0b0c, #1c1a17 55%, #2b241c)",
    shadow: "0 18px 50px rgba(0,0,0,0.35)",
    btnText: "#111214",
  },
  Retail: {
    fonts:
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap",
    display: "'Space Grotesk', system-ui, sans-serif",
    body: "'IBM Plex Sans', system-ui, sans-serif",
    ink: "#14171c",
    inkSoft: "#243041",
    muted: "#5b6470",
    line: "#e2e6ec",
    bg: "#f3f5f8",
    surface: "#ffffff",
    accent: "#e4572e",
    accent2: "#c2410c",
    accentSoft: "#ffe3d8",
    warm: "#fff1ea",
    topbar: "rgba(243,245,248,0.88)",
    bodyBg:
      "radial-gradient(1000px 500px at 90% -10%, rgba(228,87,46,0.12), transparent 55%), #f3f5f8",
    contact: "linear-gradient(145deg, #14171c, #243041 60%, #e4572e)",
    shadow: "0 18px 50px rgba(20,23,28,0.10)",
    btnText: "#fff",
  },
  "Professional Services": {
    fonts:
      "https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,700&family=Figtree:wght@400;500;600;700&display=swap",
    display: "Newsreader, Georgia, serif",
    body: "Figtree, system-ui, sans-serif",
    ink: "#101828",
    inkSoft: "#1d2939",
    muted: "#667085",
    line: "#e4e7ec",
    bg: "#f6f7f9",
    surface: "#ffffff",
    accent: "#175cd3",
    accent2: "#1549a8",
    accentSoft: "#d1e0ff",
    warm: "#eef4ff",
    topbar: "rgba(246,247,249,0.9)",
    bodyBg:
      "radial-gradient(1000px 500px at 88% -8%, rgba(23,92,211,0.12), transparent 55%), #f6f7f9",
    contact: "linear-gradient(145deg, #0b1f3a, #163a66 60%, #175cd3)",
    shadow: "0 18px 50px rgba(16,24,40,0.08)",
    btnText: "#fff",
  },
  "Fitness and Recreation": {
    fonts:
      "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700&display=swap",
    display: "'Bebas Neue', Impact, sans-serif",
    body: "Barlow, system-ui, sans-serif",
    ink: "#f5f7fa",
    inkSoft: "#d7dde8",
    muted: "#9aa3b2",
    line: "#242a35",
    bg: "#0f1115",
    surface: "#171a21",
    accent: "#39ff14",
    accent2: "#22c55e",
    accentSoft: "#1d2a1a",
    warm: "#1d2a1a",
    topbar: "rgba(15,17,21,0.9)",
    bodyBg:
      "radial-gradient(900px 500px at 90% 0%, rgba(57,255,20,0.12), transparent 55%), #0f1115",
    contact: "linear-gradient(145deg, #0a0b0e, #151922 55%, #1d2430)",
    shadow: "0 18px 50px rgba(0,0,0,0.4)",
    btnText: "#0f1115",
  },
  Automotive: {
    fonts:
      "https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Inter:wght@400;500;600;700&display=swap",
    display: "Oswald, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
    ink: "#0f172a",
    inkSoft: "#1e293b",
    muted: "#64748b",
    line: "#dbe3ef",
    bg: "#f1f5f9",
    surface: "#ffffff",
    accent: "#f59e0b",
    accent2: "#d97706",
    accentSoft: "#fef3c7",
    warm: "#fffbeb",
    topbar: "rgba(241,245,249,0.9)",
    bodyBg:
      "radial-gradient(1000px 500px at 90% -8%, rgba(245,158,11,0.14), transparent 55%), #f1f5f9",
    contact: "linear-gradient(145deg, #0f172a, #1e293b 55%, #f59e0b)",
    shadow: "0 18px 50px rgba(15,23,42,0.10)",
    btnText: "#0f172a",
  },
  Education: {
    fonts:
      "https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,500;7..72,700&family=Karla:wght@400;500;600;700&display=swap",
    display: "Literata, Georgia, serif",
    body: "Karla, system-ui, sans-serif",
    ink: "#0f172a",
    inkSoft: "#1e293b",
    muted: "#64748b",
    line: "#dbeafe",
    bg: "#f8fafc",
    surface: "#ffffff",
    accent: "#0ea5e9",
    accent2: "#0284c7",
    accentSoft: "#e0f2fe",
    warm: "#f0f9ff",
    topbar: "rgba(248,250,252,0.9)",
    bodyBg:
      "radial-gradient(1000px 500px at 88% -8%, rgba(14,165,233,0.12), transparent 55%), #f8fafc",
    contact: "linear-gradient(145deg, #0f172a, #1e293b 55%, #0ea5e9)",
    shadow: "0 18px 50px rgba(15,23,42,0.08)",
    btnText: "#fff",
  },
  "Home Services": {
    fonts:
      "https://fonts.googleapis.com/css2?family=Sora:wght@500;700&family=Nunito+Sans:wght@400;500;600;700&display=swap",
    display: "Sora, system-ui, sans-serif",
    body: "'Nunito Sans', system-ui, sans-serif",
    ink: "#1a2118",
    inkSoft: "#2f4030",
    muted: "#5f6b5a",
    line: "#dce5d8",
    bg: "#f5f7f4",
    surface: "#ffffff",
    accent: "#2f6b3a",
    accent2: "#245530",
    accentSoft: "#dcead9",
    warm: "#e8f0e6",
    topbar: "rgba(245,247,244,0.9)",
    bodyBg:
      "radial-gradient(1000px 500px at 90% -8%, rgba(47,107,58,0.12), transparent 55%), #f5f7f4",
    contact: "linear-gradient(145deg, #1a2118, #2f4030 55%, #2f6b3a)",
    shadow: "0 18px 50px rgba(26,33,24,0.09)",
    btnText: "#fff",
  },
};

/** Category-specific specialty, services, demo name, images */
const CAT = {
  restaurants: {
    specialty: "Multi-cuisine dining",
    services: ["Dine-in favourites", "Easy location", "Call / takeaway"],
    demoName: "Spice Route Kitchen",
    images: [
      "photo-1414235077428-338989a2e8c0",
      "photo-1517248135467-4c7edcad34c4",
      "photo-1504674900247-0877df9cc836",
      "photo-1556910103-1c02745aae4d",
      "photo-1559339352-11d035aa65de",
      "photo-1414235077428-338989a2e8c0",
      "photo-1517248135467-4c7edcad34c4",
    ],
  },
  cafes: {
    specialty: "Coffee & light bites",
    services: ["Fresh coffee", "Work-friendly seats", "Takeaway cups"],
    demoName: "Bean & Co Cafe",
    images: [
      "photo-1495474472287-4d71bcdd2085",
      "photo-1501339847302-ac426a4a7cbb",
      "photo-1495474472287-4d71bcdd2085",
      "photo-1509042239860-f550ce710b93",
      "photo-1501339847302-ac426a4a7cbb",
      "photo-1509042239860-f550ce710b93",
      "photo-1495474472287-4d71bcdd2085",
    ],
  },
  bakeries: {
    specialty: "Fresh bread & pastries",
    services: ["Daily bakes", "Custom cakes", "Counter pickup"],
    demoName: "Crumb & Crust Bakery",
    images: [
      "photo-1509440159596-0249088772ff",
      "photo-1517433670267-08bbd4be890f",
      "photo-1509440159596-0249088772ff",
      "photo-1486427944299-d1955d23e34d",
      "photo-1555507036-ab1f4038808a",
      "photo-1517433670267-08bbd4be890f",
      "photo-1509440159596-0249088772ff",
    ],
  },
  bars: {
    specialty: "Evening drinks & bites",
    services: ["Signature drinks", "Late hours", "Group seating"],
    demoName: "Night Owl Bar",
    images: [
      "photo-1514933651103-005eec06c04b",
      "photo-1470337458703-46ad1756a187",
      "photo-1514933651103-005eec06c04b",
      "photo-1572116469696-31de0f17cc34",
      "photo-1470337458703-46ad1756a187",
      "photo-1514362545857-3bc16c4c7d1b",
      "photo-1514933651103-005eec06c04b",
    ],
  },
  "fast-food": {
    specialty: "Quick meals & takeaway",
    services: ["Fast counters", "Combo meals", "Phone orders"],
    demoName: "QuickBite Express",
    images: [
      "photo-1568901346375-23c9450c58cd",
      "photo-1571091718767-18b5b1457add",
      "photo-1568901346375-23c9450c58cd",
      "photo-1626082927389-6cd097cdc6ec",
      "photo-1571091718767-18b5b1457add",
      "photo-1568901346375-23c9450c58cd",
      "photo-1626082927389-6cd097cdc6ec",
    ],
  },
  "food-shops": {
    specialty: "Everyday groceries & snacks",
    services: ["Daily essentials", "Local pickup", "Listed hours"],
    demoName: "Neighbourhood Food Mart",
    images: [
      "photo-1542838132-92c53300491e",
      "photo-1604719312566-8912e9227c6a",
      "photo-1542838132-92c53300491e",
      "photo-1578916171728-46686eac8d58",
      "photo-1604719312566-8912e9227c6a",
      "photo-1542838132-92c53300491e",
      "photo-1578916171728-46686eac8d58",
    ],
  },
  catering: {
    specialty: "Event & bulk catering",
    services: ["Menu planning", "Event delivery", "Bulk orders"],
    demoName: "FeastCraft Catering",
    images: [
      "photo-1555244162-803834f70033",
      "photo-1414235077428-338989a2e8c0",
      "photo-1555244162-803834f70033",
      "photo-1414235077428-338989a2e8c0",
      "photo-1555244162-803834f70033",
      "photo-1414235077428-338989a2e8c0",
      "photo-1555244162-803834f70033",
    ],
  },
  doctors: {
    specialty: "General Physician",
    services: ["Consultation", "Specialty care", "Easy contact"],
    demoName: "Dr Mehta Care Clinic",
    images: [
      "photo-1631217868264-e5b90bb7e133",
      "photo-1519494026892-80bbd2d6fd0d",
      "photo-1579684385127-1ef15d508118",
      "photo-1666214280557-f1b5022eb634",
      "photo-1576091160399-112ba8d25d1d",
      "photo-1516549655169-df83a0774514",
      "photo-1559839734-2b71ea197ec2",
    ],
  },
  dentists: {
    specialty: "Dental care",
    services: ["Check-ups", "Cleaning", "Appointments"],
    demoName: "BrightSmile Dental",
    images: [
      "photo-1606811841689-23dfddce3e95",
      "photo-1588776814546-1ffcf47267a5",
      "photo-1606811841689-23dfddce3e95",
      "photo-1598256989800-fe5f95da9787",
      "photo-1588776814546-1ffcf47267a5",
      "photo-1606811841689-23dfddce3e95",
      "photo-1629909613654-28e377c37b09",
    ],
  },
  clinics: {
    specialty: "Multi-specialty clinic",
    services: ["OPD visits", "Follow-ups", "Phone booking"],
    demoName: "CarePoint Clinic",
    images: [
      "photo-1519494026892-80bbd2d6fd0d",
      "photo-1631217868264-e5b90bb7e133",
      "photo-1519494026892-80bbd2d6fd0d",
      "photo-1579684385127-1ef15d508118",
      "photo-1666214280557-f1b5022eb634",
      "photo-1576091160399-112ba8d25d1d",
      "photo-1559839734-2b71ea197ec2",
    ],
  },
  hospitals: {
    specialty: "Hospital care",
    services: ["Emergency desk", "Departments", "Visitor info"],
    demoName: "CityCare Hospital",
    images: [
      "photo-1516549655169-df83a0774514",
      "photo-1586773860418-d37222d8fce3",
      "photo-1516549655169-df83a0774514",
      "photo-1579684385127-1ef15d508118",
      "photo-1519494026892-80bbd2d6fd0d",
      "photo-1586773860418-d37222d8fce3",
      "photo-1631217868264-e5b90bb7e133",
    ],
  },
  physiotherapists: {
    specialty: "Physio & rehab",
    services: ["Rehab sessions", "Mobility care", "Booking call"],
    demoName: "MoveWell Physio",
    images: [
      "photo-1576091160550-2173dba999ef",
      "photo-1571019614242-c5c5dee9f50b",
      "photo-1576091160550-2173dba999ef",
      "photo-1518611012118-696072aa579a",
      "photo-1571019614242-c5c5dee9f50b",
      "photo-1576091160550-2173dba999ef",
      "photo-1518611012118-696072aa579a",
    ],
  },
  pharmacies: {
    specialty: "Medicines & wellness",
    services: ["Prescription fill", "OTC medicines", "Store hours"],
    demoName: "WellPath Pharmacy",
    images: [
      "photo-1587854692152-cbe660dbde88",
      "photo-1576602976047-174e57a47881",
      "photo-1587854692152-cbe660dbde88",
      "photo-1471864190281-a93a3070b6de",
      "photo-1576602976047-174e57a47881",
      "photo-1587854692152-cbe660dbde88",
      "photo-1471864190281-a93a3070b6de",
    ],
  },
  "diagnostic-centers": {
    specialty: "Labs & diagnostics",
    services: ["Lab tests", "Reports", "Appointment call"],
    demoName: "Accurate Labs",
    images: [
      "photo-1579154204601-01588f351e67",
      "photo-1582719471384-894fbb16e074",
      "photo-1579154204601-01588f351e67",
      "photo-1576086213369-97a306d36557",
      "photo-1582719471384-894fbb16e074",
      "photo-1579154204601-01588f351e67",
      "photo-1576086213369-97a306d36557",
    ],
  },
  barbers: {
    specialty: "Men's cuts & grooming",
    services: ["Classic cuts", "Beard trim", "Walk-in / call"],
    demoName: "Blade & Fade Barbers",
    images: [
      "photo-1503951914875-452162b0f3f1",
      "photo-1622286342621-4bd786c2447c",
      "photo-1503951914875-452162b0f3f1",
      "photo-1599351431202-1e0f0137899a",
      "photo-1622286342621-4bd786c2447c",
      "photo-1503951914875-452162b0f3f1",
      "photo-1599351431202-1e0f0137899a",
    ],
  },
  "hair-salons": {
    specialty: "Hair & style",
    services: ["Haircut & style", "Colour", "Booking call"],
    demoName: "Glow Studio Salon",
    images: [
      "photo-1560066984-138dadb4c035",
      "photo-1522337360788-8b13dee7a37e",
      "photo-1560066984-138dadb4c035",
      "photo-1562322140-8baeececf3df",
      "photo-1487412947147-5cebf100ffc2",
      "photo-1516975080664-ed2fc6a32937",
      "photo-1522337360788-8b13dee7a37e",
    ],
  },
  "beauty-salons": {
    specialty: "Beauty & makeover",
    services: ["Facials", "Makeover", "Appointments"],
    demoName: "Luxe Beauty Lounge",
    images: [
      "photo-1487412947147-5cebf100ffc2",
      "photo-1516975080664-ed2fc6a32937",
      "photo-1487412947147-5cebf100ffc2",
      "photo-1562322140-8baeececf3df",
      "photo-1522337360788-8b13dee7a37e",
      "photo-1560066984-138dadb4c035",
      "photo-1516975080664-ed2fc6a32937",
    ],
  },
  spas: {
    specialty: "Spa & relaxation",
    services: ["Massage", "Wellness rituals", "Booking call"],
    demoName: "Calm Waters Spa",
    images: [
      "photo-1544161515-4ab6ce6db874",
      "photo-1540555700478-4be289fbecef",
      "photo-1544161515-4ab6ce6db874",
      "photo-1600334129128-685c5582fd35",
      "photo-1540555700478-4be289fbecef",
      "photo-1544161515-4ab6ce6db874",
      "photo-1600334129128-685c5582fd35",
    ],
  },
  "nail-studios": {
    specialty: "Nail care & art",
    services: ["Manicure", "Pedicure", "Studio booking"],
    demoName: "Polish Lab Nails",
    images: [
      "photo-1604654894610-df63bc536371",
      "photo-1519014816548-bf5fe059798b",
      "photo-1604654894610-df63bc536371",
      "photo-1632345031435-8727f6897d53",
      "photo-1519014816548-bf5fe059798b",
      "photo-1604654894610-df63bc536371",
      "photo-1632345031435-8727f6897d53",
    ],
  },
  "grocery-stores": {
    specialty: "Fresh groceries",
    services: ["Daily staples", "Local pickup", "Store hours"],
    demoName: "FreshBasket Grocery",
    images: [
      "photo-1542838132-92c53300491e",
      "photo-1578916171728-46686eac8d58",
      "photo-1542838132-92c53300491e",
      "photo-1604719312566-8912e9227c6a",
      "photo-1578916171728-46686eac8d58",
      "photo-1542838132-92c53300491e",
      "photo-1604719312566-8912e9227c6a",
    ],
  },
  supermarkets: {
    specialty: "One-stop supermarket",
    services: ["Wide aisles", "Household needs", "Listed hours"],
    demoName: "CityMart Supermarket",
    images: [
      "photo-1604719312566-8912e9227c6a",
      "photo-1542838132-92c53300491e",
      "photo-1604719312566-8912e9227c6a",
      "photo-1578916171728-46686eac8d58",
      "photo-1542838132-92c53300491e",
      "photo-1604719312566-8912e9227c6a",
      "photo-1578916171728-46686eac8d58",
    ],
  },
  "toy-shops": {
    specialty: "Toys & play",
    services: ["Kids toys", "Gift finds", "Store visit"],
    demoName: "PlayBox Toy Shop",
    images: [
      "photo-1558060370-d644479cb6f7",
      "photo-1566576912321-d58ddd7a6088",
      "photo-1558060370-d644479cb6f7",
      "photo-1515488042361-ee00e0ddd4e4",
      "photo-1566576912321-d58ddd7a6088",
      "photo-1558060370-d644479cb6f7",
      "photo-1515488042361-ee00e0ddd4e4",
    ],
  },
  "clothing-stores": {
    specialty: "Everyday apparel",
    services: ["In-store selection", "Seasonal styles", "Call before visit"],
    demoName: "Urban Mart Store",
    images: [
      "photo-1441986300917-64674bd600d8",
      "photo-1441984904996-e0b6ba687e04",
      "photo-1441986300917-64674bd600d8",
      "photo-1555529669-e69e7aa0ba9a",
      "photo-1556742049-0cfed4f6a45d",
      "photo-1556740738-b6a63e27c4df",
      "photo-1441984904996-e0b6ba687e04",
    ],
  },
  "shoe-stores": {
    specialty: "Footwear for all",
    services: ["Casual shoes", "Formals", "Fitting help"],
    demoName: "Stride Shoe Co",
    images: [
      "photo-1549298916-b41d501d3772",
      "photo-1460353581641-37baddab0fa2",
      "photo-1549298916-b41d501d3772",
      "photo-1542291026-7eec264c27ff",
      "photo-1460353581641-37baddab0fa2",
      "photo-1549298916-b41d501d3772",
      "photo-1460353581641-37baddab0fa2",
    ],
  },
  "electronics-shops": {
    specialty: "Gadgets & electronics",
    services: ["Phones & accessories", "Home electronics", "Support call"],
    demoName: "VoltTech Electronics",
    images: [
      "photo-1498049794561-7780e7231661",
      "photo-1519389950473-47ba0277781c",
      "photo-1498049794561-7780e7231661",
      "photo-1518770660439-4636190af475",
      "photo-1519389950473-47ba0277781c",
      "photo-1498049794561-7780e7231661",
      "photo-1518770660439-4636190af475",
    ],
  },
  "furniture-stores": {
    specialty: "Home furniture",
    services: ["Living sets", "Showroom visit", "Enquiry call"],
    demoName: "HomeForm Furniture",
    images: [
      "photo-1555041469-a586c61ea9bc",
      "photo-1493666438817-866a91353ca9",
      "photo-1555041469-a586c61ea9bc",
      "photo-1586023492125-27b2c045efd7",
      "photo-1493666438817-866a91353ca9",
      "photo-1555041469-a586c61ea9bc",
      "photo-1586023492125-27b2c045efd7",
    ],
  },
  "gift-shops": {
    specialty: "Gifts & surprises",
    services: ["Curated gifts", "Occasion finds", "Store pickup"],
    demoName: "Parcel & Posy Gifts",
    images: [
      "photo-1513201099705-a9746e1e201f",
      "photo-1549465220-1a8b9238cd48",
      "photo-1513201099705-a9746e1e201f",
      "photo-1513885535751-8b9238bd345a",
      "photo-1549465220-1a8b9238cd48",
      "photo-1513201099705-a9746e1e201f",
      "photo-1513885535751-8b9238bd345a",
    ],
  },
  "pet-shops": {
    specialty: "Pet food & supplies",
    services: ["Pet food", "Accessories", "Store advice"],
    demoName: "PawStreet Pet Shop",
    images: [
      "photo-1583337130417-3346a1be7dee",
      "photo-1450778869180-41d0601e046e",
      "photo-1583337130417-3346a1be7dee",
      "photo-1548199973-03cce0bbc87b",
      "photo-1450778869180-41d0601e046e",
      "photo-1583337130417-3346a1be7dee",
      "photo-1548199973-03cce0bbc87b",
    ],
  },
  "hardware-stores": {
    specialty: "Tools & hardware",
    services: ["Tools", "Home fittings", "Trade counter"],
    demoName: "Bolt & Board Hardware",
    images: [
      "photo-1504148455328-c376907d081c",
      "photo-1581244277943-fe4a9c777189",
      "photo-1504148455328-c376907d081c",
      "photo-1530124566582-a618bc2615dc",
      "photo-1581244277943-fe4a9c777189",
      "photo-1504148455328-c376907d081c",
      "photo-1530124566582-a618bc2615dc",
    ],
  },
  bookstores: {
    specialty: "Books & stationery",
    services: ["Bestsellers", "Study titles", "Browse & buy"],
    demoName: "PageTurn Bookstore",
    images: [
      "photo-1507842217343-583bb7270b66",
      "photo-1481627834876-b7833e8f5570",
      "photo-1507842217343-583bb7270b66",
      "photo-1512820790803-83ca734da794",
      "photo-1481627834876-b7833e8f5570",
      "photo-1507842217343-583bb7270b66",
      "photo-1512820790803-83ca734da794",
    ],
  },
  lawyers: {
    specialty: "Legal counsel",
    services: ["Consultations", "Case guidance", "Office call"],
    demoName: "Ashford Legal Chambers",
    images: [
      "photo-1589829545856-d10d557cf95f",
      "photo-1450101499163-c8848c66ca85",
      "photo-1589829545856-d10d557cf95f",
      "photo-1521791136064-7986c2920216",
      "photo-1450101499163-c8848c66ca85",
      "photo-1497366216548-37526070297c",
      "photo-1521791136064-7986c2920216",
    ],
  },
  accountants: {
    specialty: "Accounting & tax",
    services: ["Bookkeeping", "Tax filing", "Client calls"],
    demoName: "LedgerWise Accountants",
    images: [
      "photo-1454165804606-c3d57bc86b40",
      "photo-1460925895917-afdab827c52f",
      "photo-1454165804606-c3d57bc86b40",
      "photo-1460925895917-afdab827c52f",
      "photo-1454165804606-c3d57bc86b40",
      "photo-1460925895917-afdab827c52f",
      "photo-1454165804606-c3d57bc86b40",
    ],
  },
  consultants: {
    specialty: "Business consulting",
    services: ["Advisory sessions", "Listed specialty", "Office call"],
    demoName: "Northbridge Advisors",
    images: [
      "photo-1497366216548-37526070297c",
      "photo-1521791136064-7986c2920216",
      "photo-1497366216548-37526070297c",
      "photo-1556761175-5973dc0f32e7",
      "photo-1497366811353-6870744d04b2",
      "photo-1450101499163-c8848c66ca85",
      "photo-1521791136064-7986c2920216",
    ],
  },
  architects: {
    specialty: "Architecture & design",
    services: ["Design consults", "Project reviews", "Studio call"],
    demoName: "FormLine Architects",
    images: [
      "photo-1487958449943-2429e8be8625",
      "photo-1503387762-592deb58ef4e",
      "photo-1487958449943-2429e8be8625",
      "photo-1497366811353-6870744d04b2",
      "photo-1503387762-592deb58ef4e",
      "photo-1487958449943-2429e8be8625",
      "photo-1497366216548-37526070297c",
    ],
  },
  "real-estate": {
    specialty: "Property & listings",
    services: ["Property tours", "Buyer guidance", "Agent call"],
    demoName: "Horizon Realty",
    images: [
      "photo-1560518883-ce09059eeffa",
      "photo-1564013799919-ab600027ffc6",
      "photo-1560518883-ce09059eeffa",
      "photo-1600596542815-ffad4c1539a9",
      "photo-1564013799919-ab600027ffc6",
      "photo-1560518883-ce09059eeffa",
      "photo-1600596542815-ffad4c1539a9",
    ],
  },
  "marketing-agencies": {
    specialty: "Brand & growth",
    services: ["Campaign planning", "Creative work", "Discovery call"],
    demoName: "Sparkline Marketing",
    images: [
      "photo-1552664730-d307ca884978",
      "photo-1460925895917-afdab827c52f",
      "photo-1552664730-d307ca884978",
      "photo-1556761175-5973dc0f32e7",
      "photo-1460925895917-afdab827c52f",
      "photo-1552664730-d307ca884978",
      "photo-1497366216548-37526070297c",
    ],
  },
  gyms: {
    specialty: "Strength training",
    services: ["Strength floor", "Guided sessions", "Membership call"],
    demoName: "Iron Path Gym",
    images: [
      "photo-1534438327276-14e5300c3a48",
      "photo-1571902943202-507ec2618e8f",
      "photo-1534438327276-14e5300c3a48",
      "photo-1517836357463-d25dfeac3438",
      "photo-1571019614242-c5c5dee9f50b",
      "photo-1540497077202-7c8a3999166f",
      "photo-1571902943202-507ec2618e8f",
    ],
  },
  "yoga-studios": {
    specialty: "Yoga & mindfulness",
    services: ["Group classes", "Beginner sessions", "Studio booking"],
    demoName: "StillPoint Yoga",
    images: [
      "photo-1544367567-0f2fcb009e0b",
      "photo-1506126613408-eca07ce68773",
      "photo-1544367567-0f2fcb009e0b",
      "photo-1599901860904-17e6ed7083a0",
      "photo-1506126613408-eca07ce68773",
      "photo-1544367567-0f2fcb009e0b",
      "photo-1599901860904-17e6ed7083a0",
    ],
  },
  "sports-academies": {
    specialty: "Sports coaching",
    services: ["Skill drills", "Youth batches", "Academy call"],
    demoName: "Ace Sports Academy",
    images: [
      "photo-1574629810360-7efbbe195018",
      "photo-1571019614242-c5c5dee9f50b",
      "photo-1574629810360-7efbbe195018",
      "photo-1571019614242-c5c5dee9f50b",
      "photo-1574629810360-7efbbe195018",
      "photo-1571019614242-c5c5dee9f50b",
      "photo-1574629810360-7efbbe195018",
    ],
  },
  "dance-studios": {
    specialty: "Dance classes",
    services: ["Batch classes", "Trial sessions", "Studio booking"],
    demoName: "Rhythm Room Studio",
    images: [
      "photo-1508700929628-666bc8bd84ea",
      "photo-1518834107812-67b0b7c58434",
      "photo-1508700929628-666bc8bd84ea",
      "photo-1547153760-18fc86324498",
      "photo-1518834107812-67b0b7c58434",
      "photo-1508700929628-666bc8bd84ea",
      "photo-1547153760-18fc86324498",
    ],
  },
  "car-repair": {
    specialty: "Auto repair & service",
    services: ["Diagnostics", "Repairs", "Service booking"],
    demoName: "Torque Auto Garage",
    images: [
      "photo-1486262715619-67b85e0b08d3",
      "photo-1619642751034-765dfdf7c58e",
      "photo-1486262715619-67b85e0b08d3",
      "photo-1492144534655-ae79c964c9d7",
      "photo-1619642751034-765dfdf7c58e",
      "photo-1486262715619-67b85e0b08d3",
      "photo-1492144534655-ae79c964c9d7",
    ],
  },
  "auto-dealers": {
    specialty: "Vehicle sales",
    services: ["Showroom visit", "Model enquiry", "Sales call"],
    demoName: "DriveLine Motors",
    images: [
      "photo-1492144534655-ae79c964c9d7",
      "photo-1503376780353-7e6692767b70",
      "photo-1492144534655-ae79c964c9d7",
      "photo-1549317661-bd32c8ce0db2",
      "photo-1503376780353-7e6692767b70",
      "photo-1492144534655-ae79c964c9d7",
      "photo-1549317661-bd32c8ce0db2",
    ],
  },
  "bike-repair": {
    specialty: "Bike service & parts",
    services: ["Tune-ups", "Parts & repair", "Quick booking"],
    demoName: "Spoke & Chain Cycles",
    images: [
      "photo-1532298229144-0ec0c57515c7",
      "photo-1571068316344-75bc76f77890",
      "photo-1532298229144-0ec0c57515c7",
      "photo-1571068316344-75bc76f77890",
      "photo-1532298229144-0ec0c57515c7",
      "photo-1571068316344-75bc76f77890",
      "photo-1532298229144-0ec0c57515c7",
    ],
  },
  "car-washes": {
    specialty: "Car wash & detailing",
    services: ["Exterior wash", "Interior clean", "Slot booking"],
    demoName: "Sparkle Auto Wash",
    images: [
      "photo-1601362840469-51e4d8d58785",
      "photo-1607860108855-64acf2078ed9",
      "photo-1601362840469-51e4d8d58785",
      "photo-1607860108855-64acf2078ed9",
      "photo-1601362840469-51e4d8d58785",
      "photo-1607860108855-64acf2078ed9",
      "photo-1601362840469-51e4d8d58785",
    ],
  },
  schools: {
    specialty: "School education",
    services: ["Admissions info", "Campus visit", "Office enquiry"],
    demoName: "Horizon Public School",
    images: [
      "photo-1580582932707-520aed937b7b",
      "photo-1509062522246-3755977927d7",
      "photo-1580582932707-520aed937b7b",
      "photo-1503676260728-1c00da094a0b",
      "photo-1509062522246-3755977927d7",
      "photo-1580582932707-520aed937b7b",
      "photo-1503676260728-1c00da094a0b",
    ],
  },
  "coaching-centers": {
    specialty: "Exam coaching",
    services: ["Batch classes", "Doubt sessions", "Enrolment call"],
    demoName: "Aspire Coaching Centre",
    images: [
      "photo-1434030216411-0b793f4b4173",
      "photo-1509062522246-3755977927d7",
      "photo-1434030216411-0b793f4b4173",
      "photo-1503676260728-1c00da094a0b",
      "photo-1509062522246-3755977927d7",
      "photo-1434030216411-0b793f4b4173",
      "photo-1503676260728-1c00da094a0b",
    ],
  },
  "training-institutes": {
    specialty: "Skill training",
    services: ["Courses", "Cert pathways", "Counsellor call"],
    demoName: "SkillForge Institute",
    images: [
      "photo-1523240795612-9a054b0db644",
      "photo-1524178232363-1fb2b075b655",
      "photo-1523240795612-9a054b0db644",
      "photo-1524178232363-1fb2b075b655",
      "photo-1523240795612-9a054b0db644",
      "photo-1524178232363-1fb2b075b655",
      "photo-1523240795612-9a054b0db644",
    ],
  },
  tutors: {
    specialty: "Private tutoring",
    services: ["1:1 sessions", "Subject help", "Schedule call"],
    demoName: "BrightMind Tutors",
    images: [
      "photo-1503676260728-1c00da094a0b",
      "photo-1434030216411-0b793f4b4173",
      "photo-1503676260728-1c00da094a0b",
      "photo-1434030216411-0b793f4b4173",
      "photo-1503676260728-1c00da094a0b",
      "photo-1434030216411-0b793f4b4173",
      "photo-1503676260728-1c00da094a0b",
    ],
  },
  plumbers: {
    specialty: "Plumbing & repairs",
    services: ["Repair visits", "Local coverage", "Call for booking"],
    demoName: "FixRight Plumbing",
    images: [
      "photo-1621905251189-08b45d6a269e",
      "photo-1581578731548-c64695cc6952",
      "photo-1621905251189-08b45d6a269e",
      "photo-1504148455328-c376907d081c",
      "photo-1558618666-fcd25c85cd64",
      "photo-1584622650111-993a426fbf0a",
      "photo-1581578731548-c64695cc6952",
    ],
  },
  electricians: {
    specialty: "Electrical service",
    services: ["Wiring & fixes", "Safety checks", "Service call"],
    demoName: "VoltSafe Electric",
    images: [
      "photo-1621905252507-b35492cc74b4",
      "photo-1558618666-fcd25c85cd64",
      "photo-1621905252507-b35492cc74b4",
      "photo-1504148455328-c376907d081c",
      "photo-1558618666-fcd25c85cd64",
      "photo-1621905252507-b35492cc74b4",
      "photo-1504148455328-c376907d081c",
    ],
  },
  "interior-designers": {
    specialty: "Interior design",
    services: ["Space planning", "Mood concepts", "Studio call"],
    demoName: "Atelier Home Interiors",
    images: [
      "photo-1618221195710-dd6b41faaea6",
      "photo-1586023492125-27b2c045efd7",
      "photo-1618221195710-dd6b41faaea6",
      "photo-1493666438817-866a91353ca9",
      "photo-1586023492125-27b2c045efd7",
      "photo-1618221195710-dd6b41faaea6",
      "photo-1493666438817-866a91353ca9",
    ],
  },
  "cleaning-services": {
    specialty: "Home & office cleaning",
    services: ["Deep clean", "Recurring plans", "Booking call"],
    demoName: "SparkClean Services",
    images: [
      "photo-1581578731548-c64695cc6952",
      "photo-1563453392212-326f5e854473",
      "photo-1581578731548-c64695cc6952",
      "photo-1584622650111-993a426fbf0a",
      "photo-1563453392212-326f5e854473",
      "photo-1581578731548-c64695cc6952",
      "photo-1584622650111-993a426fbf0a",
    ],
  },
  "pest-control": {
    specialty: "Pest control",
    services: ["Inspection", "Treatment plans", "Service call"],
    demoName: "Shield Pest Control",
    images: [
      "photo-1584622650111-993a426fbf0a",
      "photo-1581578731548-c64695cc6952",
      "photo-1584622650111-993a426fbf0a",
      "photo-1504148455328-c376907d081c",
      "photo-1581578731548-c64695cc6952",
      "photo-1584622650111-993a426fbf0a",
      "photo-1504148455328-c376907d081c",
    ],
  },
  construction: {
    specialty: "Construction & builds",
    services: ["Site work", "Project quotes", "Office enquiry"],
    demoName: "BuildRight Construction",
    images: [
      "photo-1503387762-592deb58ef4e",
      "photo-1504307651254-35680f356dfd",
      "photo-1503387762-592deb58ef4e",
      "photo-1541888946425-d81bb19240f5",
      "photo-1504307651254-35680f356dfd",
      "photo-1503387762-592deb58ef4e",
      "photo-1541888946425-d81bb19240f5",
    ],
  },
};

const ICONS = {
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v2a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h2a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7.1 9.9a16 16 0 0 0 6 6l1.5-1.1a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6A2 2 0 0 1 22 16.9z" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-4.4-7-10a7 7 0 0 1 14 0c0 5.6-7 10-7 10z" stroke-linejoin="round"/><circle cx="12" cy="11" r="2.2"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8l8 5 8-5"/><rect x="4" y="5" width="16" height="14" rx="2"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" stroke-linecap="round"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke-linejoin="round"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" stroke-linecap="round"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7l3-7z" stroke-linejoin="round"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  mark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4 5.6 21.2 8 14 2 9.2h7.6L12 2z" stroke-linejoin="round"/></svg>`,
};

function css(theme) {
  return `
    :root {
      --ink:${theme.ink}; --ink-soft:${theme.inkSoft}; --muted:${theme.muted}; --line:${theme.line};
      --bg:${theme.bg}; --surface:${theme.surface}; --accent:${theme.accent}; --accent-2:${theme.accent2};
      --accent-soft:${theme.accentSoft}; --warm:${theme.warm}; --shadow:${theme.shadow}; --radius:22px; --max:1120px;
      --topbar-bg:${theme.topbar};
    }
    *{box-sizing:border-box} html{scroll-behavior:smooth}
    body{margin:0;font-family:${theme.body};color:var(--ink);background:${theme.bodyBg};line-height:1.55}
    img{max-width:100%;display:block} a{color:inherit;text-decoration:none}
    .wrap{width:min(var(--max),calc(100% - 2rem));margin-inline:auto}
    @keyframes rise{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fade{from{opacity:0}to{opacity:1}}
    @keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes pulseSoft{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
    .anim{opacity:0;animation:rise .8s ease forwards}
    .delay-1{animation-delay:.12s}.delay-2{animation-delay:.24s}.delay-3{animation-delay:.36s}.delay-4{animation-delay:.48s}
    .topbar{position:sticky;top:0;z-index:40;backdrop-filter:blur(14px);background:var(--topbar-bg);border-bottom:1px solid color-mix(in srgb,var(--line) 70%,transparent)}
    .topbar-inner{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.9rem 0}
    .brand{display:flex;align-items:center;gap:.75rem;font-weight:700;letter-spacing:-.02em}
    .brand-mark{width:42px;height:42px;border-radius:14px;background:linear-gradient(145deg,var(--accent),var(--accent-2));display:grid;place-items:center;color:${theme.btnText === "#111214" || theme.btnText === "#0f1115" || theme.btnText === "#0f172a" ? theme.btnText : "#fff"};box-shadow:0 10px 24px color-mix(in srgb,var(--accent) 28%,transparent)}
    .brand-mark svg{width:22px;height:22px}
    .nav{display:flex;gap:1.25rem;color:var(--muted);font-size:.95rem;font-weight:500}
    .nav a:hover{color:var(--accent)}
    .btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;border:0;border-radius:999px;padding:.85rem 1.25rem;font-weight:700;font-size:.95rem;cursor:pointer;transition:transform .2s ease,box-shadow .2s ease}
    .btn svg{width:18px;height:18px}
    .btn-primary{background:linear-gradient(135deg,var(--accent),var(--accent-2));color:${theme.btnText};box-shadow:0 12px 28px color-mix(in srgb,var(--accent) 28%,transparent)}
    .btn-primary:hover{transform:translateY(-2px)}
    .btn-ghost{background:var(--surface);color:var(--ink);border:1px solid var(--line)}
    .btn-ghost:hover{border-color:var(--accent);color:var(--accent)}
    .hero{display:grid;grid-template-columns:1.05fr .95fr;gap:2.5rem;align-items:center;padding:3.5rem 0 2.5rem}
    .eyebrow{display:inline-flex;align-items:center;gap:.45rem;padding:.4rem .8rem;border-radius:999px;background:var(--accent-soft);color:var(--accent);font-size:.78rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
    .eyebrow svg{width:14px;height:14px}
    h1{margin:1rem 0 .75rem;font-family:${theme.display};font-size:clamp(2.4rem,5vw,3.6rem);line-height:1.05;letter-spacing:-.03em}
    .chip{display:inline-block;background:var(--surface);border:1px solid var(--line);border-radius:999px;padding:.35rem .75rem;font-size:.85rem;color:var(--ink-soft);font-weight:600;margin:.25rem .35rem .25rem 0}
    .lead{margin:0;max-width:38rem;color:var(--muted);font-size:1.05rem}
    .hero-actions{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:1.6rem}
    .trust-row{display:flex;flex-wrap:wrap;gap:1.25rem;margin-top:1.75rem;color:var(--muted);font-size:.9rem}
    .trust-item{display:inline-flex;align-items:center;gap:.45rem}
    .trust-item svg{width:18px;height:18px;color:var(--accent-2)}
    .hero-visual{position:relative;min-height:460px}
    .hero-card{position:relative;border-radius:28px;overflow:hidden;box-shadow:var(--shadow);background:var(--ink);min-height:460px;height:100%}
    .hero-card img{width:100%;height:100%;object-fit:cover;min-height:460px;animation:fade 1.1s ease both}
    .float-card{position:absolute;left:-18px;bottom:28px;width:min(250px,70%);background:color-mix(in srgb,var(--surface) 94%,transparent);backdrop-filter:blur(10px);border:1px solid color-mix(in srgb,var(--surface) 70%,transparent);border-radius:18px;padding:1rem;box-shadow:var(--shadow);animation:floaty 5s ease-in-out infinite}
    .float-card strong{display:block;font-size:.95rem;margin-bottom:.2rem}
    .float-card span{color:var(--muted);font-size:.85rem}
    section{padding:3.5rem 0}
    .section-head{display:grid;gap:.6rem;margin-bottom:1.75rem;max-width:40rem}
    .section-head h2{margin:0;font-family:${theme.display};font-size:clamp(1.8rem,3vw,2.4rem);letter-spacing:-.02em;line-height:1.15}
    .section-head p{margin:0;color:var(--muted)}
    .about-grid{display:grid;grid-template-columns:.95fr 1.05fr;gap:1.5rem}
    .photo-panel{border-radius:var(--radius);overflow:hidden;min-height:360px;box-shadow:var(--shadow)}
    .photo-panel img{width:100%;height:100%;object-fit:cover;min-height:360px}
    .about-copy{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:1.6rem;box-shadow:var(--shadow)}
    .about-copy p{color:var(--muted);margin-top:.75rem}
    .highlights{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-top:1.5rem}
    .highlight{padding:1rem;border-radius:16px;background:var(--accent-soft);border:1px solid color-mix(in srgb,var(--accent) 15%,transparent)}
    .highlight strong{display:block;margin-bottom:.25rem}
    .highlight span{color:var(--muted);font-size:.9rem}
    .cards,.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
    .card,.step{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:1.35rem;transition:transform .25s ease,box-shadow .25s ease}
    .card:hover{transform:translateY(-4px);box-shadow:var(--shadow)}
    .icon-bubble{width:48px;height:48px;border-radius:16px;background:var(--accent-soft);color:var(--accent);display:grid;place-items:center;margin-bottom:1rem}
    .icon-bubble svg{width:24px;height:24px}
    .card h3,.step h3{margin:0 0 .45rem;font-size:1.1rem}
    .card p,.step p{margin:0;color:var(--muted);font-size:.95rem}
    .step-num{width:36px;height:36px;border-radius:12px;background:var(--accent);color:${theme.btnText};display:grid;place-items:center;font-weight:700;margin-bottom:.85rem;animation:pulseSoft 3.5s ease-in-out infinite}
    .gallery{display:grid;grid-template-columns:1.3fr 1fr 1fr;grid-template-rows:180px 180px;gap:.85rem}
    .gallery figure{margin:0;border-radius:18px;overflow:hidden;position:relative;box-shadow:var(--shadow)}
    .gallery figure:first-child{grid-row:1 / span 2}
    .gallery img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
    .gallery figure:hover img{transform:scale(1.05)}
    .gallery figcaption{position:absolute;left:.7rem;bottom:.7rem;background:color-mix(in srgb,var(--ink) 62%,transparent);color:#fff;font-size:.75rem;padding:.3rem .55rem;border-radius:999px}
    .contact-panel{display:grid;grid-template-columns:1.15fr .85fr;gap:1rem;background:${theme.contact};color:#fff;border-radius:28px;padding:1.6rem;box-shadow:var(--shadow);overflow:hidden;position:relative}
    .contact-panel::after{content:"";position:absolute;width:280px;height:280px;right:-60px;bottom:-80px;border-radius:50%;background:rgba(255,255,255,.08)}
    .contact-panel h2{margin:0 0 .5rem;font-family:${theme.display};font-size:clamp(1.7rem,3vw,2.2rem)}
    .contact-panel p{margin:0;color:rgba(255,255,255,.8);max-width:36rem}
    .facts{display:grid;gap:.85rem;margin-top:1.4rem;position:relative;z-index:1}
    .fact{display:grid;grid-template-columns:40px 1fr;gap:.75rem}
    .fact-icon{width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,.12);display:grid;place-items:center}
    .fact-icon svg{width:20px;height:20px}
    .fact strong{display:block;font-size:.8rem;opacity:.75;font-weight:600}
    .fact span{font-size:1rem;font-weight:600}
    .cta-box{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);border-radius:20px;padding:1.25rem;align-self:center;position:relative;z-index:1}
    .cta-box .btn-primary{width:100%;margin-top:.85rem;background:#fff;color:var(--ink);box-shadow:none}
    footer{padding:2rem 0 2.5rem;color:var(--muted);font-size:.88rem;display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;border-top:1px solid var(--line);margin-top:1rem}
    .template-note{margin:0 auto 1rem;width:min(var(--max),calc(100% - 2rem));background:var(--warm);border:1px solid color-mix(in srgb,var(--warm) 60%,#000);color:#6a553d;border-radius:14px;padding:.75rem 1rem;font-size:.85rem}
    @media (max-width:900px){
      .nav{display:none}
      .hero,.about-grid,.cards,.steps,.contact-panel,.gallery,.highlights{grid-template-columns:1fr}
      .gallery{grid-template-rows:220px 160px 160px}
      .gallery figure:first-child{grid-row:auto}
      .hero-visual,.hero-card,.hero-card img{min-height:340px}
      .float-card{left:12px;bottom:12px}
    }
  `;
}

function demoScript(demo) {
  return `<script>
(function(){
  if(window.__CATEGORY_TEMPLATE_FILLED__) return;
  var demo=${JSON.stringify(demo)};
  if(!document.body.innerHTML.includes("{{"+"BUSINESS_NAME}}")){bindImg();return;}
  window.__CATEGORY_TEMPLATE_FILLED__=true;
  function apply(s){Object.keys(demo).forEach(function(k){s=s.split("{{"+k+"}}").join(demo[k]);});return s;}
  document.title=apply(document.title);
  var m=document.querySelector('meta[name="description"]');
  if(m) m.setAttribute("content", apply(m.getAttribute("content")||""));
  document.body.innerHTML=apply(document.body.innerHTML);
  bindImg();
})();
function bindImg(){
  var SAFE="data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#444"/><text x="600" y="410" text-anchor="middle" fill="#fff" font-family="Arial" font-size="32">Photo</text></svg>');
  document.querySelectorAll("img.js-img,img[data-fallback]").forEach(function(img){
    img.addEventListener("error",function onErr(){
      img.removeEventListener("error",onErr);
      var n=img.getAttribute("data-fallback");
      if(n&&img.src!==n){img.src=n;return;}
      img.src=SAFE;
    });
  });
}
</script>`;
}

function buildHtml(cat) {
  const theme = GROUP_THEMES[cat.group];
  const meta = CAT[cat.id];
  if (!theme || !meta) throw new Error(`Missing theme/meta for ${cat.id}`);
  const imgs = meta.images.map((id, i) => U(id, i < 2 ? 1600 : 1000));
  const [hero, about, g1, g2, g3, g4, g5] = imgs;
  const singular = cat.label.replace(/s$/i, "") || cat.label;
  const demo = {
    BUSINESS_NAME: meta.demoName,
    CATEGORY: cat.label,
    CITY: "Indore",
    SPECIALTY: meta.specialty,
    PHONE: "+91 98765 43210",
    EMAIL: "hello@example.com",
    ADDRESS: "12 MG Road",
    HOURS: "Mon–Sat · 10am–7pm",
    ABOUT_SHORT: `${meta.demoName} brings ${meta.specialty.toLowerCase()} to customers in Indore with clear contact and location details.`,
    ABOUT_LONG: `${meta.demoName} is listed as a ${cat.label.toLowerCase()} business in Indore. This Techlyser concept page uses public listing fields — swap in real photos and services when you go live.`,
    SERVICE_1: meta.services[0],
    SERVICE_2: meta.services[1],
    SERVICE_3: meta.services[2],
    HERO_IMAGE: hero,
    ABOUT_IMAGE: about,
    GALLERY_1: g1,
    GALLERY_2: g2,
    GALLERY_3: g3,
    GALLERY_4: g4,
    GALLERY_5: g5,
  };

  const img = (key, fb, alt, w, h) =>
    `<img class="js-img" src="{{${key}}}" data-fallback="${fb}" alt="${alt}" width="${w}" height="${h}" />`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{{BUSINESS_NAME}} | ${cat.label}</title>
  <meta name="description" content="{{BUSINESS_NAME}} — ${cat.label} in {{CITY}}." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${theme.fonts}" rel="stylesheet" />
  <style>${css(theme)}</style>
</head>
<body>
  <p class="template-note">${cat.label} landing template (${cat.id}) — scrap fields fill placeholders; stock images used when listing photos are missing.</p>
  <header class="topbar"><div class="wrap topbar-inner">
    <div class="brand"><div class="brand-mark" aria-hidden="true">${ICONS.mark}</div><span>{{BUSINESS_NAME}}</span></div>
    <nav class="nav" aria-label="Primary">
      <a href="#about">About</a><a href="#services">Services</a><a href="#process">Process</a><a href="#gallery">Gallery</a><a href="#contact">Contact</a>
    </nav>
    <a class="btn btn-primary" href="tel:{{PHONE}}">${ICONS.phone} Call now</a>
  </div></header>
  <main>
    <section class="wrap hero">
      <div>
        <div class="eyebrow anim">${ICONS.pin} {{CATEGORY}} · {{CITY}}</div>
        <h1 class="anim delay-1">{{BUSINESS_NAME}}</h1>
        <div class="anim delay-1"><span class="chip">{{SPECIALTY}}</span><span class="chip">{{CITY}}</span></div>
        <p class="lead anim delay-2">{{ABOUT_SHORT}}</p>
        <div class="hero-actions anim delay-3">
          <a class="btn btn-primary" href="tel:{{PHONE}}">${ICONS.phone} Call {{PHONE}}</a>
          <a class="btn btn-ghost" href="#contact">${ICONS.mail} View contact</a>
        </div>
        <div class="trust-row anim delay-4">
          <div class="trust-item">${ICONS.shield} Local ${singular.toLowerCase()} presence</div>
          <div class="trust-item">${ICONS.clock} {{HOURS}}</div>
        </div>
      </div>
      <div class="hero-visual anim delay-2"><div class="hero-card">
        ${img("HERO_IMAGE", hero, `${cat.label} hero`, 800, 1000)}
        <div class="float-card"><strong>{{SPECIALTY}}</strong><span>Serving {{CITY}}</span></div>
      </div></div>
    </section>

    <section class="wrap" id="about">
      <div class="section-head anim"><h2>About ${cat.label.toLowerCase()}</h2><p>A modern website concept built from public listing details.</p></div>
      <div class="about-grid">
        <div class="photo-panel anim delay-1">${img("ABOUT_IMAGE", about, `${cat.label} about`, 900, 700)}</div>
        <div class="about-copy anim delay-2">
          <div class="eyebrow">{{CATEGORY}}</div>
          <h2 style="margin:.8rem 0 0;font-family:inherit;font-size:1.8rem;letter-spacing:-.02em;">Clear details. Easy next step.</h2>
          <p>{{ABOUT_LONG}}</p>
          <div class="highlights">
            <div class="highlight"><strong>Focus</strong><span>{{SPECIALTY}}</span></div>
            <div class="highlight"><strong>City</strong><span>{{CITY}}</span></div>
            <div class="highlight"><strong>Contact</strong><span>Direct phone line</span></div>
          </div>
          <div class="hero-actions"><a class="btn btn-primary" href="tel:{{PHONE}}">Call now</a></div>
        </div>
      </div>
    </section>

    <section class="wrap" id="services">
      <div class="section-head anim"><h2>What we offer</h2><p>Service highlights tailored for ${cat.label.toLowerCase()}.</p></div>
      <div class="cards">
        <article class="card anim delay-1"><div class="icon-bubble">${ICONS.star}</div><h3>{{SERVICE_1}}</h3><p>Core offering aligned to your ${cat.label.toLowerCase()} listing.</p></article>
        <article class="card anim delay-2"><div class="icon-bubble">${ICONS.check}</div><h3>{{SERVICE_2}}</h3><p>Clear presentation of specialty and customer value.</p></article>
        <article class="card anim delay-3"><div class="icon-bubble">${ICONS.phone}</div><h3>{{SERVICE_3}}</h3><p>One-tap calling so customers never guess how to reach you.</p></article>
      </div>
    </section>

    <section class="wrap" id="process">
      <div class="section-head anim"><h2>How it works</h2><p>A simple path from discovery to contact.</p></div>
      <div class="steps">
        <div class="step anim delay-1"><div class="step-num">1</div><h3>Discover</h3><p>Find ${cat.label.toLowerCase()} details and specialty online.</p></div>
        <div class="step anim delay-2"><div class="step-num">2</div><h3>Call</h3><p>Reach the business on the listed phone number.</p></div>
        <div class="step anim delay-3"><div class="step-num">3</div><h3>Visit</h3><p>Arrive with address and hours already clear.</p></div>
      </div>
    </section>

    <section class="wrap" id="gallery">
      <div class="section-head anim"><h2>Gallery</h2><p>Illustrative imagery for the proposal — replace with real photos later.</p></div>
      <div class="gallery anim delay-1">
        <figure>${img("GALLERY_1", g1, "Gallery 1", 900, 1200)}<figcaption>Featured</figcaption></figure>
        <figure>${img("GALLERY_2", g2, "Gallery 2", 700, 500)}<figcaption>Space</figcaption></figure>
        <figure>${img("GALLERY_3", g3, "Gallery 3", 700, 500)}<figcaption>Detail</figcaption></figure>
        <figure>${img("GALLERY_4", g4, "Gallery 4", 700, 500)}<figcaption>Work</figcaption></figure>
        <figure>${img("GALLERY_5", g5, "Gallery 5", 700, 500)}<figcaption>Visit</figcaption></figure>
      </div>
    </section>

    <section class="wrap" id="contact">
      <div class="contact-panel anim">
        <div>
          <h2>Visit &amp; contact</h2>
          <p>Everything a customer needs to reach {{BUSINESS_NAME}}.</p>
          <div class="facts">
            <div class="fact"><div class="fact-icon">${ICONS.user}</div><div><strong>Business</strong><span>{{BUSINESS_NAME}}</span></div></div>
            <div class="fact"><div class="fact-icon">${ICONS.star}</div><div><strong>Focus</strong><span>{{SPECIALTY}}</span></div></div>
            <div class="fact"><div class="fact-icon">${ICONS.phone}</div><div><strong>Phone</strong><span>{{PHONE}}</span></div></div>
            <div class="fact"><div class="fact-icon">${ICONS.mail}</div><div><strong>Email</strong><span>{{EMAIL}}</span></div></div>
            <div class="fact"><div class="fact-icon">${ICONS.pin}</div><div><strong>Location</strong><span>{{ADDRESS}}, {{CITY}}</span></div></div>
            <div class="fact"><div class="fact-icon">${ICONS.clock}</div><div><strong>Hours</strong><span>{{HOURS}}</span></div></div>
          </div>
        </div>
        <div class="cta-box">
          <strong style="font-size:1.15rem;display:block;margin-bottom:.35rem;">Ready to connect?</strong>
          <span style="opacity:.85;font-size:.95rem;">Call the listing number and speak directly with the business.</span>
          <a class="btn btn-primary" href="tel:{{PHONE}}">${ICONS.phone} {{PHONE}}</a>
        </div>
      </div>
    </section>
  </main>
  <footer class="wrap">
    <span>Website concept for {{BUSINESS_NAME}} · {{CITY}}</span>
    <span>Prepared by Techlyser · ${cat.id}</span>
  </footer>
  ${demoScript(demo)}
</body>
</html>`;
}

let count = 0;
for (const cat of CATEGORIES) {
  const html = buildHtml(cat);
  writeFileSync(path.join(outDir, `${cat.id}.html`), html, "utf8");
  count += 1;
}

// Keep familiar aliases used earlier
const aliases = [
  ["doctor.html", "doctors.html"],
  ["salon.html", "hair-salons.html"],
  ["restaurant.html", "restaurants.html"],
  ["retail.html", "clothing-stores.html"],
  ["fitness.html", "gyms.html"],
  ["professional.html", "consultants.html"],
  ["home-services.html", "plumbers.html"],
];
for (const [alias, source] of aliases) {
  const src = path.join(outDir, source);
  if (existsSync(src)) copyFileSync(src, path.join(outDir, alias));
}

writeFileSync(
  path.join(outDir, "INDEX.txt"),
  CATEGORIES.map((c) => `${c.id}.html\t${c.group}\t${c.label}`).join("\n") + "\n",
  "utf8",
);

console.log(`Generated ${count} category templates + aliases → ${outDir}`);
