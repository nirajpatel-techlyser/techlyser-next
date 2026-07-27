import Link from "next/link";
import { shopifyIndiaHub, shopifyLocations } from "@/data/shopify-locations";
import { Container, Section } from "@/components/ui";

type ShopifyLocationLinksProps = {
  variant?: "compact" | "full";
};

export default function ShopifyLocationLinks({
  variant = "compact",
}: ShopifyLocationLinksProps) {
  if (variant === "compact") {
    return (
      <Section className="border-t border-[var(--border)] bg-background py-10 sm:py-12">
        <Container>
          <p className="text-center text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Shopify across India
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-[var(--foreground-muted)]">
            Looking for a{" "}
            <strong className="font-semibold text-heading">
              best Shopify agency
            </strong>
            ? Explore our India hub and city-specific Shopify developer pages.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              href={shopifyIndiaHub.path}
              className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-heading transition hover:border-primary hover:text-primary"
            >
              Shopify Developers India
            </Link>
            {shopifyLocations.map((loc) => (
              <Link
                key={loc.slug}
                href={`/shopify-developers/${loc.slug}`}
                className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm text-[var(--foreground-secondary)] transition hover:border-primary hover:text-primary"
              >
                {loc.city}
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="bg-background py-12">
      <Container>
        <h2 className="font-heading text-2xl font-semibold text-heading sm:text-3xl">
          Shopify developers by city
        </h2>
        <p className="mt-3 max-w-2xl text-[var(--foreground-muted)]">
          Dedicated pages for common search intent — each links to the same
          expert delivery team with localized context for your market.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li>
            <Link
              href={shopifyIndiaHub.path}
              className="block rounded-2xl border border-[var(--border)] bg-white p-5 transition hover:border-primary/40 hover:shadow-sm"
            >
              <p className="font-semibold text-heading">India (nationwide)</p>
              <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                Best Shopify agency for custom development, Plus, and growth.
              </p>
            </Link>
          </li>
          {shopifyLocations.map((loc) => (
            <li key={loc.slug}>
              <Link
                href={`/shopify-developers/${loc.slug}`}
                className="block rounded-2xl border border-[var(--border)] bg-white p-5 transition hover:border-primary/40 hover:shadow-sm"
              >
                <p className="font-semibold text-heading">{loc.city}</p>
                <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                  {loc.region} — {loc.metaDescription.slice(0, 90)}…
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
