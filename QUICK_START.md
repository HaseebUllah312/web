# ⚡ Quick Start Checklist - Email Verification System

Complete these steps in order to get the system up and running:

## Phase 1: Environment Setup (5 minutes)

- [ ] **1a. Create `.env.local` file**
  ```bash
  # Copy .env.example to .env.local
  cp .env.example .env.local
  ```

- [ ] **1b. Configure Supabase**
  - Get `SUPABASE_URL` from Supabase project settings
  - Get `SUPABASE_SERVICE_ROLE_KEY` from API keys section
  - Add to `.env.local`

- [ ] **1c. Configure Gmail**
  1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
  2. Enable 2-Step Verification (if not already enabled)
  3. Go to App passwords
  4. Select "Mail" and "Windows Computer"
  5. Copy the generated 16-character password
  6. Add to `.env.local` as `EMAIL_PASSWORD`
  7. Add your Gmail address as `EMAIL_USER`

- [ ] **1d. Set `NEXT_PUBLIC_BASE_URL`**
  - For development: `http://localhost:3000`
  - For production: Your actual domain

**Your `.env.local` should look like:**
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Phase 2: Database Setup (10 minutes)

- [ ] **2a. Open Supabase SQL Editor**
  - Go to your Supabase project
  - Click "SQL Editor"
  - Click "New Query"

- [ ] **2b. Run Database Migration**
  - Open `docs/database_migration.sql`
  - Copy and paste ALL the SQL into the editor
  - Click "Run"
  - Wait for success message

- [ ] **2c. Verify Database Changes**
  Run these verification queries:
  
  **Check new columns on users table:**
  ```sql
  SELECT column_name FROM information_schema.columns 
  WHERE table_name = 'users' 
  ORDER BY ordinal_position;
  ```
  Should see: `email`, `email_notifications_enabled`, `is_email_verified`

  **Check new tables:**
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('notification_logs', 'notification_preferences');
  ```
  Should return 2 tables

  **Check RLS is enabled:**
  ```sql
  SELECT tablename, rowsecurity FROM pg_tables 
  WHERE tablename IN ('users', 'notification_logs', 'notification_preferences');
  ```
  All should show `t` (true)

## Phase 3: Application Testing (15 minutes)

- [ ] **3a. Start Development Server**
  ```bash
  npm run dev
  ```
  Should start at `http://localhost:3000`

- [ ] **3b. Test Registration Flow**
  1. Go to `http://localhost:3000/register`
  2. Enter test email: `test@gmail.com` (use your real email)
  3. Enter username: `testuser123`
  4. Click "Send Verification Code"
  5. Check your email inbox for OTP
  6. Enter the 6-digit code
  7. Enter password (8+ characters)
  8. Click "Verify & Create Account"
  9. Should redirect to login with success message
  10. Check email for welcome message

- [ ] **3c. Verify Data in Database**
  In Supabase, check users table:
  ```sql
  SELECT id, username, email, email_notifications_enabled, is_email_verified 
  FROM public.users 
  WHERE email = 'test@gmail.com';
  ```
  Should show:
  - `email_notifications_enabled: true`
  - `is_email_verified: true`

## Phase 4: Admin Notifications Testing (10 minutes)

- [ ] **4a. Make a User Admin** (Optional - for testing)
  ```sql
  UPDATE public.users 
  SET role = 'admin' 
  WHERE id = 'YOUR_USER_ID';
  ```

- [ ] **4b. Test Admin Notification Panel**
  1. Login to your account (ensure it's admin)
  2. Go to `http://localhost:3000/admin/notifications`
  3. Fill in form:
     - Title: "Test Announcement"
     - Description: "This is a test announcement email"
     - Category: "general"
  4. Click "Send to All Users"
  5. Check success message
  6. Check your email for notification

- [ ] **4c. Verify Notification Log**
  In Supabase:
  ```sql
  SELECT * FROM public.notification_logs 
  ORDER BY created_at DESC 
  LIMIT 1;
  ```
  Should show your test notification

## Phase 5: Security Verification (5 minutes)

- [ ] **5a. Test OTP Expiry**
  1. Request new OTP
  2. Wait 11 minutes (OTP expires after 10)
  3. Try to verify expired OTP
  4. Should get "OTP has expired" message

- [ ] **5b. Test Attempt Limits**
  1. Request new OTP
  2. Enter wrong code 3 times
  3. On 3rd attempt, should get "Too many attempts" message
  4. Must request new OTP

- [ ] **5c. Test Email Validation**
  1. Try registering with invalid email (e.g., "notanemail")
  2. Should get "Please enter a valid email address" error

- [ ] **5d. Test Duplicate Prevention**
  1. Try registering with same username again
  2. Should get "Username already taken" error
  3. Try with same email (after OTP sent)
  4. Should get "Email already registered" error

## Phase 6: User Notification Preferences (5 minutes)

- [ ] **6a. Add Notification Settings to Dashboard** (Later Implementation)
  - User should be able to toggle `email_notifications_enabled`
  - This controls whether they receive notification emails

- [ ] **6b. Test Disabled Notifications**
  1. Disable notifications for your test account
  2. Send another admin notification
  3. You should NOT receive the email

## Common Issues & Fixes

### ❌ "Failed to send verification email"
- [ ] Check `EMAIL_USER` and `EMAIL_PASSWORD` in `.env.local`
- [ ] Verify Gmail App Password is correct (not regular password)
- [ ] Check if 2FA is enabled for Gmail account
- [ ] Verify email hasn't hit Google's sending limits

### ❌ "Internal Server Error" on registration
- [ ] Check if database migration was fully applied
- [ ] Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Check if tables exist: `notification_logs`, `notification_preferences`
- [ ] Check Supabase logs for errors

### ❌ "Unauthorized" on admin notifications
- [ ] Verify user has `role: 'admin'`
- [ ] Check that admin Bearer token is being passed
- [ ] Verify user ID is correct

### ❌ "OTP not received"
- [ ] Check spam/junk folder
- [ ] Verify email address is correct
- [ ] Check server logs for email sending errors
- [ ] Try with a different email provider

## 📋 After Everything Works

- [ ] Update admin user accounts to have `role = 'admin'`
- [ ] Customize email templates if needed
- [ ] Add notification preferences UI to user dashboard
- [ ] Set production environment variables
- [ ] Test with real users
- [ ] Monitor notification_logs for any failures
- [ ] Consider implementing Redis for scaling OTP storage

## ✅ Final Verification

Run these in Supabase SQL Terminal to confirm everything:

```sql
-- Check all pieces are in place
SELECT 
  'users table' as component,
  COUNT(*) as count,
  'Check: email column exists' as check
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'email'

UNION ALL

SELECT 
  'notification_logs table',
  COUNT(*),
  'Check: table exists'
FROM information_schema.tables 
WHERE table_name = 'notification_logs'

UNION ALL

SELECT 
  'Users with notifications enabled',
  COUNT(DISTINCT user_id),
  'Potential recipients'
FROM public.users 
WHERE email_notifications_enabled = true;
```

---

## 🎉 You're Done!

Once all checkmarks are complete, your system is fully functional. You now have:
✅ Secure email verification during registration
✅ Professional OTP system
✅ Email notification service
✅ Admin notification control panel
✅ User notification preferences
✅ Complete audit trail

**Questions?** Check the detailed guides in the `docs/` folder.

---

**Last Updated:** February 21, 2026  
**Status:** Ready for Deployment
