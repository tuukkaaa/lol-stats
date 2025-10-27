import { getSupabaseAdmin } from '@/lib/supabase';
export async function GET() {
  try {
    const admin = getSupabaseAdmin();
    const checks = {
      connection: false,
      user_riot_accounts: false,
      user_preferences: false,
      user_activity_log: false,
      timestamp: new Date().toISOString()
    };
    const {
      error: connectionError
    } = await admin.from('user_riot_accounts').select('count').limit(1);
    checks.connection = !connectionError || connectionError.code !== 'PGRST301';
    checks.user_riot_accounts = !connectionError || connectionError.code !== '42P01';
    const {
      error: prefsError
    } = await admin.from('user_preferences').select('count').limit(1);
    checks.user_preferences = !prefsError || prefsError.code !== '42P01';
    const {
      error: logError
    } = await admin.from('user_activity_log').select('count').limit(1);
    checks.user_activity_log = !logError || logError.code !== '42P01';
    const allTablesExist = checks.user_riot_accounts && checks.user_preferences && checks.user_activity_log;
    return Response.json({
      status: allTablesExist ? 'ready' : 'needs_setup',
      message: allTablesExist ? '✅ All authentication tables are set up correctly!' : '⚠️ Some tables are missing. Please run the database schema in Supabase.',
      checks,
      instructions: !allTablesExist ? 'Run database/auth-schema-simple.sql in Supabase SQL Editor' : null
    }, {
      status: allTablesExist ? 200 : 503
    });
  } catch (error) {
    return Response.json({
      status: 'error',
      message: '❌ Error checking database status',
      error: error.message,
      instructions: 'Make sure Supabase environment variables are set correctly'
    }, {
      status: 500
    });
  }
}