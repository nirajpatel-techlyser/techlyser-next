import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";
import { siteConfig } from "@/lib/seo";
import { shopifyLocations, shopifyIndiaHub } from "@/data/shopify-locations";
import { services } from "@/data/services";

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/blog", label: "Blog" },
  { href: "/resources", label: "Free Resources" },
  { href: "/contact", label: "Contact" },
  { href: "/free-shopify-audit", label: "Free Shopify Audit" },
];

export default async function SiteFooter() {
  const settings = await getSiteSettings();
  const socials = [
    { href: settings.linkedinUrl, label: "LinkedIn" },
    { href: settings.instagramUrl, label: "Instagram" },
    { href: settings.facebookUrl, label: "Facebook" },
    { href: settings.googleUrl, label: "Google" },
  ].filter((item) => item.href);

  return (
    <footer className="border-t border-white/10 bg-[#0b1220] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-heading text-xl font-semibold text-white">
              {siteConfig.shortName}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Premium Shopify, Shopify Plus, Next.js, Headless Commerce,
              WordPress, and AI automation agency based in India.
            </p>
            <p className="mt-4 text-sm">
              <a
                href={`mailto:${siteConfig.email}`}
                className="hover:text-primary"
              >
                {siteConfig.email}
              </a>
            </p>
            <p className="mt-1 text-sm">
              <a href={`tel:${siteConfig.phone}`} className="hover:text-primary">
                {siteConfig.phoneDisplay}
              </a>
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {siteConfig.address.addressLocality}, {siteConfig.country}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
              Services
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={service.href}
                    className="transition hover:text-primary"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
              Company
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={shopifyIndiaHub.path}
                  className="transition hover:text-primary"
                >
                  Shopify Developers India
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
              Shopify by city
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {shopifyLocations.map((location) => (
                <li key={location.slug}>
                  <Link
                    href={`/shopify-developers/${location.slug}`}
                    className="transition hover:text-primary"
                  >
                    {location.city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} {siteConfig.legalName}. All rights
            reserved.
          </p>
          {socials.length > 0 ? (
            <ul className="flex flex-wrap gap-4 text-sm">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer me"
                    className="hover:text-primary"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
