import SummonerPage from '@/components/SummonerPage';
export default async function SummonerRoute({
  params
}) {
  const {
    region,
    riotId
  } = await params;
  const [gameName, tagLine] = decodeURIComponent(riotId).split('-');
  return <SummonerPage gameName={gameName} tagLine={tagLine} region={region} />;
}
export async function generateMetadata({
  params
}) {
  const {
    region,
    riotId
  } = await params;
  const [gameName, tagLine] = decodeURIComponent(riotId).split('-');
  return {
    title: `${gameName}#${tagLine} - LoL Stats Tracker`,
    description: `View League of Legends stats for ${gameName}#${tagLine} in ${region.toUpperCase()}`
  };
}