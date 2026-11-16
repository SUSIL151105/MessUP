import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface EmailConfig {
  serviceId?: string;
  templateId?: string;
  publicKey?: string;
  senderEmail?: string;
}

export interface WelcomeEmailPayload {
  recipientName: string;
  recipientEmail: string;
  role: 'STUDENT' | 'FOOD_INCHARGE';
  temporaryPassword?: string;
  portalName: string;
  assignedMess?: string;
  assignedHostel?: string;
  institutionName?: string;
  loginUrl?: string;
  isApprovalNotification?: boolean;
  senderEmail?: string;
  senderName?: string;
}

export interface EmailDispatchRecord {
  id: string;
  recipientEmail: string;
  recipientName: string;
  role: 'STUDENT' | 'FOOD_INCHARGE';
  subject: string;
  htmlContent: string;
  plainText: string;
  sentAt: number;
  status: 'SENT' | 'SIMULATED' | 'FAILED';
  deliveryMethod: string;
  error?: string;
}

export class EmailNotificationService {
  private static readonly STORAGE_KEY = 'messup_sent_emails';
  private static readonly CONFIG_KEY = 'messup_email_config';

  /**
   * Generates a personalized, role-based email template including
   * welcoming message, login credentials, and detailed application usage guide.
   */
  static generateEmailTemplate(payload: WelcomeEmailPayload): { subject: string; html: string; plainText: string } {
    const isStudent = payload.role === 'STUDENT';
    const isApproval = !!payload.isApprovalNotification;
    const roleTitle = isStudent ? 'Student Resident' : 'Food Incharge / Mess Supervisor';
    const initialPassword = payload.temporaryPassword || 'Cutm@cit123';
    const cleanEmail = payload.recipientEmail.trim().toLowerCase();
    const instName = payload.institutionName || 'Centurion University of Technology and Management';
    const assignedLocation = isStudent
      ? `${payload.assignedMess || 'Assigned Mess Facility'} | Hostel: ${payload.assignedHostel || 'Hostel Block'}`
      : `${payload.assignedMess || 'Assigned Mess Facility'}`;

    const subject = isApproval
      ? `MessUP Account Verified - Access Granted to ${payload.recipientName}`
      : isStudent
      ? `Welcome to MessUP - Student Access Credentials & Application Guide (${payload.recipientName})`
      : `Welcome to MessUP - Food Incharge Authorization & Management Guide (${payload.recipientName})`;

    const senderEmail = payload.senderEmail || 'theweber0000@gmail.com';
    const senderName = payload.senderName || 'MessUP Campus Administration';

    // Plain Text Version (for SMS, text-only mail clients, and mailto/Gmail pre-fill)
    const plainText = isStudent
      ? `
Hello ${payload.recipientName},

Welcome to the MessUP Student Dining & Food Quality Portal (${instName})!

Your administrator (${senderEmail}) has registered and verified your student dining account. Below are your official access credentials and guide on how to use the MessUP Android application.

==================================================
YOUR LOGIN CREDENTIALS
==================================================
• Authorized Role: Student Resident
• Registered Gmail ID: ${cleanEmail}
• Default Password: ${initialPassword}
• Assigned Mess: ${payload.assignedMess || 'Assigned Dining Hall'}
• Assigned Hostel: ${payload.assignedHostel || 'Hostel Residence'}
• Institution: ${instName}
• Administrator Contact: ${senderEmail}

==================================================
HOW TO USE THE MESSUP APPLICATION (STUDENT GUIDE)
==================================================
1. DAILY MEAL MENUS:
   Open the "Menu" tab in your MessUP app to see today's breakfast, lunch, snacks, and dinner dishes. Each item displays dietary tags (Pure Veg, Non-Veg, Egg) and allergen warnings to help you dine safely.

2. REAL-TIME MEAL RATINGS:
   After every meal, open the "Rating" tab. Rate your dining experience across 5 core parameters: Taste, Freshness & Quality, Hygiene, Portion Size, and Overall Satisfaction. Your feedback directly determines monthly catering quality scores!

3. COMPLAINTS & GRIEVANCE REPORTING:
   Encountered cold food, hygiene lapses, or service issues? Head to the "Feedback" tab. You can submit complaints with optional photos and geotags. You can also mark reports as "Private" so only the Chief Administration can see them.

4. DINING INSIGHTS & ATTENDANCE:
   Visit the "Insights" tab to review your dining attendance history, monthly trends, and top-rated campus dishes.

5. PROFILE & HOSTEL ROOM INFO:
   Open your "Profile" tab to verify your assigned mess hall and hostel block. Tap "Edit Details" anytime to keep your contact phone number updated.

6. ACCOUNT SECURITY:
   For your privacy, we recommend logging into the app and updating your password using the "Forgot Password?" option on the login screen or via your profile settings.

Best regards,
${senderName} (${senderEmail})
${instName}
`.trim()
      : `
Hello ${payload.recipientName},

Welcome to the MessUP Food Incharge & Operations Management Portal (${instName})!

Your Food Incharge & Catering Supervisor account has been officially authorized by Administrator (${senderEmail}). Below are your administrative login credentials and complete operations guide.

==================================================
YOUR LOGIN CREDENTIALS
==================================================
• Authorized Role: Food Incharge / Mess Supervisor
• Registered Gmail ID: ${cleanEmail}
• Default Password: ${initialPassword}
• Managed Mess Facility: ${payload.assignedMess || 'Assigned Dining Facility'}
• Institution: ${instName}
• Administrator Contact: ${senderEmail}

==================================================
HOW TO USE THE MESSUP APPLICATION (INCHARGE GUIDE)
==================================================
1. PUBLISH & UPDATE DAILY MENUS:
   Open the "Menu Manager" tab on your incharge portal to draft and publish menus for Breakfast, Lunch, Snacks, and Dinner. Add special festive items, mark dietary tags (Veg/Non-Veg/Egg), and announce menu changes in real time.

2. MONITOR LIVE STUDENT RATINGS & QUALITY DASHBOARD:
   Inspect the "Ratings" dashboard to monitor real-time student satisfaction across Taste, Food Quality, Hygiene, and Portion Sufficiency. Quickly detect low-rated meals and make immediate kitchen adjustments.

3. GRIEVANCE INBOX & RESOLUTION TRACKING:
   Access the "Feedback Inbox" to review student complaints. Investigate issues with your kitchen staff, resolve grievances, and update issue statuses to keep administration and students informed.

4. BROADCAST CAMPUS ANNOUNCEMENTS:
   Use the "Announcements" feature to broadcast urgent alerts to all students assigned to your mess hall (e.g., special feast schedules, maintenance breaks, or temporary timing shifts).

5. FACILITY PROFILE:
   Maintain verified contact phone numbers and facility details to ensure seamless emergency dining oversight.

6. ACCOUNT SECURITY:
   Please log into your portal and update your password to secure food supervisory records.

Best regards,
${senderName} (${senderEmail})
${instName}
`.trim();

    // Responsive HTML Email Template with Modern Visual Styling
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, ${isStudent ? '#065f46 0%, #047857 100%' : '#1e3a8a 0%, #2563eb 100%'}); padding: 32px 30px; text-align: left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; display: block;">MessUP</span>
                    <span style="font-size: 11px; font-weight: 700; color: ${isStudent ? '#a7f3d0' : '#bfdbfe'}; text-transform: uppercase; letter-spacing: 1px;">
                      ${isStudent ? 'Student Dining & Quality Portal' : 'Food Incharge Operations Portal'}
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 6px 14px; background: rgba(255, 255, 255, 0.18); border-radius: 20px; color: #ffffff; font-size: 12px; font-weight: 700;">
                      ${isStudent ? '🎓 Student' : '👨‍🍳 Food Incharge'}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 35px 30px;">
              <h2 style="font-size: 21px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 10px;">
                Hello ${payload.recipientName},
              </h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-top: 0; margin-bottom: 24px;">
                ${isStudent
                  ? `Welcome to <strong>MessUP</strong>! Your student account has been officially registered and provisioned on the campus network. You now have full access to daily meal schedules, live food reviews, and quality tracking.`
                  : `Welcome to <strong>MessUP</strong>! Your Food Incharge & Operations account has been officially authorized. You have been granted oversight of meal publishing, live student ratings, and grievance resolution.`
                }
              </p>

