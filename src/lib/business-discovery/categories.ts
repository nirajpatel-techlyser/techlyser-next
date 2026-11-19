import type { OpportunityCategory } from "@/lib/business-discovery/types";

export const OPPORTUNITY_CATEGORIES: OpportunityCategory[] = [
  // Food & Hospitality
  { id: "restaurants", label: "Restaurants", group: "Food & Hospitality", providerHints: { googlePlacesTypes: ["restaurant"], osmTags: ["amenity=restaurant"] } },
  { id: "cafes", label: "Cafes", group: "Food & Hospitality", providerHints: { googlePlacesTypes: ["cafe"], osmTags: ["amenity=cafe"] } },
  { id: "bakeries", label: "Bakeries", group: "Food & Hospitality", providerHints: { googlePlacesTypes: ["bakery"], osmTags: ["shop=bakery"] } },
  { id: "bars", label: "Bars", group: "Food & Hospitality", providerHints: { googlePlacesTypes: ["bar"], osmTags: ["amenity=bar"] } },
  { id: "fast-food", label: "Fast food", group: "Food & Hospitality", providerHints: { googlePlacesTypes: ["meal_takeaway"], osmTags: ["amenity=fast_food"] } },
  { id: "food-shops", label: "Food shops", group: "Food & Hospitality", providerHints: { googlePlacesTypes: ["food"], osmTags: ["shop=convenience"] } },
  { id: "catering", label: "Catering", group: "Food & Hospitality", providerHints: { googlePlacesTypes: ["meal_delivery"], osmTags: ["craft=caterer"] } },

  // Healthcare
  { id: "doctors", label: "Doctors", group: "Healthcare", providerHints: { googlePlacesTypes: ["doctor"], osmTags: ["amenity=doctors"] } },
  { id: "dentists", label: "Dentists", group: "Healthcare", providerHints: { googlePlacesTypes: ["dentist"], osmTags: ["amenity=dentist"] } },
  { id: "clinics", label: "Clinics", group: "Healthcare", providerHints: { googlePlacesTypes: ["clinic"], osmTags: ["amenity=clinic"] } },
  { id: "hospitals", label: "Hospitals", group: "Healthcare", providerHints: { googlePlacesTypes: ["hospital"], osmTags: ["amenity=hospital"] } },
  { id: "physiotherapists", label: "Physiotherapists", group: "Healthcare", providerHints: { googlePlacesTypes: ["physiotherapist"], osmTags: ["healthcare=physiotherapist"] } },
  { id: "pharmacies", label: "Pharmacies", group: "Healthcare", providerHints: { googlePlacesTypes: ["pharmacy"], osmTags: ["amenity=pharmacy"] } },
  { id: "diagnostic-centers", label: "Diagnostic centers", group: "Healthcare", providerHints: { googlePlacesTypes: ["medical_lab"], osmTags: ["healthcare=laboratory"] } },

  // Personal Care
  { id: "barbers", label: "Barbers", group: "Personal Care", providerHints: { googlePlacesTypes: ["hair_care"], osmTags: ["shop=hairdresser"] } },
  { id: "hair-salons", label: "Hair salons", group: "Personal Care", providerHints: { googlePlacesTypes: ["beauty_salon"], osmTags: ["shop=hairdresser"] } },
  { id: "beauty-salons", label: "Beauty salons", group: "Personal Care", providerHints: { googlePlacesTypes: ["beauty_salon"], osmTags: ["shop=beauty"] } },
  { id: "spas", label: "Spas", group: "Personal Care", providerHints: { googlePlacesTypes: ["spa"], osmTags: ["leisure=spa"] } },
  { id: "nail-studios", label: "Nail studios", group: "Personal Care", providerHints: { googlePlacesTypes: ["beauty_salon"], osmTags: ["shop=beauty"] } },

  // Retail
  { id: "grocery-stores", label: "Grocery stores", group: "Retail", providerHints: { googlePlacesTypes: ["grocery_or_supermarket"], osmTags: ["shop=supermarket"] } },
  { id: "supermarkets", label: "Supermarkets", group: "Retail", providerHints: { googlePlacesTypes: ["supermarket"], osmTags: ["shop=supermarket"] } },
  { id: "toy-shops", label: "Toy shops", group: "Retail", providerHints: { googlePlacesTypes: ["toy_store"], osmTags: ["shop=toys"] } },
  { id: "clothing-stores", label: "Clothing stores", group: "Retail", providerHints: { googlePlacesTypes: ["clothing_store"], osmTags: ["shop=clothes"] } },
  { id: "shoe-stores", label: "Shoe stores", group: "Retail", providerHints: { googlePlacesTypes: ["shoe_store"], osmTags: ["shop=shoes"] } },
  { id: "electronics-shops", label: "Electronics shops", group: "Retail", providerHints: { googlePlacesTypes: ["electronics_store"], osmTags: ["shop=electronics"] } },
  { id: "furniture-stores", label: "Furniture stores", group: "Retail", providerHints: { googlePlacesTypes: ["furniture_store"], osmTags: ["shop=furniture"] } },
  { id: "gift-shops", label: "Gift shops", group: "Retail", providerHints: { googlePlacesTypes: ["gift_shop"], osmTags: ["shop=gift"] } },
  { id: "pet-shops", label: "Pet shops", group: "Retail", providerHints: { googlePlacesTypes: ["pet_store"], osmTags: ["shop=pet"] } },
  { id: "hardware-stores", label: "Hardware stores", group: "Retail", providerHints: { googlePlacesTypes: ["hardware_store"], osmTags: ["shop=hardware"] } },
  { id: "bookstores", label: "Bookstores", group: "Retail", providerHints: { googlePlacesTypes: ["book_store"], osmTags: ["shop=books"] } },

  // Professional Services
  { id: "lawyers", label: "Lawyers", group: "Professional Services", providerHints: { googlePlacesTypes: ["lawyer"], osmTags: ["office=lawyer"] } },
  { id: "accountants", label: "Accountants", group: "Professional Services", providerHints: { googlePlacesTypes: ["accounting"], osmTags: ["office=accountant"] } },
  { id: "consultants", label: "Consultants", group: "Professional Services", providerHints: { googlePlacesTypes: ["consultant"], osmTags: ["office=consulting"] } },
  { id: "architects", label: "Architects", group: "Professional Services", providerHints: { googlePlacesTypes: ["architect"], osmTags: ["office=architect"] } },
  { id: "real-estate", label: "Real estate agencies", group: "Professional Services", providerHints: { googlePlacesTypes: ["real_estate_agency"], osmTags: ["office=estate_agent"] } },
  { id: "marketing-agencies", label: "Marketing agencies", group: "Professional Services", providerHints: { googlePlacesTypes: ["advertising_agency"], osmTags: ["office=advertising_agency"] } },

  // Fitness and Recreation
  { id: "gyms", label: "Gyms", group: "Fitness and Recreation", providerHints: { googlePlacesTypes: ["gym"], osmTags: ["leisure=fitness_centre"] } },
  { id: "yoga-studios", label: "Yoga studios", group: "Fitness and Recreation", providerHints: { googlePlacesTypes: ["yoga"], osmTags: ["leisure=fitness_centre"] } },
  { id: "sports-academies", label: "Sports academies", group: "Fitness and Recreation", providerHints: { googlePlacesTypes: ["stadium"], osmTags: ["club=sport"] } },
  { id: "dance-studios", label: "Dance studios", group: "Fitness and Recreation", providerHints: { googlePlacesTypes: ["dance"], osmTags: ["amenity=dancing_school"] } },

  // Automotive
  { id: "car-repair", label: "Car repair shops", group: "Automotive", providerHints: { googlePlacesTypes: ["car_repair"], osmTags: ["shop=car_repair"] } },
  { id: "auto-dealers", label: "Auto dealers", group: "Automotive", providerHints: { googlePlacesTypes: ["car_dealer"], osmTags: ["shop=car"] } },
  { id: "bike-repair", label: "Bike repair shops", group: "Automotive", providerHints: { googlePlacesTypes: ["bicycle_store"], osmTags: ["shop=bicycle"] } },
  { id: "car-washes", label: "Car washes", group: "Automotive", providerHints: { googlePlacesTypes: ["car_wash"], osmTags: ["amenity=car_wash"] } },

  // Education
  { id: "schools", label: "Schools", group: "Education", providerHints: { googlePlacesTypes: ["school"], osmTags: ["amenity=school"] } },
  { id: "coaching-centers", label: "Coaching centers", group: "Education", providerHints: { googlePlacesTypes: ["secondary_school"], osmTags: ["amenity=college"] } },
  { id: "training-institutes", label: "Training institutes", group: "Education", providerHints: { googlePlacesTypes: ["university"], osmTags: ["amenity=college"] } },
  { id: "tutors", label: "Tutors", group: "Education", providerHints: { googlePlacesTypes: ["school"], osmTags: ["amenity=school"] } },

  // Home Services
  { id: "plumbers", label: "Plumbers", group: "Home Services", providerHints: { googlePlacesTypes: ["plumber"], osmTags: ["craft=plumber"] } },
  { id: "electricians", label: "Electricians", group: "Home Services", providerHints: { googlePlacesTypes: ["electrician"], osmTags: ["craft=electrician"] } },
  { id: "interior-designers", label: "Interior designers", group: "Home Services", providerHints: { googlePlacesTypes: ["interior_designer"], osmTags: ["craft=interior_decorator"] } },
  { id: "cleaning-services", label: "Cleaning services", group: "Home Services", providerHints: { googlePlacesTypes: ["laundry"], osmTags: ["shop=laundry"] } },
  { id: "pest-control", label: "Pest control", group: "Home Services", providerHints: { googlePlacesTypes: ["pest_control"], osmTags: ["craft=pest_control"] } },
  { id: "construction", label: "Construction companies", group: "Home Services", providerHints: { googlePlacesTypes: ["general_contractor"], osmTags: ["office=construction_company"] } },
];

export function listCategoryGroups() {
  const groups = new Map<string, OpportunityCategory[]>();
  for (const cat of OPPORTUNITY_CATEGORIES) {
    const rows = groups.get(cat.group) || [];
    rows.push(cat);
    groups.set(cat.group, rows);
  }
  return [...groups.entries()].map(([group, categories]) => ({ group, categories }));
}

export function getCategoryById(id: string) {
  return OPPORTUNITY_CATEGORIES.find((c) => c.id === id) || null;
}

export function searchCategories(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return OPPORTUNITY_CATEGORIES;
  return OPPORTUNITY_CATEGORIES.filter(
    (c) =>
      c.label.toLowerCase().includes(q) ||
      c.group.toLowerCase().includes(q) ||
      c.id.includes(q),
  );
}
