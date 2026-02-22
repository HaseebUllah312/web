-- VU Academic Hub - Email Notification System Migration
-- Run this script in your Supabase SQL Editor
-- Date: February 21, 2026

-- ===== STEP 1: Add columns to users table =====
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email') THEN
    ALTER TABLE public.users ADD COLUMN email VARCHAR(255) UNIQUE;
  END IF;
END $$;

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email_notifications_enabled') THEN
    ALTER TABLE public.users ADD COLUMN email_notifications_enabled BOOLEAN DEFAULT true;
  END IF;
END $$;

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_email_verified') THEN
    ALTER TABLE public.users ADD COLUMN is_email_verified BOOLEAN DEFAULT false;
  END IF;
END $$;

-- ===== STEP 2: Create notification_logs table =====
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50),
  sent_by UUID,
  successful_sends INTEGER DEFAULT 0,
  failed_sends INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_sent_by FOREIGN KEY (sent_by) REFERENCES public.users(id) ON DELETE SET NULL
);

-- Create index on created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON public.notification_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_by ON public.notification_logs(sent_by);

-- ===== STEP 3: Create notification_preferences table (Optional - for detailed settings) =====
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email_announcements BOOLEAN DEFAULT true,
  email_results BOOLEAN DEFAULT true,
  email_deadlines BOOLEAN DEFAULT true,
  email_login_alerts BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_preference UNIQUE(user_id)
);

-- ===== STEP 4: Enable Row Level Security =====
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own preferences
CREATE POLICY "Users can view own notification preferences"
  ON public.notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to update their own preferences
CREATE POLICY "Users can update own notification preferences"
  ON public.notification_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to insert their own preferences
CREATE POLICY "Users can insert own notification preferences"
  ON public.notification_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow admins to view all notification logs
CREATE POLICY "Admins can view notification logs"
  ON public.notification_logs
  FOR SELECT
  USING (
    -- Assuming your auth system uses a custom claim or you check via users table
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to insert notification logs
CREATE POLICY "Admins can insert notification logs"
  ON public.notification_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===== STEP 5: Update RLS on users table =====
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (email, preferences)
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u2
      WHERE u2.id = auth.uid() AND u2.role = 'admin'
    )
  );

-- ===== STEP 6: Create useful views =====

-- View for getting notification statistics
CREATE OR REPLACE VIEW public.notification_stats AS
SELECT 
  DATE(created_at) as notification_date,
  COUNT(*) as total_notifications_sent,
  SUM(successful_sends) as total_successful,
  SUM(failed_sends) as total_failed,
  SUM(total_users) as total_users_targeted,
  ROUND(100.0 * SUM(successful_sends) / NULLIF(SUM(total_users), 0), 2) as success_rate
FROM public.notification_logs
GROUP BY DATE(created_at)
ORDER BY notification_date DESC;

-- View for getting user notification stats
CREATE OR REPLACE VIEW public.user_notification_stats AS
SELECT 
  COUNT(DISTINCT user_id) as users_with_notifications_enabled,
  COUNT(DISTINCT CASE WHEN email_notifications_enabled = false THEN user_id END) as users_with_notifications_disabled
FROM public.users
WHERE provider = 'local';

-- ===== VERIFICATION QUERIES =====
-- Run these to verify the setup was successful:

-- Check if columns were added
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'users' AND column_name IN ('email', 'email_notifications_enabled', 'is_email_verified');

-- Check if tables were created
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_name IN ('notification_logs', 'notification_preferences');

-- Check RLS is enabled
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables 
-- WHERE tablename IN ('users', 'notification_logs', 'notification_preferences');