              <!-- Credentials Card -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 22px; margin-bottom: 28px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                  <tr>
                    <td>
                      <span style="font-size: 11px; font-weight: 800; color: ${isStudent ? '#047857' : '#2563eb'}; text-transform: uppercase; letter-spacing: 1px;">
                        Official Access Credentials
                      </span>
                    </td>
                    <td align="right">
                      <span style="font-size: 10px; font-weight: 700; background: #e2e8f0; color: #475569; padding: 2px 8px; border-radius: 6px;">
                        Default Password
                      </span>
                    </td>
                  </tr>
                </table>

                <table width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 13px;">
                  <tr>
                    <td width="36%" style="color: #64748b; font-weight: 600;">Authorized Role:</td>
                    <td style="color: #0f172a; font-weight: 700;">${roleTitle}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600;">Login Gmail ID:</td>
                    <td style="color: #0f172a; font-weight: 700; font-family: monospace; font-size: 13px;">${cleanEmail}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600;">Initial Password:</td>
                    <td>
                      <span style="color: #047857; font-weight: 800; font-family: monospace; font-size: 15px; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 6px; display: inline-block;">
                        ${initialPassword}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600;">Assigned Facility:</td>
                    <td style="color: #0f172a; font-weight: 600;">${assignedLocation}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600;">Institution:</td>
                    <td style="color: #0f172a;">${instName}</td>
                  </tr>
                </table>
              </div>

