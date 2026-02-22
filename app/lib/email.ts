import nodemailer from 'nodemailer';

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASSWORD!,
    },
});

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.error('Email credentials not configured');
            return false;
        }

        const mailOptions = {
            from: `"VU Academic Hub" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: html,
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

export function generateOTP(): string {
    // Generate a 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOTPExpiryTime(): Date {
    // OTP valid for 10 minutes
    const now = new Date();
    return new Date(now.getTime() + 10 * 60 * 1000);
}

export function getOTPEmailTemplate(username: string, otp: string, type: string = 'registration'): string {
    const isPasswordReset = type === 'password_reset';
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
                .otp-box { background: white; padding: 20px; text-align: center; border: 2px solid #667eea; border-radius: 8px; margin: 20px 0; }
                .otp-text { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #667eea; font-family: monospace; }
                .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
                .warning { background: #fff3cd; border: 1px solid #ffc107; color: #856404; padding: 12px; border-radius: 4px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎓 VU Academic Hub</h1>
                    <p>${isPasswordReset ? 'Password Reset' : 'Email Verification'}</p>
                </div>
                <div class="content">
                    ${isPasswordReset ? '<h2>Password Reset Request</h2>' : '<h2>Welcome, ' + username + '!</h2>'}
                    <p>${isPasswordReset ? 'We received a request to reset your password. Use the code below to complete the password reset process:' : 'Thank you for signing up with VU Academic Hub. To complete your registration, please enter the following verification code:'}</p>
                    
                    <div class="otp-box">
                        <p style="margin: 0; font-size: 14px; color: #666;">Your ${isPasswordReset ? 'Reset' : 'Verification'} Code</p>
                        <div class="otp-text">${otp}</div>
                    </div>
                    
                    <div class="warning">
                        <strong>⚠️ Important:</strong> This code will expire in 10 minutes. Do not share this code with anyone.
                    </div>
                    
                    <p>${isPasswordReset ? 'If you did not request to reset your password, please ignore this email or contact our support team immediately.' : 'If you did not request this code, please ignore this email or contact our support team immediately.'}</p>
                    
                    <div class="footer">
                        <p>© 2026 VU Academic Hub - Powered by HSM TECH</p>
                        <p>This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    return html;
}

export function getWelcomeEmailTemplate(username: string, email: string): string {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
                .feature-list { list-style: none; padding: 0; }
                .feature-list li { padding: 10px 0; border-bottom: 1px solid #ddd; }
                .feature-list li:last-child { border-bottom: none; }
                .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎓 Welcome to VU Academic Hub!</h1>
                </div>
                <div class="content">
                    <h2>Hello ${username},</h2>
                    <p>Your account has been successfully created and verified. You can now access all VU Academic Hub features!</p>
                    
                    <h3>📚 What You Can Do:</h3>
                    <ul class="feature-list">
                        <li>✅ Access study materials and resources</li>
                        <li>✅ Practice MCQs and past papers</li>
                        <li>✅ Use AI Assistant for learning support</li>
                        <li>✅ Check announcements and updates</li>
                        <li>✅ Join our learning community</li>
                    </ul>
                    
                    <p><strong>Important:</strong> We'll send you email notifications for important announcements and updates. You can manage your notification preferences from your dashboard.</p>
                    
                    <div class="footer">
                        <p>© 2026 VU Academic Hub - Powered by HSM TECH</p>
                        <p>This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    return html;
}

export function getAnnouncementEmailTemplate(title: string, description: string, category: string): string {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
                .announcement { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
                .category-badge { display: inline-block; background: #667eea; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; margin-bottom: 10px; }
                .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📢 New Announcement</h1>
                </div>
                <div class="content">
                    <p>Hi there!</p>
                    <p>There's a new announcement for you:</p>
                    
                    <div class="announcement">
                        <div class="category-badge">${category}</div>
                        <h2>${title}</h2>
                        <p>${description}</p>
                    </div>
                    
                    <p><a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/announcements" style="color: #667eea; text-decoration: none; font-weight: bold;">View all announcements →</a></p>
                    
                    <div class="footer">
                        <p>© 2026 VU Academic Hub - Powered by HSM TECH</p>
                        <p>You're receiving this because you have email notifications enabled. <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard" style="color: #667eea;">Manage preferences</a></p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    return html;
}
