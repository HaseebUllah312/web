# 🏗️ System Architecture & Data Flow

## Registration Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    REGISTRATION PROCESS                          │
└─────────────────────────────────────────────────────────────────┘

STEP 1: Email & Username Entry
┌──────────────────────────┐
│   User Registration Page  │
│  ┌────────────────────┐  │
│  │ Email: user@mail.c │  │
│  │ Username: johndoe  │  │
│  │ [Send OTP Button]  │  │
│  └────────────────────┘  │
└────────┬─────────────────┘
         │
         ↓ POST /api/auth/send-otp
┌─────────────────────────────────────────┐
│   Backend: Validate & Send OTP          │
│   - Check email format ✓                │
│   - Check username exists? ✗            │
│   - Check email registered? ✗           │
│   - Generate OTP (6 digits)             │
│   - Store OTP temporarily (10 min)      │
│   - Send email                          │
└────────────┬────────────────────────────┘
             │
             ↓ Email Service (Nodemailer)
┌──────────────────────────────────────────┐
│   Gmail Server                            │
│   Sends: OTP Email to user@mail.com      │
│   Subject: "VU Academic Hub - Verify"    │
│   Content: Your code is 123456           │
└──────────────────────────────────────────┘


STEP 2: OTP Verification
┌──────────────────────────┐
│   User Verification Page  │
│  ┌────────────────────┐  │
│  │ Enter 6-digit code │  │
│  │ [Input: 123456]    │  │
│  │ [Verify Button]    │  │
│  └────────────────────┘  │
└────────┬─────────────────┘
         │
         ↓ Verify correct OTP
         │ ✓ Code matches
         │ ✓ Not expired
         │ ✓ Attempts < 3


STEP 3: Password Creation
┌──────────────────────────┐
│   Password Setup Page      │
│  ┌────────────────────┐  │
│  │ Password: ••••••   │  │
│  │ Confirm: ••••••    │  │
│  │ [Create Account]   │  │
│  └────────────────────┘  │
└────────┬─────────────────┘
         │
         ↓ POST /api/auth/verify-otp
┌──────────────────────────────────────────────┐
│   Backend: Complete Registration             │
│   - Hash password                            │
│   - Create user in database                  │
│   - Set email_notifications_enabled = true   │
│   - Set is_email_verified = true             │
│   - Clear OTP                                │
│   - Send welcome email                       │
└────────┬─────────────────────────────────────┘
         │
         ↓ Success Redirect
┌──────────────────────────┐
│   Login Page               │
│   "Account created!"       │
│   User can now login       │
└──────────────────────────┘
```

## Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE TABLES                          │
└─────────────────────────────────────────────────────────────┘

PUBLIC.USERS (Extended)
═════════════════════════════════════════════════════════════
id                    UUID PRIMARY KEY
username              VARCHAR(255) UNIQUE
email                 VARCHAR(255) UNIQUE ← NEW
password_hash         VARCHAR(255)
salt                  VARCHAR(255)
role                  VARCHAR(50) [student|admin]
provider              VARCHAR(50) [local|google]
email_notifications_enabled BOOLEAN ← NEW (default: true)
is_email_verified     BOOLEAN ← NEW (default: false)
created_at            TIMESTAMP
updated_at            TIMESTAMP


PUBLIC.NOTIFICATION_LOGS (New Table)
═════════════════════════════════════════════════════════════
id                    UUID PRIMARY KEY
title                 VARCHAR(255)
description           TEXT
category              VARCHAR(50)
sent_by               UUID → users.id (admin who sent it)
successful_sends      INTEGER
failed_sends          INTEGER
total_users           INTEGER
created_at            TIMESTAMP
Index on: created_at, sent_by


PUBLIC.NOTIFICATION_PREFERENCES (New Table - Optional)
═════════════════════════════════════════════════════════════
id                    UUID PRIMARY KEY
user_id               UUID → users.id
email_announcements   BOOLEAN (default: true)
email_results         BOOLEAN (default: true)
email_deadlines       BOOLEAN (default: true)
email_login_alerts    BOOLEAN (default: false)
updated_at            TIMESTAMP
```

## API Endpoints Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    API ROUTES                               │
└─────────────────────────────────────────────────────────────┘

AUTHENTICATION ROUTES
══════════════════════════════════════════════════════════════
POST /api/auth/send-otp
  Input:  { email, username }
  Output: { success, message, email }
  Action: Send 6-digit OTP to email

POST /api/auth/verify-otp
  Input:  { email, username, password, otp }
  Output: { success, message, userId }
  Action: Verify OTP and create account
  Note:   Saves welcome email before redirect


NOTIFICATION ROUTES (Admin Only)
══════════════════════════════════════════════════════════════
POST /api/notifications/send
  Auth:   Bearer {adminId}
  Input:  { title, description, category, targetAudience }
  Output: { success, sentCount, failureCount, totalUsers }
  Action: Send announcement to all users
  RLS:    Only admins can execute


NOTIFICATION SETTINGS ROUTES
══════════════════════════════════════════════════════════════
GET /api/notifications/settings
  Auth:   Bearer {userId}
  Output: { email, notificationsEnabled }
  Action: Get user notification preferences

PUT /api/notifications/settings
  Auth:   Bearer {userId}
  Input:  { emailNotificationsEnabled }
  Output: { success, message }
  Action: Update notification preferences
