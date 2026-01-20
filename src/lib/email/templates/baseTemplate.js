/**
 * Base Email Template
 * 
 * Provides consistent header and footer for all order emails.
 * Uses inline CSS for maximum email client compatibility.
 * 
 * Features:
 * - Mobile-responsive design (max-width: 600px)
 * - Professional branding
 * - Consistent styling across all emails
 * - Footer with contact info
 * 
 * @param {string} content - HTML content to wrap
 * @param {string} preheader - Preview text shown in email clients
 * @returns {string} Complete HTML email
 */

export function baseTemplate(content, preheader = '') {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>E-Commerce Platform</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  
  <!-- Preheader text (hidden but shows in inbox preview) -->
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
    ${preheader}
  </div>
  
  <!-- Email Container -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        
        <!-- Main Content Card -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 32px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                🛒 E-Commerce
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                Your trusted online store
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; color: #6b7280; font-size: 14px; line-height: 20px;">
                    <p style="margin: 0 0 12px;">
                      <strong style="color: #374151;">Need help?</strong><br>
                      Contact us at <a href="mailto:support@ecommerce.com" style="color: #667eea; text-decoration: none;">support@ecommerce.com</a>
                    </p>
                    <p style="margin: 0 0 12px; font-size: 12px; color: #9ca3af;">
                      You're receiving this email because you placed an order on our platform.
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                      © ${new Date().getFullYear()} E-Commerce Platform. All rights reserved.
                    </p>
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
  `.trim();
}
