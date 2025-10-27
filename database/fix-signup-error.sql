-- =====================================================
-- FIX: Remove problematic trigger that blocks user creation
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop the trigger that might be causing issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function as well
DROP FUNCTION IF EXISTS create_default_user_preferences();

-- That's it! User preferences will now be created automatically
-- when the user first accesses their profile page.
-- This is handled in the lib/auth.js getUserPreferences() function.
