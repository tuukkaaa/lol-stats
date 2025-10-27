import { getRiotAuthUrl } from '@/lib/riot-oauth';
import { supabase } from '@/lib/supabase';
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const {
      data: {
        session
      },
      error: sessionError
    } = await supabase.auth.getSession();
    if (!session || sessionError) {
      console.error('No session found:', sessionError);
      return Response.json({
        error: 'User not authenticated. Please log in first.'
      }, {
        status: 401
      });
    }
    const state = Buffer.from(JSON.stringify({
      userId: session.user.id,
      timestamp: Date.now()
    })).toString('base64');
    const authUrl = getRiotAuthUrl(state);
    return Response.redirect(authUrl);
  } catch (error) {
    console.error('Riot OAuth initiation error:', error);
    return Response.json({
      error: error.message || 'Failed to initiate Riot OAuth'
    }, {
      status: 500
    });
  }
}