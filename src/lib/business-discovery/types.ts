export type OpportunityCountry = {
  code: string;
  name: string;
};

export type OpportunityCity = {
  id: string;
  name: string;
  countryCode: string;
  stateCode?: string;
  latitude?: string;
  longitude?: string;
};

export type OpportunityCategory = {
  id: string;
  label: string;
  group: string;
  /** Provider-specific ids filled in Stage 3 (Places type, Yelp category, etc.). */
  providerHints: {
    googlePlacesTypes?: string[];
    osmTags?: string[];
  };
};

export type DiscoverFormState = {
  countryCode: string;
  cities: string[];
  categories: string[];
  radiusKm: number;
  resultLimit: number;
  websiteFilter: "any" | "no_website_listed" | "unverified";
  requireEmail: boolean;
  requirePhone: boolean;
};
