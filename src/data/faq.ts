import {
  Clock,
  CreditCard,
  Rocket,
  ArrowLeftRight,
  Shield,
  Code2,
  Headset,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  icon: LucideIcon;
  category?: string;
}

export const faqSectionMeta = {
  caption: "FAQ",
  title: "Questions we",
  titleHighlight: "get all the time",
  description:
    "Everything you need to know before starting a project with us. Still have a question? Just drop us a message — we reply within a few hours.",
  ctaText: "Ask us directly",
  ctaHref: "/contact",
};

export const faqItems: FaqItem[] = [
  {
    id: 1,
    icon: Clock,
    category: "shopify",
    question: "How long does a Shopify project take from start to finish?",
    answer:
      "Most custom Shopify builds take 3–4 weeks from design approval to launch. Simpler projects like landing pages can go live in 8–10 days. Larger builds — multi-currency stores, custom apps, complex migrations — typically run 4–6 weeks. We give you a specific timeline after the scoping call so there are no surprises.",
  },
  {
    id: 2,
    icon: CreditCard,
    category: "shopify",
    question: "What does a custom Shopify store cost?",
    answer:
      "Pricing depends on scope — a landing page starts from ₹15,000, a full custom Shopify theme from ₹50,000, and complex builds with custom apps or integrations from ₹1,00,000+. We always share a fixed-price quote after the scoping call, so you know the exact cost before we start — no hidden charges.",
  },
  {
    id: 3,
    icon: Rocket,
    category: "shopify",
    question: "Do you work with new brands launching their first store?",
    answer:
      "Absolutely. About 40% of our clients are launching for the first time. We guide you through everything — platform setup, domain, payment gateways, product uploads, and going live. You don't need any technical knowledge. We handle the entire build and hand you a store that's ready to sell on day one.",
  },
  {
    id: 4,
    icon: ArrowLeftRight,
    category: "shopify",
    question:
      "Can you migrate my existing store from WooCommerce or another platform?",
    answer:
      "Yes — we've done migrations from WooCommerce, Magento, Wix, Squarespace, and custom-built sites. We migrate your products, customer data, order history, and URLs with zero downtime and zero SEO loss. Your store stays live throughout the process and we run rigorous QA before switching over.",
  },
  {
    id: 5,
    icon: Shield,
    category: "shopify",
    question: "Will you work on my live store without breaking it?",
    answer:
      "We always develop on a duplicate theme or a staging environment — never directly on your live store. Your customers keep shopping without interruption. Only once everything is tested, approved, and QA'd do we push live — usually in a single off-peak publish that takes under 5 minutes.",
  },
  {
    id: 6,
    icon: Code2,
    category: "shopify",
    question:
      "Do you build custom Shopify apps if I need features that don't exist?",
    answer:
      "Yes. We build private Shopify apps for features the App Store doesn't offer — custom loyalty programs, subscription logic, wholesale pricing rules, multi-warehouse routing, custom checkout flows, and more. These are built using Shopify's official APIs and are fully maintained by our team.",
  },
  {
    id: 7,
    icon: Headset,
    category: "shopify",
    question: "What support do I get after the store goes live?",
    answer:
      "Every project includes 30 days of free post-launch support — bug fixes, small tweaks, and questions. After that, we offer monthly maintenance retainers for ongoing updates, performance monitoring, and new feature development. Most clients stay on retainer — we become their long-term Shopify team.",
  },
];
