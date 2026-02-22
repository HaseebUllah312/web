# Email Verification & Notification System - Setup Guide

## Overview
This system provides:
1. **Secure Registration with OTP Verification**: Users register with email and receive a 6-digit OTP
2. **Email Notifications**: Users receive emails for announcements and updates
3. **Admin Notification Control**: Admins can send announcements to users (requires permission)
4. **Notification Preferences**: Users can enable/disable email notifications from dashboard

## 📋 Prerequisites

- Gmail account (for sending emails)
- Supabase account with a PostgreSQL database
- Node.js 16+
- All environment variables configured

## 🔧 Setup Steps

### Step 1: Install Dependencies
Already done! The following packages were installed:
- `nodemailer` - Email sending
- `dotenv` - Environment variable management

### Step 2: Configure Environment Variables

Create a `.env.local` file in your project root (copy from `.env.example`):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

#### Gmail Configuration
1. Go to [Google Account Settings](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication if not already enabled
3. Go to "App passwords" section
4. Create a new app password for "Mail" and "Windows Computer"
5. Copy the generated password and use it as `EMAIL_PASSWORD`

### Step 3: Database Schema Updates

Add these columns to your `users` table:

```sql
-- Add email and notification preferences to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT false;

-- Create notification_logs table for audit trail
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50),
  sent_by UUID REFERENCES public.users(id),
  successful_sends INT DEFAULT 0,
  failed_sends INT DEFAULT 0,
  total_users INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on notification_logs
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view logs
CREATE POLICY "Admins can view notification logs"
  ON public.notification_logs
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');
```

### Step 4: Update RLS Policies

Enable Row Level Security on the users table and add policies:

```sql
-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');
```

## 📚 New API Endpoints

### 1. Send OTP
```
POST /api/auth/send-otp
{
  "email": "user@example.com",
  "username": "johndoe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent to your email.",
  "email": "user@example.com"
}
```

### 2. Verify OTP & Register
```
POST /api/auth/verify-otp
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePassword123",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful! Please login.",
  "userId": "uuid-here"
}
```

### 3. Get Notification Settings
```
GET /api/notifications/settings
Authorization: Bearer {userId}
```

**Response:**
```json
{
  "email": "user@example.com",
  "notificationsEnabled": true
}
```

### 4. Update Notification Settings
```
PUT /api/notifications/settings
Authorization: Bearer {userId}
{
  "emailNotificationsEnabled": false
}
```

### 5. Send Notification to All Users (Admin Only)
```
POST /api/notifications/send
Authorization: Bearer {adminId}
{
  "title": "Spring 2026 Results Announced",
  "description": "Final exam results are now available on VULMS.",
  "category": "result",
  "targetAudience": "all"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notifications sent to 150 users.",
  "sentCount": 150,
  "failureCount": 2,
  "totalUsers": 152
}
```

## 🔐 Security Considerations

1. **OTP Expiry**: OTPs expire after 10 minutes
2. **Attempt Limits**: Maximum 3 incorrect OTP attempts before requiring resend
3. **Email Validation**: Emails are validated before sending OTP
4. **Admin Authorization**: Only users with `role: 'admin'` can send notifications
5. **RLS Policies**: Row-level security prevents unauthorized data access

## 📱 User Flows

### Registration Flow
1. User enters Email and Username → Receives OTP
2. User enters OTP code
3. User enters Password
4. Account created, welcome email sent
5. User redirected to login

### Notification Flow
1. Admin logs into admin panel
2. Navigates to Notifications Management
3. Creates announcement with title, description, and category
4. Clicks "Send to All Users"
5. Email sent to all users with notifications enabled
6. Users receive email with announcement

### Notification Preferences
1. User logs into dashboard
2. Accesses notification settings
3. Can toggle email notifications on/off
4. Changes saved immediately

## 🖥️ Admin Interface

Access admin notification control at:
```
/admin/notifications
```

Features:
- Send announcements to all users
- Select announcement category
- Real-time preview of email
- Statistics on last batch sent
- Character limits to ensure email readability

## 🐛 Troubleshooting

### Emails not sending
- Verify Gmail credentials in `.env.local`
- Check if "Less secure app access" is enabled (if using regular password)
- Ensure NEXT_PUBLIC_BASE_URL is set correctly
- Check email logs for errors

### OTP not being received
- Check spam/junk folder
- Verify EMAIL_USER is correct
- Check if email service is responding
- Look for errors in server logs

### Users not receiving notifications
- Verify email_notifications_enabled is true in database
- Check if user email is valid
- Ensure admin has proper permissions
- Review notification_logs table for failures

## 📊 Database Tables Added

### notification_logs
Tracks all notifications sent:
- `id`: UUID primary key
- `title`: Notification title
- `description`: Notification description
- `category`: Announcement category
- `sent_by`: Admin user ID who sent it
- `successful_sends`: Count of successful emails
- `failed_sends`: Count of failed emails
- `total_users`: Total users targeted
- `created_at`: Timestamp

## 🚀 Next Steps (Optional Enhancements)

1. **Redis for OTP Storage**: Replace in-memory OTP storage with Redis for better scalability
2. **Email Templates Database**: Store custom email templates in database
3. **Notification History**: Show users their notification history
4. **Scheduled Announcements**: Allow admins to schedule notifications for future times
5. **Email Analytics**: Track open rates and clicks
6. **User Segments**: Send notifications to specific user groups
7. **Email Queue**: Implement job queue for sending bulk emails asynchronously

## 👤 Support

For issues or questions about the email notification system, contact your development team.

Last Updated: February 21, 2026
