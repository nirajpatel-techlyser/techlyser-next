import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import ServiceDetail from "@/components/services/ServiceDetail";
import CTA from "@/components/sections/CTA";
import {
  getAllServiceSlugs,
  getServiceBySlug,
} from "@/data/services";
import { buildPageMetadata } from "@/lib/seo";

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

  return buildPageMetadata({
    title: service.seoTitle || service.title,
    description: service.seoDescription || service.description,
    path: service.href,
    keywords: service.keywords,
    ogImage: service.coverImage,
  });
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
