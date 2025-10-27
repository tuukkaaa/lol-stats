import { testSupabaseConnection, testMatchCaching } from '@/lib/test-supabase';
export async function GET(request) {
  try {
    console.log('🔧 Running Supabase diagnostics...');
    const results = {
      connection: false,
      caching: false,
      errors: []
    };
    try {
      results.connection = await testSupabaseConnection();
    } catch (error) {
      results.errors.push(`Connection test failed: ${error.message}`);
    }
    if (results.connection) {
      try {
        results.caching = await testMatchCaching();
      } catch (error) {
        results.errors.push(`Caching test failed: ${error.message}`);
      }
    }
    const status = results.connection && results.caching ? 200 : 500;
    return Response.json({
      success: results.connection && results.caching,
      results,
      message: results.connection && results.caching ? '✅ Supabase is working correctly!' : '❌ Supabase has issues that need fixing',
      timestamp: new Date().toISOString()
    }, {
      status
    });
  } catch (error) {
    console.error('💥 Diagnostic endpoint failed:', error);
    return Response.json({
      success: false,
      error: error.message,
      message: '❌ Failed to run diagnostics'
    }, {
      status: 500
    });
  }
}