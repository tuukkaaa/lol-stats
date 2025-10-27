const RIOT_OAUTH_URL = 'https://auth.riotgames.com/authorize';
const RIOT_TOKEN_URL = 'https://auth.riotgames.com/token';
const RIOT_USERINFO_URL = 'https://americas.api.riotgames.com/riot/account/v1/accounts/me';
export function getRiotAuthUrl(state = null) {
  const clientId = process.env.RIOT_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/riot/callback`;
  if (!clientId) {
    throw new Error('RIOT_CLIENT_ID not configured');
  }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid'
  });
  if (state) {
    params.append('state', state);
  }
  return `${RIOT_OAUTH_URL}?${params.toString()}`;
}
export async function exchangeCodeForToken(code) {
  const clientId = process.env.RIOT_CLIENT_ID;
  const clientSecret = process.env.RIOT_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/riot/callback`;
  if (!clientId || !clientSecret) {
    throw new Error('Riot OAuth credentials not configured');
  }
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(RIOT_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    })
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for token: ${error}`);
  }
  return response.json();
}
export async function refreshAccessToken(refreshToken) {
  const clientId = process.env.RIOT_CLIENT_ID;
  const clientSecret = process.env.RIOT_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Riot OAuth credentials not configured');
  }
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(RIOT_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }
  return response.json();
}
export async function getRiotUserInfo(accessToken) {
  const response = await fetch(RIOT_USERINFO_URL, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get user info: ${error}`);
  }
  return response.json();
}
export async function verifyToken(accessToken) {
  try {
    await getRiotUserInfo(accessToken);
    return true;
  } catch (error) {
    return false;
  }
}