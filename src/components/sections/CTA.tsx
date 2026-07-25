import Link from "next/link";
import {
  FaFacebookF,
  FaGoogle,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
} from "react-icons/fa";
import { ArrowRight } from "lucide-react";
import { cta } from "@/data/cta";
import { getSiteSettings } from "@/lib/settings";
import { Button, Container, Section } from "@/components/ui";

const socialConfig = [
  { key: "whatsappUrl" as const, label: "WhatsApp", Icon: FaWhatsapp },
  { key: "facebookUrl" as const, label: "Facebook", Icon: FaFacebookF },
  { key: "googleUrl" as const, label: "Google", Icon: FaGoogle },
  { key: "instagramUrl" as const, label: "Instagram", Icon: FaInstagram },
  { key: "linkedinUrl" as const, label: "LinkedIn", Icon: FaLinkedinIn },
];

export default async function CTA() {
  const settings = await getSiteSettings();
  const socials = socialConfig
    .map(({ key, label, Icon }) => ({
      label,
      Icon,
      href: settings[key],
    }))
    .filter((item) => Boolean(item.href));

  const whatsappHref =
    settings.whatsappUrl || cta.secondaryButton.href;

  return (
    <Section className="bg-background">
      <Container>
        <div className="relative overflow-hidden rounded-[20px] border border-[var(--border)] bg-background px-8 py-16 text-center lg:px-24 lg:py-20">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/10" />
          <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-primary/5" />

          <div className="relative z-10 mx-auto max-w-4xl">
            <p className="text-sm font-medium uppercase tracking-[0.35em] text-primary">
              {cta.badge}
            </p>

            <h2 className="mt-6 text-4xl font-semibold tracking-tight text-heading lg:text-6xl">
              {cta.title}{" "}
              <span className="text-primary">{cta.titleHighlight}</span>
            </h2>

            <p className="mx-auto mt-8 max-w-2xl text-lg font-normal leading-8 text-[var(--foreground-muted)]">
              {cta.description}
            </p>

            <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
              <Button variant="primary" href={cta.primaryButton.href}>
                {cta.primaryButton.text}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button href={whatsappHref} variant="bg_secondBtn">
                <FaWhatsapp className="mr-2 h-5 w-5" />
                {cta.secondaryButton.text}
              </Button>
            </div>

            {socials.length > 0 ? (
              <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
                {socials.map(({ href, label, Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-[5px] border border-[var(--border)] text-[var(--heading)] transition hover:border-primary hover:text-primary"
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-10 text-sm text-[var(--foreground-muted)]">
                Add social links from Admin → Settings to show icons here.
              </p>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
