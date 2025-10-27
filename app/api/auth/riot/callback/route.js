import { exchangeCodeForToken, getRiotUserInfo } from '@/lib/riot-oauth';
import { getUser, linkRiotAccount } from '@/lib/auth';
import { getRiotApi } from '@/lib/riot';
export async function GET(request) {
  try {
    const {
      searchParams
    } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    if (error) {
      return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?error=oauth_${error}`);
    }
    if (!code) {
      return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?error=missing_code`);
    }
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        const age = Date.now() - stateData.timestamp;
        if (age > 10 * 60 * 1000) {
          throw new Error('State expired');
        }
      } catch (err) {
        console.error('State verification failed:', err);
        return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?error=invalid_state`);
      }
    }
    const {
      user
    } = await getUser();
    if (!user) {
      return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/login?error=not_authenticated`);
    }
    const tokenData = await exchangeCodeForToken(code);
    const riotUser = await getRiotUserInfo(tokenData.access_token);
    const riotApi = getRiotApi();
    const regions = ['euw1', 'na1', 'eun1', 'kr', 'br1', 'jp1'];
    let summonerData = null;
    let region = null;
    for (const testRegion of regions) {
      try {
        summonerData = await riotApi.getSummonerByPuuid(riotUser.puuid, testRegion);
        region = testRegion;
        break;
      } catch (err) {
        continue;
      }
    }
    if (!summonerData) {
      return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?error=summoner_not_found`);
    }
    const {
      data: existingAccounts
    } = await import('@/lib/auth').then(m => m.getUserRiotAccounts());
    const isPrimary = !existingAccounts || existingAccounts.length === 0;
    const {
      error: linkError
    } = await linkRiotAccount({
      puuid: riotUser.puuid,
      gameName: riotUser.gameName,
      tagLine: riotUser.tagLine,
      region: region,
      summonerId: summonerData.id,
      accountId: summonerData.accountId,
      summonerLevel: summonerData.summonerLevel,
      profileIconId: summonerData.profileIconId,
      isPrimary: isPrimary
    });
    if (linkError) {
      console.error('Failed to link Riot account:', linkError);
      return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?error=link_failed`);
    }
    return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?success=riot_linked`);
  } catch (error) {
    console.error('Riot OAuth callback error:', error);
    return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?error=oauth_failed`);
  }
}