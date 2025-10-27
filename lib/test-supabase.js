import { getSupabaseAdmin } from './supabase.js';
export async function testSupabaseConnection() {
  try {
    console.log('🧪 Testing Supabase connection...');
    const supabase = getSupabaseAdmin();
    const {
      data: testData,
      error: testError
    } = await supabase.from('summoners').select('*').limit(1);
    if (testError) {
      console.error('❌ Database connection failed:', testError);
      return false;
    }
    console.log('✅ Database connection successful');
    console.log('📊 Sample data:', testData);
    const {
      data: tablesData,
      error: tablesError
    } = await supabase.rpc('get_table_names');
    if (tablesError) {
      console.log('ℹ️ Could not list tables (this is normal):', tablesError.message);
    } else {
      console.log('📋 Tables found:', tablesData);
    }
    return true;
  } catch (error) {
    console.error('💥 Supabase test failed:', error);
    return false;
  }
}
export async function testMatchCaching() {
  try {
    console.log('🧪 Testing match caching...');
    const supabase = getSupabaseAdmin();
    const testMatch = {
      match_id: 'TEST_' + Date.now(),
      region: 'euw1',
      game_creation: new Date(),
      game_duration: 1800,
      game_mode: 'CLASSIC',
      game_type: 'MATCHED_GAME',
      queue_id: 420,
      match_data: {
        test: true,
        info: {
          participants: []
        }
      },
      timeline_data: null,
      last_fetched_at: new Date()
    };
    const {
      data: insertData,
      error: insertError
    } = await supabase.from('matches').insert(testMatch).select().single();
    if (insertError) {
      console.error('❌ Failed to insert test match:', insertError);
      return false;
    }
    console.log('✅ Test match inserted:', insertData.match_id);
    const {
      data: retrieveData,
      error: retrieveError
    } = await supabase.from('matches').select('*').eq('match_id', testMatch.match_id).single();
    if (retrieveError) {
      console.error('❌ Failed to retrieve test match:', retrieveError);
      return false;
    }
    console.log('✅ Test match retrieved successfully');
    await supabase.from('matches').delete().eq('match_id', testMatch.match_id);
    console.log('🧹 Test match cleaned up');
    return true;
  } catch (error) {
    console.error('💥 Match caching test failed:', error);
    return false;
  }
}