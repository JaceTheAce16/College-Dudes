import nodemailer from 'nodemailer';

interface LeadData {
  name: string;
  phone: string;
  address: string;
  email?: string;
  services: string[];
  totalEstimate: number;
  paymentOption: string;
  drivewaySqFt?: number;
  timestamp: string;
}

export async function sendLeadEmail(lead: LeadData) {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromName = process.env.SMTP_FROM_NAME || 'College Dudes Quote Bot';

  const recipient = 'jessupjace@gmail.com';

  const servicesHtml = lead.services.map(s => `<li>${formatService(s)}</li>`).join('');

  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
      <!-- Header -->
      <div style="background-color: #0c1e35; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
        <span style="background-color: #3b82f6; color: #ffffff; font-weight: 900; font-style: italic; font-size: 20px; padding: 6px 12px; border-radius: 6px; display: inline-block; margin-bottom: 8px;">CD</span>
        <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: -0.5px;">New Quote Received!</h1>
        <p style="color: #94a3b8; font-size: 14px; margin: 4px 0 0 0;">College Dudes Power Cleaning - Geneva, IL</p>
      </div>

      <!-- Lead Summary Callout -->
      <div style="padding: 24px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
        <h2 style="font-size: 18px; font-weight: 700; margin-top: 0; color: #0c1e35; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Customer Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #475569; width: 120px;">Name:</td>
            <td style="padding: 6px 0; color: #1e293b;">${escapeHtml(lead.name)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #475569;">Phone:</td>
            <td style="padding: 6px 0; color: #1e293b;"><a href="tel:${lead.phone}" style="color: #22c55e; font-weight: bold; text-decoration: none;">${escapeHtml(lead.phone)}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #475569;">Email:</td>
            <td style="padding: 6px 0; color: #1e293b;">${lead.email ? `<a href="mailto:${lead.email}" style="color: #3b82f6; text-decoration: none;">${escapeHtml(lead.email)}</a>` : '<em>Not provided</em>'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #475569;">Address:</td>
            <td style="padding: 6px 0; color: #1e293b;">
              <a href="https://maps.google.com/?q=${encodeURIComponent(lead.address)}" target="_blank" style="color: #3b82f6; text-decoration: none;">
                ${escapeHtml(lead.address)}
              </a>
            </td>
          </tr>
        </table>
      </div>

      <!-- Services & Estimate -->
      <div style="padding: 24px; border-bottom: 1px solid #e2e8f0;">
        <h2 style="font-size: 18px; font-weight: 700; margin-top: 0; color: #0c1e35; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Clean Estimate Details</h2>
        
        <p style="font-weight: bold; color: #475569; margin-bottom: 6px;">Requested Services:</p>
        <ul style="margin: 0 0 16px 0; padding-left: 20px; color: #1e293b; line-height: 1.5;">
          ${servicesHtml}
        </ul>

        ${lead.drivewaySqFt ? `<p style="font-size: 13px; color: #64748b; margin-top: -10px; margin-bottom: 16px;">* Calculated driveway size: <strong>${lead.drivewaySqFt} sq. ft.</strong></p>` : ''}

        <table style="width: 100%; background-color: #f1f5f9; border-radius: 8px; padding: 16px; margin-top: 12px;">
          <tr>
            <td style="font-size: 14px; font-weight: bold; color: #475569;">Payment Preference:</td>
            <td style="font-size: 14px; font-weight: bold; color: #1e293b; text-align: right; text-transform: uppercase;">
              ${lead.paymentOption === 'pre_pay_save_10' ? '<span style="color: #22c55e;">Pre-Pay (Saved 10%)</span>' : 'Pay Later (At Service)'}
            </td>
          </tr>
          <tr>
            <td style="font-size: 18px; font-weight: 900; color: #0c1e35; padding-top: 8px;">Total Estimate:</td>
            <td style="font-size: 24px; font-weight: 900; color: #22c55e; text-align: right; padding-top: 8px;">
              $${lead.totalEstimate}
            </td>
          </tr>
        </table>
      </div>

      <!-- Footer Info -->
      <div style="padding: 24px; text-align: center; font-size: 12px; color: #64748b; background-color: #f8fafc; border-radius: 0 0 8px 8px;">
        <p style="margin: 0 0 6px 0;">This lead has been saved to your Firestore Database.</p>
        <p style="margin: 0;">Submitted on ${new Date(lead.timestamp).toLocaleString('en-US', { timeZone: 'America/Chicago' })} CST</p>
      </div>
    </div>
  `;

  const subject = `🔥 NEW LEAD: ${lead.name} - $${lead.totalEstimate}`;

  if (!user || !pass) {
    console.warn('⚠️ SMTP credentials not fully configured in environment variables. Email simulation:');
    console.log(`To: ${recipient}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${htmlContent.replace(/<[^>]*>/g, '').substring(0, 500)}... (truncated logs)`);
    return { success: true, simulated: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"${fromName}" <${user}>`,
      to: recipient,
      subject,
      html: htmlContent,
    });

    console.log(`✅ Quote email sent successfully to ${recipient}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending lead email via SMTP:', error);
    throw error;
  }
}

function formatService(s: string): string {
  if (s === 'exterior-siding') return '🏠 Exterior Siding Wash ($150 Flat-Rate)';
  if (s === 'one-trash-can') return '🗑️ Trash Can Sanitization - 1 Can ($35 Flat-Rate)';
  if (s === 'two-trash-cans') return '🗑️🗑️ Trash Can Sanitization - 2 Cans ($55 Flat-Rate)';
  if (s.startsWith('driveway-')) {
    const size = s.substring('driveway-'.length);
    let label = 'Driveway & Sidewalk Wash';
    if (size === 'small') label += ' - Small/Single Car ($100)';
    else if (size === 'medium') label += ' - Medium/Double Car ($160)';
    else if (size === 'large') label += ' - Large/Triple Car ($240)';
    else if (size === 'xl') label += ' - XL/Wrap-around Patio ($320)';
    return `🚗 ${label}`;
  }
  return s;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
