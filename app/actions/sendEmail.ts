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
      <!DOCTYPE html>
        <html>
            <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Connection Request</title>
            </head>
            <body style="margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            
            {/* Outer wrapper table forcing the full-width background color */}
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #09090b; width: 100% !important; margin: 0; padding: 40px 20px;">
                <tr>
                <td align="center" valign="top">
                    
                    {/* Main Content Box */}
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.35);">
                    
                    {/* Top Accent Bar */}
                    <tr>
                        <td height="4" style="background: linear-gradient(90deg, #3b82f6, #8b5cf6); line-height: 4px; font-size: 0px;">&nbsp;</td>
                    </tr>
                    
                    <tr>
                        <td style="padding: 32px 24px;">
                        
                        {/* Header */}
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                            <td>
                                <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; tracking-wider: 0.1em; color: #3b82f6; letter-spacing: 1.5px;">Portfolio Notification</span>
                                <h2 style="margin: 6px 0 24px 0; font-size: 22px; font-weight: 700; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">💼 Recruiter Connection Request</h2>
                            </td>
                            </tr>
                        </table>
                        
                        {/* Metadata Cards */}
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                            <tr>
                            <td style="padding: 14px 16px; background-color: #27272a/40; background: rgba(39, 39, 42, 0.4); border-radius: 8px; border: 1px solid #27272a;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="padding-bottom: 8px; font-size: 13px; color: #a1a1aa; width: 90px;"><strong>Sender:</strong></td>
                                    <td style="padding-bottom: 8px; font-size: 14px; color: #f4f4f5; font-weight: 500;">${payload.name}</td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 8px; font-size: 13px; color: #a1a1aa;"><strong>Company:</strong></td>
                                    <td style="padding-bottom: 8px; font-size: 14px; color: #f4f4f5; font-weight: 500;">${payload.company || "Not Specified"}</td>
                                </tr>
                                <tr>
                                    <td style="font-size: 13px; color: #a1a1aa;"><strong>Email:</strong></td>
                                    <td style="font-size: 14px; color: #3b82f6; font-weight: 500;"><a href="mailto:${payload.email}" style="color: #3b82f6; text-decoration: none;">${payload.email}</a></td>
                                </tr>
                                </table>
                            </td>
                            </tr>
                        </table>

                        {/* Message Section */}
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                            <td style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #71717a; letter-spacing: 0.5px; padding-bottom: 8px;">Message Details</td>
                            </tr>
                            <tr>
                            <td style="padding: 20px; background-color: #27272a/20; background: rgba(39, 39, 42, 0.2); border-left: 3px solid #6366f1; border-radius: 4px; font-size: 15px; color: #e4e4e7; line-height: 1.6; font-family: inherit; white-space: pre-wrap;">${payload.message}</td>
                            </tr>
                        </table>

                        {/* Footer */}
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 32px; border-top: 1px solid #27272a; padding-top: 20px;">
                            <tr>
                            <td align="center" style="font-size: 12px; color: #71717a; text-align: center;">
                                Sent securely via your portfolio platform routing mechanism.
                            </td>
                            </tr>
                        </table>

                        </td>
                    </tr>
                    </table>

                </td>
                </tr>
            </table>
            
            </body>
        </html>
      ${process.env.ID}
    `;

    const { error } = await resend.emails.send({
      from: `Caleb Liu Portfolio <onboarding@resend.dev>`,
      to: [targetInbox],
      subject: `${payload.name} from ${payload.company || " Company"}`,
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