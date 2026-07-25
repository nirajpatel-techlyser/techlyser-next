"use client";

import { FormEvent, useState, useTransition } from "react";
import { updateSocialLinks } from "@/actions/settings";
import type { SocialLinks } from "@/lib/settings";

type SocialLinksFormProps = {
  initialValues: SocialLinks;
};

const fields: Array<{
  key: keyof SocialLinks;
  label: string;
  placeholder: string;
}> = [
  {
    key: "whatsappUrl",
    label: "WhatsApp",
    placeholder: "https://wa.me/918819886862",
  },
  {
    key: "facebookUrl",
    label: "Facebook",
    placeholder: "https://facebook.com/yourpage",
  },
  {
    key: "googleUrl",
    label: "Google",
    placeholder: "https://g.page/your-business",
  },
  {
    key: "instagramUrl",
    label: "Instagram",
    placeholder: "https://instagram.com/yourhandle",
  },
  {
    key: "linkedinUrl",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/company/yourcompany",
  },
];

export default function SocialLinksForm({ initialValues }: SocialLinksFormProps) {
  const [values, setValues] = useState<SocialLinks>(initialValues);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    startTransition(async () => {
      const result = await updateSocialLinks(values);
      if (!result.success) {
        setError(result.error || "Could not save social links.");
        return;
      }
      setMessage("Social links saved. They now appear on the public CTA section.");
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {label}
            </label>
            <input
              type="url"
              value={values[key]}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [key]: e.target.value }))
              }
              placeholder={placeholder}
              className="w-full rounded-[5px] border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </div>
        ))}
      </div>

      {error ? (
        <p className="rounded-[5px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-[5px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn-brand rounded-[5px] px-5 py-3 text-sm font-medium transition disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save Social Links"}
      </button>
    </form>
  );
}
