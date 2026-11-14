import { Resend } from "resend";

export async function sendAuditReportEmail(input: {
  to: string;
  name?: string | null;
  websiteUrl: string;
  pdfBase64: string;
  fileName: string;
}) {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    throw new Error("RESEND_API_KEY is not configured.");
  }
  const resend = new Resend(key);
  const greeting = input.name?.trim() ? `Hi ${input.name.trim()},` : "Hi,";
  const from = process.env.AUDIT_EMAIL_FROM?.trim() || "Techlyser <onboarding@resend.dev>";
  const result = await resend.emails.send({
    from,
    to: input.to,
    subject: "Your Website Growth Audit Report — Techlyser",
    html: `<p>${greeting}</p>
<p>Your personalized website growth audit is ready for <strong>${escape(input.websiteUrl)}</strong>.</p>
<p>We analyzed design, SEO, user experience, performance signals, mobile readiness and conversion opportunities.</p>
<p>Your report includes key findings, improvement opportunities, practical recommendations, and a prioritized action plan.</p>
<p>If you would like help implementing these improvements, the Techlyser team would be happy to discuss your requirements.</p>
<p>Regards,<br/>Team Techlyser<br/><a href="https://techlyser.com">https://techlyser.com</a></p>
<p style="color:#64748b;font-size:12px">© Techlyser. All Rights Reserved.</p>`,
    attachments: [
      {
        filename: input.fileName,
        content: Buffer.from(input.pdfBase64, "base64"),
      },
    ],
  });
  if (result.error) {
    throw new Error(result.error.message || "Email delivery failed.");
  }
  return result.data?.id || null;
}

function escape(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
