import { FaWhatsapp } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { contactInfo } from "@/data/contact";
import { siteConfig } from "@/lib/seo";

type Props = {
  whatsappUrl?: string;
  email?: string;
};

export default function FloatingContactButtons({
  whatsappUrl,
  email,
}: Props) {
  const mail = email || siteConfig.email || contactInfo.email;
  const whatsapp =
    whatsappUrl ||
    contactInfo.whatsapp ||
    `https://wa.me/${siteConfig.phone.replace(/\D/g, "")}`;

  const mailtoHref = `mailto:${mail}?subject=${encodeURIComponent(
    "Project inquiry — Techlyser",
  )}`;

  const buttonClass =
    "inline-flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105 hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-5 sm:pb-5"
      aria-label="Quick contact"
    >
      {/* Desktop: email left, WhatsApp right */}
      <div className="pointer-events-none hidden md:flex md:items-end md:justify-between">
        <a
          href={mailtoHref}
          className={`pointer-events-auto ${buttonClass} bg-primary`}
          aria-label={`Email ${mail}`}
          title={`Email ${mail}`}
        >
          <MdEmail className="h-6 w-6" aria-hidden />
        </a>
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className={`pointer-events-auto ${buttonClass} bg-[#25D366]`}
          aria-label="Chat on WhatsApp"
          title="Chat on WhatsApp"
        >
          <FaWhatsapp className="h-6 w-6" aria-hidden />
        </a>
      </div>

      {/* Mobile: both stacked bottom-right */}
      <div className="pointer-events-none flex flex-col items-end gap-3 md:hidden">
        <a
          href={mailtoHref}
          className={`pointer-events-auto ${buttonClass} bg-primary`}
          aria-label={`Email ${mail}`}
          title={`Email ${mail}`}
        >
          <MdEmail className="h-6 w-6" aria-hidden />
        </a>
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className={`pointer-events-auto ${buttonClass} bg-[#25D366]`}
          aria-label="Chat on WhatsApp"
          title="Chat on WhatsApp"
        >
          <FaWhatsapp className="h-6 w-6" aria-hidden />
        </a>
      </div>
    </div>
  );
}
