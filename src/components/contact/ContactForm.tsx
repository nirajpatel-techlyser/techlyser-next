"use client";
import { useState } from "react";
import ContactInfo from "./ContactInfo";

import { Button, Card, Container, Section } from "@/components/ui";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    service: "",
    budget: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");

        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          service: "",
          budget: "",
          message: "",
        });
      } else {
        setStatus("error");
        console.error(data);
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    }

    setLoading(false);
  };

  return (
    <Section>
      <Container>
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
          {/* Left - Contact Form */}
          <Card className="rounded-3xl p-8 lg:p-10">
            <h2 className="text-3xl font-bold text-slate-900">
              Tell us about your project
            </h2>

            <p className="mt-3 text-slate-600">
              Fill out the form below and we'll get back to you within one
              business day.
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              {/* Grid Inputs */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Company Name
                  </label>

                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your Company"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
                  />
                </div>

                {/* Service */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Service
                  </label>

                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
                  >
                    <option>Select a Service</option>
                    <option>Shopify Development</option>
                    <option>Next.js Development</option>
                    <option>WordPress Development</option>
                    <option>UI / UX Design</option>
                    <option>Performance Optimization</option>
                    <option>Technical SEO</option>
                  </select>
                </div>

                {/* Budget */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Project Budget
                  </label>

                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
                  >
                    <option>Select Budget</option>
                    <option>Less than $1,000</option>
                    <option>$1,000 - $3,000</option>
                    <option>$3,000 - $5,000</option>
                    <option>$5,000 - $10,000</option>
                    <option>$10,000+</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Project Details
                </label>

                <textarea
                  rows={6}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your project, goals, timeline, and any specific requirements..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
                />
              </div>

              {/* Submit */}
              <Button disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </Button>

              {status === "success" && (
                <p className="text-green-600 font-medium">
                  ✅ Your message has been sent successfully!
                </p>
              )}

              {status === "error" && (
                <p className="text-red-600 font-medium">
                  ❌ Something went wrong. Please try again.
                </p>
              )}
            </form>
          </Card>

          {/* Right - Contact Info */}
          <ContactInfo />
        </div>
      </Container>
    </Section>
  );
}
