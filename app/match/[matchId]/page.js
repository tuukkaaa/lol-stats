import { notFound } from 'next/navigation';
import MatchDetailPage from '@/components/MatchDetailPage';
async function getMatchData(matchId) {
  try {
    const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://your-domain.com';
    const response = await fetch(`${baseUrl}/api/match-detail/${matchId}`, {
      next: {
        revalidate: 3600
      }
    });
    if (!response.ok) {
      throw new Error('Match not found');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching match:', error);
    return null;
  }
}
export async function generateMetadata({
  params
}) {
  const matchData = await getMatchData(params.matchId);
  if (!matchData) {
    return {
      title: 'Match Not Found | LoL Stats Tracker',
      description: 'The requested match could not be found.'
    };
  }
  const {
    match,
    participants
  } = matchData;
  const gameMode = match.info.gameMode;
  const gameDuration = Math.floor(match.info.gameDuration / 60);
  const gameSeconds = Math.floor(match.info.gameDuration % 60);
  const team1 = participants.filter(p => p.teamId === 100);
  const team2 = participants.filter(p => p.teamId === 200);
  const team1Win = team1[0]?.win;
  const description = `${gameMode} Match • ${gameDuration}m ${gameSeconds}s • ${team1.length + team2.length} players`;
  const resultColor = '#f59e0b';
  return {
    title: `League of Legends ${gameMode} Match | LoL Stats Tracker`,
    description: description,
    openGraph: {
      title: `🏆 League of Legends ${gameMode} Match`,
      description: `⚔️ ${description}

🔵 Blue Team: ${team1Win ? '🏆 Victory' : '💀 Defeat'}
🔴 Red Team: ${!team1Win ? '🏆 Victory' : '💀 Defeat'}

🎮 Match Duration: ${gameDuration}m ${gameSeconds}s
👥 ${team1.length + team2.length} Players

📊 View detailed stats and analysis!`,
      type: 'article',
      siteName: 'LoL Stats Tracker',
      url: `${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://your-domain.com'}/match/${params.matchId}`,
      images: [{
        url: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${participants[0]?.championName || 'Azir'}_0.jpg`,
        width: 1215,
        height: 717,
        alt: `League of Legends Match featuring ${participants[0]?.championName || 'Champions'}`
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: `🏆 League of Legends ${gameMode} Match`,
      description: `⚔️ ${description} - Blue Team: ${team1Win ? 'Victory' : 'Defeat'}, Red Team: ${!team1Win ? 'Victory' : 'Defeat'}`,
      images: [`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${participants[0]?.championName || 'Azir'}_0.jpg`]
    },
    other: {
      'theme-color': team1Win ? '#10b981' : '#ef4444',
      'og:locale': 'en_US',
      'og:site_name': 'LoL Stats Tracker'
    }
  };
}
export default async function MatchPage({
  params
}) {
  const matchData = await getMatchData(params.matchId);
  if (!matchData) {
    notFound();
  }
  return <MatchDetailPage matchData={matchData} />;
}