              <!-- How to Use the Application Section (Role-Based) -->
              <div style="margin-bottom: 28px;">
                <h3 style="font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${isStudent ? '📱 How to Use the MessUP App (Student Guide)' : '💼 How to Use the MessUP App (Incharge Operations Guide)'}
                </h3>
                <p style="font-size: 12px; color: #64748b; margin-top: 0; margin-bottom: 16px;">
                  ${isStudent
                    ? 'Here is how to make the most of your dining app every day:'
                    : 'Here is your daily operational workflow to maintain high dining standards:'}
                </p>

                ${isStudent ? `
                <!-- Student Usage Steps -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                      <strong style="color: #047857;">1. Daily Meal Menus:</strong><br>
                      <span style="color: #475569; font-size: 12px; line-height: 1.5;">
                        Check real-time breakfast, lunch, snacks, and dinner menus with diet indicators (Pure Veg, Non-Veg, Egg) and allergen warnings.
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                      <strong style="color: #047857;">2. Live Meal Ratings:</strong><br>
                      <span style="color: #475569; font-size: 12px; line-height: 1.5;">
                        Rate each meal after eating across 5 dimensions: <em>Taste, Quality, Hygiene, Portion Size, and Overall Satisfaction</em>. Your ratings directly drive mess accountability!
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                      <strong style="color: #047857;">3. Grievances & Feedback:</strong><br>
                      <span style="color: #475569; font-size: 12px; line-height: 1.5;">
                        Encountered cold food, hygiene lapses, or service issues? Submit complaints with optional photo evidence. Mark sensitive issues as <em>Private</em> to notify head administration.
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                      <strong style="color: #047857;">4. Dining Attendance & Analytics:</strong><br>
                      <span style="color: #475569; font-size: 12px; line-height: 1.5;">
                        Track your monthly meal attendance and review highest-rated campus food dishes.
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0;">
                      <strong style="color: #047857;">5. Profile & Room Details:</strong><br>
                      <span style="color: #475569; font-size: 12px; line-height: 1.5;">
                        Check your assigned hostel block and mess hall. Tap <em>Edit Details</em> anytime to keep your contact phone number current.
                      </span>
                    </td>
                  </tr>
                </table>
                ` : `
                <!-- Food Incharge Usage Steps -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                      <strong style="color: #2563eb;">1. Menu Publishing & Management:</strong><br>
                      <span style="color: #475569; font-size: 12px; line-height: 1.5;">
                        Draft, edit, and publish daily meals (Breakfast, Lunch, Snacks, Dinner). Add special dishes, mark allergens, and update changes in real time.
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                      <strong style="color: #2563eb;">2. Live Student Ratings Dashboard:</strong><br>
                      <span style="color: #475569; font-size: 12px; line-height: 1.5;">
                        Monitor real-time student satisfaction scores across Taste, Food Quality, Hygiene, and Portion Sufficiency. Identify low-rated dishes immediately.
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                      <strong style="color: #2563eb;">3. Grievance Inbox & Resolution:</strong><br>
                      <span style="color: #475569; font-size: 12px; line-height: 1.5;">
                        Review complaints submitted by dining students. Investigate issues with kitchen staff, resolve them, and update statuses to keep administration informed.
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                      <strong style="color: #2563eb;">4. Broadcast Urgent Announcements:</strong><br>
                      <span style="color: #475569; font-size: 12px; line-height: 1.5;">
                        Send instant dining alerts (e.g., festive banquet hours, menu replacements, or schedule changes) directly to all students dining at your facility.
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0;">
                      <strong style="color: #2563eb;">5. Facility Profile Supervision:</strong><br>
                      <span style="color: #475569; font-size: 12px; line-height: 1.5;">
                        Keep managed facility details and verified supervisor phone numbers updated for campus dining oversight.
                      </span>
                    </td>
                  </tr>
                </table>
                `}
              </div>

