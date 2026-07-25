import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import ServiceDetail from "@/components/services/ServiceDetail";
import CTA from "@/components/sections/CTA";
import {
  getAllServiceSlugs,
  getServiceBySlug,
} from "@/data/services";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    return {
      title: "Service not found",
    };
  }

  return {
    title: service.title,
    description: service.description,
    alternates: {
      canonical: service.href,
    },
    openGraph: {
      title: `${service.title} | Techlyser Web Solutions`,
      description: service.intro,
      url: service.href,
      type: "website",
      images: [{ url: service.coverImage, alt: service.coverAlt }],
    },
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <ServiceDetail service={service} />
        <CTA />
      </main>
    </div>
  );
}
