import { Resend } from "resend";
import { NextResponse } from "next/server";
console.log(process.env.RESEND_API_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, email, phone, company, service, budget, message } = body;

    const { error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: ["nirajpatel.test@gmail.com"], // Replace with your email
      subject: `New Contact Form Submission from ${name}`,

      html: `
        <h2>New Contact Form Submission</h2>

        <p><strong>Name:</strong> ${name}</p>

        <p><strong>Email:</strong> ${email}</p>

        <p><strong>Phone:</strong> ${phone}</p>

        <p><strong>Company:</strong> ${company}</p>

        <p><strong>Service:</strong> ${service}</p>

        <p><strong>Budget:</strong> ${budget}</p>

        <p><strong>Message:</strong></p>

        <p>${message}</p>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);

      return NextResponse.json(
        {
          success: false,
          error,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
