"use client";

import { useState } from "react";
import ContactInfo from "./ContactInfo";
import { Button, Card, Container, Section } from "@/components/ui";
import {
  CONTACT_BUDGETS,
  CONTACT_SERVICES,
  type ContactFieldErrors,
  normalizeContactPayload,
  validateContactPayload,
} from "@/lib/contact";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  service: "",
  budget: "",
  message: "",
  website: "",
};

const fieldClass =
  "w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600";
const fieldErrorClass =
  "w-full rounded-xl border border-red-400 bg-transparent px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-red-500";

export default function ContactForm() {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | "">("");
  const [statusMessage, setStatusMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!(name in current)) return current;
      const next = { ...current };
      delete next[name as keyof ContactFieldErrors];
      return next;
    });
    setStatus("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("");
    setStatusMessage("");

    const payload = normalizeContactPayload(formData);
    const result = validateContactPayload(payload);
    if (!result.ok) {
      setErrors(result.errors);
      setStatus("error");
      setStatusMessage("Please fix the highlighted fields and try again.");
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
        errors?: ContactFieldErrors;
      };

      if (response.ok && data.success) {
        setStatus("success");
        setStatusMessage("Your message has been sent successfully!");
        setFormData(emptyForm);
        return;
      }

      if (data.errors) setErrors(data.errors);
      setStatus("error");
      setStatusMessage(data.error || "Something went wrong. Please try again.");
    } catch {
      setStatus("error");
      setStatusMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section>
      <Container>
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
          <Card className="keep-light rounded-3xl p-8 lg:p-10">
            <h2 className="text-3xl font-bold text-slate-900">Tell us about your project</h2>
            <p className="mt-3 text-slate-600">
              Fill out the form below and we&apos;ll get back to you within one business day.
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6" noValidate>
              {/* Honeypot — leave empty */}
              <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="name">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    autoComplete="name"
                    required
                    maxLength={120}
                    className={errors.name ? fieldErrorClass : fieldClass}
                  />
                  {errors.name ? <p className="mt-1 text-sm text-red-600">{errors.name}</p> : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    autoComplete="email"
                    required
                    maxLength={254}
                    className={errors.email ? fieldErrorClass : fieldClass}
                  />
                  {errors.email ? <p className="mt-1 text-sm text-red-600">{errors.email}</p> : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="phone">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                    maxLength={20}
                    className={errors.phone ? fieldErrorClass : fieldClass}
                  />
                  {errors.phone ? <p className="mt-1 text-sm text-red-600">{errors.phone}</p> : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="company">
                    Company Name
                  </label>
                  <input
                    id="company"
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your Company"
                    autoComplete="organization"
                    maxLength={160}
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="service">
                    Service <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                    className={errors.service ? fieldErrorClass : fieldClass}
                  >
                    <option value="">Select a Service</option>
                    {CONTACT_SERVICES.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                  {errors.service ? (
                    <p className="mt-1 text-sm text-red-600">{errors.service}</p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="budget">
                    Project Budget <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    required
                    className={errors.budget ? fieldErrorClass : fieldClass}
                  >
                    <option value="">Select Budget</option>
                    {CONTACT_BUDGETS.map((budget) => (
                      <option key={budget} value={budget}>
                        {budget}
                      </option>
                    ))}
                  </select>
                  {errors.budget ? (
                    <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="message">
                  Project Details <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="message"
                  rows={6}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your project, goals, timeline, and any specific requirements..."
                  required
                  minLength={20}
                  maxLength={5000}
                  className={errors.message ? fieldErrorClass : fieldClass}
                />
                {errors.message ? (
                  <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                ) : null}
              </div>

              <Button disabled={loading} type="submit">
                {loading ? "Sending..." : "Send Message"}
              </Button>

              {status === "success" ? (
                <p className="font-medium text-green-600">{statusMessage}</p>
              ) : null}
              {status === "error" ? (
                <p className="font-medium text-red-600">{statusMessage}</p>
              ) : null}
            </form>
          </Card>

          <ContactInfo />
        </div>
      </Container>
    </Section>
  );
}
