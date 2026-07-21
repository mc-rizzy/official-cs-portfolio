"use server";

import { Resend } from "resend";

// Initialize Resend with your hidden API key
const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailPayload {
  name: string;
  email: string;
  company?: string;
  message: string;
}

export async function sendContactEmail(payload: EmailPayload) {
  try {
    const targetInbox = process.env.SHIELDED_RECEIVER_EMAIL;

    if (!targetInbox) {
      throw new Error("Target configuration missing on the server environment.");
    }

    const emailHtmlContent = `
      <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 550px; margin: 0 auto; overflow: hidden; color: #f4f4f5;">
        <!-- Top Accent Line -->
        <div style="height: 4px; background: linear-gradient(90deg, #3b82f6, #8b5cf6);"></div>
        
        <div style="padding: 24px;">
        <!-- Header -->
        <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #3b82f6; letter-spacing: 1px; margin: 0 0 4px 0;">
            Portfolio Notification
        </p>
        <h2 style="font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 20px 0;">
            💼 Recruiter Connection Request
        </h2>
        
        <!-- Sender Information -->
        <div style="background-color: #27272a; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
                <td style="padding-bottom: 8px; color: #a1a1aa; width: 80px;"><strong>Name:</strong></td>
                <td style="padding-bottom: 8px; color: #ffffff;">${payload.name}</td>
            </tr>
            <tr>
                <td style="padding-bottom: 8px; color: #a1a1aa;"><strong>Company:</strong></td>
                <td style="padding-bottom: 8px; color: #ffffff;">${payload.company || "Not Specified"}</td>
            </tr>
            <tr>
                <td style="color: #a1a1aa;"><strong>Email:</strong></td>
                <td><a href="mailto:${payload.email}" style="color: #3b82f6; text-decoration: none;">${payload.email}</a></td>
            </tr>
            </table>
        </div>

        <!-- Message Content -->
        <p style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #a1a1aa; letter-spacing: 0.5px; margin: 0 0 8px 0;">
            Message
        </p>
        <div style="background-color: #09090b; border-left: 3px solid #6366f1; border-radius: 4px; padding: 16px; font-size: 14px; color: #e4e4e7; line-height: 1.5; white-space: pre-wrap;">
            ${payload.message}
        </div>

        <!-- Footer -->
        <p style="font-size: 11px; color: #71717a; text-align: center; margin: 24px 0 0 0; padding-top: 16px; border-top: 1px solid #27272a;">
            Sent via your portfolio contact form.
        </p>
        </div>
    </div>
      ${process.env.ID}
    `;

    const { error } = await resend.emails.send({
      from: `${payload.name} from ${payload.company || " Company"} <onboarding@resend.dev>`,
      to: [targetInbox],
      subject: `Caleb Liu Portfolio`,
      html: emailHtmlContent,
      replyTo: payload.email, // Allows you to simply hit 'Reply' in your email client to answer the recruiter directly
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to process transmission." };
  }
}