import type { BusinessDiscoveryProvider } from "@/lib/business-discovery/provider-interface";
import { overpassProvider } from "@/lib/business-discovery/providers/overpass";

const providers: BusinessDiscoveryProvider[] = [overpassProvider];

export function listDiscoveryProviders() {
  return providers.map((p) => ({
    id: p.id,
    label: p.label,
    configured: p.configured(),
  }));
}

export function getDiscoveryProvider(id?: string | null) {
  if (id) {
    const found = providers.find((p) => p.id === id);
    if (found) return found;
  }
  return providers.find((p) => p.configured()) || null;
}

export function defaultDiscoveryProviderId() {
  return getDiscoveryProvider()?.id || "openstreetmap";
}
