import { supabase, getSupabaseAdmin } from './supabase';
export async function signUp(email, password) {
  try {
    const {
      data,
      error
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) throw error;
    return {
      data,
      error: null
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      data: null,
      error
    };
  }
}
export async function signIn(email, password) {
  try {
    const {
      data,
      error
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    if (data.user) {
      await logUserActivity(data.user.id, 'login', 'User logged in');
    }
    return {
      data,
      error: null
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      data: null,
      error
    };
  }
}
export async function signOut() {
  try {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    const {
      error
    } = await supabase.auth.signOut();
    if (error) throw error;
    if (user) {
      await logUserActivity(user.id, 'logout', 'User logged out');
    }
    return {
      error: null
    };
  } catch (error) {
    console.error('Sign out error:', error);
    return {
      error
    };
  }
}
export async function getSession() {
  try {
    const {
      data: {
        session
      },
      error
    } = await supabase.auth.getSession();
    if (error) throw error;
    return {
      session,
      error: null
    };
  } catch (error) {
    console.error('Get session error:', error);
    return {
      session: null,
      error
    };
  }
}
export async function getUser() {
  try {
    const {
      data: {
        user
      },
      error
    } = await supabase.auth.getUser();
    if (error) {
      if (error.message?.includes('Auth session missing')) {
        return {
          user: null,
          error: null
        };
      }
      throw error;
    }
    return {
      user,
      error: null
    };
  } catch (error) {
    console.error('Get user error:', error);
    return {
      user: null,
      error
    };
  }
}
export async function resetPassword(email) {
  try {
    const {
      data,
      error
    } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });
    if (error) throw error;
    return {
      data,
      error: null
    };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      data: null,
      error
    };
  }
}
export async function updatePassword(newPassword) {
  try {
    const {
      data,
      error
    } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    return {
      data,
      error: null
    };
  } catch (error) {
    console.error('Update password error:', error);
    return {
      data: null,
      error
    };
  }
}
export async function linkRiotAccount(accountData) {
  try {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const {
      data,
      error
    } = await supabase.from('user_riot_accounts').insert({
      user_id: user.id,
      puuid: accountData.puuid,
      game_name: accountData.gameName,
      tag_line: accountData.tagLine,
      region: accountData.region,
      summoner_id: accountData.summonerId,
      account_id: accountData.accountId,
      summoner_level: accountData.summonerLevel,
      profile_icon_id: accountData.profileIconId,
      is_primary: accountData.isPrimary || false,
      last_synced_at: new Date().toISOString()
    }).select().single();
    if (error) {
      if (error.code === '23505') {
        throw new Error('This Riot account is already linked to another user');
      }
      throw error;
    }
    await logUserActivity(user.id, 'account_linked', `Linked Riot account: ${accountData.gameName}#${accountData.tagLine}`);
    return {
      data,
      error: null
    };
  } catch (error) {
    console.error('Link Riot account error:', error);
    return {
      data: null,
      error
    };
  }
}
export async function getUserRiotAccounts() {
  try {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const {
      data,
      error
    } = await supabase.from('user_riot_accounts').select('*').eq('user_id', user.id).order('is_primary', {
      ascending: false
    }).order('created_at', {
      ascending: false
    });
    if (error) throw error;
    return {
      data,
      error: null
    };
  } catch (error) {
    console.error('Get user Riot accounts error:', error);
    return {
      data: null,
      error
    };
  }
}
export async function setPrimaryRiotAccount(accountId) {
  try {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    await supabase.from('user_riot_accounts').update({
      is_primary: false
    }).eq('user_id', user.id);
    const {
      data,
      error
    } = await supabase.from('user_riot_accounts').update({
      is_primary: true
    }).eq('id', accountId).eq('user_id', user.id).select().single();
    if (error) throw error;
    return {
      data,
      error: null
    };
  } catch (error) {
    console.error('Set primary Riot account error:', error);
    return {
      data: null,
      error
    };
  }
}
export async function removeRiotAccount(accountId) {
  try {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const {
      error
    } = await supabase.from('user_riot_accounts').delete().eq('id', accountId).eq('user_id', user.id);
    if (error) throw error;
    await logUserActivity(user.id, 'account_removed', 'Removed Riot account');
    return {
      error: null
    };
  } catch (error) {
    console.error('Remove Riot account error:', error);
    return {
      error
    };
  }
}
export async function updateRiotAccount(accountId, accountData) {
  try {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const {
      data,
      error
    } = await supabase.from('user_riot_accounts').update({
      summoner_level: accountData.summonerLevel,
      profile_icon_id: accountData.profileIconId,
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq('id', accountId).eq('user_id', user.id).select().single();
    if (error) throw error;
    return {
      data,
      error: null
    };
  } catch (error) {
    console.error('Update Riot account error:', error);
    return {
      data: null,
      error
    };
  }
}
export async function getUserPreferences() {
  try {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    let {
      data,
      error
    } = await supabase.from('user_preferences').select('*').eq('user_id', user.id).single();
    if (error && error.code === 'PGRST116') {
      const {
        data: newPrefs,
        error: createError
      } = await supabase.from('user_preferences').insert({
        user_id: user.id
      }).select().single();
      if (createError) throw createError;
      return {
        data: newPrefs,
        error: null
      };
    }
    if (error) throw error;
    return {
      data,
      error: null
    };
  } catch (error) {
    console.error('Get user preferences error:', error);
    return {
      data: null,
      error
    };
  }
}
export async function updateUserPreferences(preferences) {
  try {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const {
      data,
      error
    } = await supabase.from('user_preferences').update(preferences).eq('user_id', user.id).select().single();
    if (error) throw error;
    return {
      data,
      error: null
    };
  } catch (error) {
    console.error('Update user preferences error:', error);
    return {
      data: null,
      error
    };
  }
}
export async function logUserActivity(userId, activityType, description) {
  try {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
    const {
      error
    } = await supabase.from('user_activity_log').insert({
      user_id: userId,
      activity_type: activityType,
      description,
      user_agent: userAgent
    });
    if (error) throw error;
    return {
      error: null
    };
  } catch (error) {
    console.error('Log user activity error:', error);
    return {
      error
    };
  }
}
export async function getUserActivityLogs(limit = 50) {
  try {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const {
      data,
      error
    } = await supabase.from('user_activity_log').select('*').eq('user_id', user.id).order('created_at', {
      ascending: false
    }).limit(limit);
    if (error) throw error;
    return {
      data,
      error: null
    };
  } catch (error) {
    console.error('Get user activity logs error:', error);
    return {
      data: null,
      error
    };
  }
}
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}