              <!-- Security Notice Box -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
                <p style="font-size: 12px; line-height: 1.5; color: #1e40af; margin: 0;">
                  <strong>🔒 Password Security Tip:</strong> For your personal privacy, log into the MessUP Android application and change your default password using <em>"Forgot Password?"</em> on the login screen or via your profile settings.
                </p>
              </div>

              <!-- Quick Start Steps -->
              <div style="background-color: #f1f5f9; border-radius: 12px; padding: 16px; font-size: 12px; color: #475569;">
                <strong style="color: #0f172a; display: block; margin-bottom: 6px;">Ready to get started?</strong>
                1. Open the <strong>MessUP</strong> Android application on your smartphone.<br>
                2. Enter your registered Gmail (<code style="color: #047857; font-weight: bold;">${cleanEmail}</code>).<br>
                3. Enter your default password (<code style="color: #047857; font-weight: bold;">${initialPassword}</code>) and tap <strong>Log In</strong>.
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 30px; text-align: center;">
              <p style="font-size: 12px; font-weight: 600; color: #475569; margin: 0 0 4px 0;">
                MessUP Campus Dining & Quality Assurance Platform
              </p>
              <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0;">
                ${instName} • Dispatched by Admin: <strong style="color: #047857;">${senderEmail}</strong>
              </p>
              <p style="font-size: 10px; color: #94a3b8; margin: 0;">
                This automated email was sent to ${cleanEmail}. Administrator contact: ${senderEmail}.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    return { subject, html, plainText };
  }

  /**
   * Generates a direct Gmail compose link to dispatch this email via the user's Gmail in browser.
   * Pre-selects the admin's Gmail ID via authuser parameter.
   */
  static getGmailComposeUrl(payload: WelcomeEmailPayload, adminEmail?: string): string {
    const { subject, plainText } = this.generateEmailTemplate(payload);
    const cleanEmail = payload.recipientEmail.trim().toLowerCase();
    const sender = adminEmail || payload.senderEmail || 'theweber0000@gmail.com';
    const authUserParam = sender ? `authuser=${encodeURIComponent(sender)}&` : '';
    return `https://mail.google.com/mail/?${authUserParam}view=cm&fs=1&to=${encodeURIComponent(cleanEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainText)}`;
  }

  /**
   * Generates standard mailto URL
   */
  static getMailtoUrl(payload: WelcomeEmailPayload): string {
    const { subject, plainText } = this.generateEmailTemplate(payload);
    const cleanEmail = payload.recipientEmail.trim().toLowerCase();
    return `mailto:${cleanEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainText)}`;
  }

  static getEmailConfig(): EmailConfig {
    const saved = localStorage.getItem(this.CONFIG_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {
      serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
      templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
      publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
      senderEmail: 'theweber0000@gmail.com'
    };
  }

  static saveEmailConfig(config: EmailConfig) {
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
  }

  /**
   * Dispatches the welcome email across live delivery channels:
   * 1. Direct Firestore 'mail' collection (triggers Firebase Trigger Email extension / Cloud SMTP worker)
   * 2. EmailJS REST API if service credentials are provided
   * 3. Comprehensive audit and local mailbox registry
   */
  static async sendWelcomeEmail(payload: WelcomeEmailPayload): Promise<EmailDispatchRecord> {
    const { subject, html, plainText } = this.generateEmailTemplate(payload);
    const cleanEmail = payload.recipientEmail.trim().toLowerCase();
    const emailId = 'MAIL_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const config = this.getEmailConfig();
    const senderEmail = payload.senderEmail || config.senderEmail || 'theweber0000@gmail.com';
    const senderName = payload.senderName || 'MessUP Campus Administration';
    let deliveryMethod = `Firestore Trigger Email (Sender: ${senderEmail})`;
    let deliveryStatus: 'SENT' | 'SIMULATED' | 'FAILED' = 'SENT';
    let deliveryError: string | undefined = undefined;

    // 1. Write to Firestore 'mail' collection with non-blocking timeout
    try {
      const mailDocPromise = setDoc(doc(db, 'mail', emailId), {
        to: [cleanEmail],
        from: `${senderName} <${senderEmail}>`,
        replyTo: senderEmail,
        message: {
          subject,
          text: plainText,
          html
        },
        metadata: {
          senderEmail,
          senderName,
          recipientName: payload.recipientName,
          recipientEmail: cleanEmail,
          role: payload.role,
          initialPassword: payload.temporaryPassword || 'Cutm@cit123',
          assignedMess: payload.assignedMess || '',
          assignedHostel: payload.assignedHostel || '',
          isApprovalNotification: !!payload.isApprovalNotification,
          timestamp: Date.now()
        }
      });
      // Allow up to 3 seconds for Firestore to respond
      await Promise.race([
        mailDocPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore mail queue write timed out')), 3000))
      ]);
      deliveryMethod = `Firestore Trigger Email (Sender: ${senderEmail})`;
      deliveryStatus = 'SENT';
      console.log(`[MessUP Mail Service] Queued in Firestore 'mail/${emailId}' for: ${cleanEmail} from: ${senderEmail}`);
    } catch (e: any) {
      console.warn('Firestore mail collection write notice:', e?.message || e);
      deliveryError = e?.message || 'Firestore mail collection write timed out or offline';
      deliveryMethod = `Local Mail Queue (Sender: ${senderEmail})`;
      deliveryStatus = 'SIMULATED';
    }

    // 2. If EmailJS keys configured, send directly via EmailJS REST API
    if (config.serviceId && config.templateId && config.publicKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            service_id: config.serviceId,
            template_id: config.templateId,
            user_id: config.publicKey,
            template_params: {
              from_name: senderName,
              from_email: senderEmail,
              reply_to: senderEmail,
              to_name: payload.recipientName,
              to_email: cleanEmail,
              user_password: payload.temporaryPassword || 'Cutm@cit123',
              assigned_mess: payload.assignedMess || 'Campus Dining Block',
              assigned_hostel: payload.assignedHostel || 'Campus Residence',
              role_title: payload.role === 'STUDENT' ? 'Student' : 'Food Incharge',
              subject,
              message_html: html
            }
          })
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          deliveryMethod = `EmailJS Cloud API (Sender: ${senderEmail})`;
          deliveryStatus = 'SENT';
          deliveryError = undefined;
        } else {
          const errText = await response.text();
          console.warn('EmailJS API response not ok:', errText);
        }
      } catch (err: any) {
        console.warn('EmailJS dispatch note:', err?.message || err);
      }
    }

    const record: EmailDispatchRecord = {
      id: emailId,
      recipientEmail: cleanEmail,
      recipientName: payload.recipientName,
      role: payload.role,
      subject,
      htmlContent: html,
      plainText,
      sentAt: Date.now(),
      status: deliveryStatus,
      deliveryMethod,
      error: deliveryError
    };

    // Store in sent email records for transparency and audit trail
    const existing = this.getSentEmails();
    const updated = [record, ...existing].slice(0, 100);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));

    return record;
  }

  /**
   * Dispatches an account approval notice email when a student is verified
   */
  static async sendApprovalEmail(
    student: { name: string; email: string; messName?: string; hostelName?: string; institutionName?: string },
    adminEmail?: string
  ): Promise<EmailDispatchRecord> {
    return this.sendWelcomeEmail({
      recipientName: student.name,
      recipientEmail: student.email,
      role: 'STUDENT',
      temporaryPassword: 'Cutm@cit123',
      portalName: 'MessUP Student Dining Portal',
      assignedMess: student.messName || 'Assigned Mess Facility',
      assignedHostel: student.hostelName || 'Hostel Block',
      institutionName: student.institutionName || 'University Campus',
      isApprovalNotification: true,
      senderEmail: adminEmail || 'theweber0000@gmail.com',
      senderName: 'MessUP Campus Administration'
    });
  }

  /**
   * Retrieves list of all sent emails
   */
  static getSentEmails(): EmailDispatchRecord[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
}
