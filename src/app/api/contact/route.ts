import { Resend } from "resend";
import { NextResponse } from "next/server";
import {
  escapeHtml,
  normalizeContactPayload,
  validateContactPayload,
} from "@/lib/contact";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export async function POST(request: Request) {
  try {
    const resend = getResendClient();
    if (!resend) {
      return NextResponse.json(
        { success: false, error: "Email service is not configured." },
        { status: 500 },
      );
    }

    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid form data." },
        { status: 400 },
      );
    }

    const payload = normalizeContactPayload(raw);
    const result = validateContactPayload(payload);

    // Silent success for bots so they do not keep retrying.
    if (result.bot) {
      return NextResponse.json({ success: true });
    }

    if (!result.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Please fix the highlighted fields and try again.",
          errors: result.errors,
        },
        { status: 400 },
      );
    }

    const { error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: ["nirajpatel.test@gmail.com"],
      subject: `New Contact Form Submission from ${payload.name}`,
      replyTo: payload.email,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(payload.phone || "—")}</p>
        <p><strong>Company:</strong> ${escapeHtml(payload.company || "—")}</p>
        <p><strong>Service:</strong> ${escapeHtml(payload.service)}</p>
        <p><strong>Budget:</strong> ${escapeHtml(payload.budget)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(payload.message).replace(/\n/g, "<br />")}</p>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return NextResponse.json({ success: false, error: "Email could not be sent." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Something went wrong." }, { status: 500 });
  }
}