```

## Email Flow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                    EMAIL SENDING FLOW                          │
└────────────────────────────────────────────────────────────────┘

TYPE 1: OTP VERIFICATION EMAIL
┌──────────────────────┐
│ Frontend: New User   │
│  Clicks Send OTP     │
└──────┬───────────────┘
       │
       ↓ /api/auth/send-otp
┌──────────────────────────────┐
│ Backend:                      │
│ ├─ Validate email             │
│ ├─ Generate OTP               │
│ ├─ Store OTP (temp memory)    │
│ └─ Call sendEmail()           │
└──────┬───────────────────────┘
       │
       ↓ Nodemailer Transport
┌──────────────────────────────────────┐
│ Gmail SMTP Server                     │
│ user@gmail.com → OTP Email            │
│ Template: getOTPEmailTemplate()       │
│ Subject: VU Academic Hub Verification │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────┐
│ User Inbox                │
│ ✉️ VU Academic Hub        │
│ Subject: OTP Verification │
│ Body: Code is 123456      │
└──────────────────────────┘


TYPE 2: WELCOME EMAIL
┌──────────────────────┐
│ Backend: After OTP   │
│  Verification        │
│  ├─ Create user      │
│  ├─ Hash password    │
│  └─ Send welcome     │
└──────┬───────────────┘
       │
       ↓ sendEmail()
┌──────────────────────────┐
│ Gmail SMTP Server         │
│ Send welcome template     │
└──────┬───────────────────┘
       │
       ↓
┌───────────────────────────────┐
│ User Inbox                     │
│ ✉️ Welcome to VU Academic Hub  │
│ Subject: Account Created!      │
│ Body: Welcome & features       │
└───────────────────────────────┘


TYPE 3: ANNOUNCEMENT NOTIFICATION
┌──────────────────────────────────┐
│ Admin: Sends Announcement         │
│ ├─ Title: "Results Announced"     │
│ ├─ Description: "Final results"   │
│ └─ Category: "result"             │
└──────┬──────────────────────────┘
       │
       ↓ /api/notifications/send
┌────────────────────────────────────────────┐
│ Backend:                                    │
│ ├─ Verify admin role                       │
│ ├─ Get all users with email_notifications │
│ ├─ For each user:                         │
│ │  ├─ Generate announcement email         │
│ │  ├─ Call sendEmail()                    │
│ │  └─ Track success/failure               │
│ └─ Log to notification_logs                │
└────┬───────────────────────────────────────┘
     │
     ↓ Bulk Email Send (Nodemailer)
┌───────────────────────────────────┐
│ Gmail SMTP (Multiple sends)        │
│ For each recipient:                │
│ send(to, subject, template)        │
└───┬───────────────────────────────┘
    │
    ↓
┌─────────────────────────────┐
│ User Inboxes                 │
│ ✉️ x100+ Users Receive:      │
│ "New Announcement Available" │
└─────────────────────────────┘
```

## OTP Storage & Validation

```
┌────────────────────────────────────────┐
│       OTP LIFECYCLE                    │
└────────────────────────────────────────┘

CREATION:
user@mail.com → generateOTP()
  └─ Returns: "123456"

STORAGE (In Memory - 10 min window):
otpStorage.set(email, {
  otp: "123456",
  email: "user@mail.com",
  username: "johndoe",
  expiresAt: Date(now + 10min),
  attempts: 0
})

VERIFICATION:
Input: "123456"
  ├─ Check if OTP exists? ✓
  ├─ Check if expired? ✓ (before 10 min)
  ├─ Check attempts < 3? ✓
  ├─ Compare strings? ✓ (attempt 1 of 3)
  □ On mismatch: attempts++
  ✓ On match: Success!
  └─ Clear OTP from storage

EXPIRY HANDLING:
After 10 minutes:
  └─ Automatic cleanup on next verify attempt
  └─ User must request new OTP
```

## Security Architecture

```
┌──────────────────────────────────────────┐
│     SECURITY LAYERS                      │
└──────────────────────────────────────────┘

LAYER 1: Input Validation
├─ Email format validation (regex)
├─ Username length checks
├─ Password length minimum (8 chars)
└─ OTP format (6 digits)

LAYER 2: Rate Limiting
├─ OTP attempts: max 3 before refresh
├─ Email validation before processing
├─ Duplicate prevention (username, email)
└─ Expiry enforcement (10-minute window)

LAYER 3: Authentication
├─ Password hashing (bcrypt)
├─ Salt generation (random)
├─ Bearer token validation
└─ Admin role verification

LAYER 4: Database Security
├─ Row Level Security (RLS) enabled
├─ User data isolation
├─ Admin-only notification access
└─ Email notification preferences


AUTH FLOW VISUALIZATION:
┌─────────────────────┐
│  No Authentication  │
│  ├─ /register       │
│  ├─ /login          │
│  └─ /api/auth/*     │
└─────────────────────┘
           ↓
┌─────────────────────┐
│  User Authenticated │
│  ├─ /dashboard      │
│  ├─ /profile        │
│  └─ GET /api/*      │
└─────────────────────┘
           ↓
┌──────────────────────┐
│  Admin Authenticated │
│  ├─ /admin/*         │
│  └─ POST /api/*      │
│     (admin routes)   │
└──────────────────────┘
```

## Component Dependencies

```
Registration Page
    ↓
├─→ /api/auth/send-otp
│        ↓
│   ├─→ email.ts (sendEmail)
│   ├─→ otp-storage.ts (storeOTP)
│   └─→ supabase (checkUser)
│
└─→ /api/auth/verify-otp
         ↓
     ├─→ otp-storage.ts (verifyOTP)
     ├─→ password.ts (hashPassword)
     ├─→ email.ts (sendEmail)
     └─→ supabase (createUser)


Admin Notifications Page
    ↓
└─→ /api/notifications/send
         ↓
     ├─→ email.ts (sendEmail, templates)
     ├─→ supabase (getUsers, logNotif)
     └─→ Auth (verifyAdmin)
```

---

**Last Updated:** February 21, 2026  
**System Version:** 1.0 Production Ready
