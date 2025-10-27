'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatGameDuration, formatKDA, getQueueType, getRuneImageUrl, findRuneById } from '@/lib/riot';
import { ChevronDown, ChevronUp, Copy, Trophy, Camera, TrendingUp, Shield, BarChart3 } from 'lucide-react';
import DataStatus from './DataStatus';
const CompactMatchCard = ({
  match,
  championData,
  itemData,
  summonerSpellData,
  runeData,
  latestVersion,
  currentRegion
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [screenshotCopied, setScreenshotCopied] = useState(false);
  const goldGraphCanvasRef = useRef(null);
  const router = useRouter();
  const {
    participant
  } = match;
  const isWin = participant.win;
  const kda = formatKDA(participant.kills, participant.deaths, participant.assists);
  const duration = formatGameDuration(match.gameDuration);
  const queueType = getQueueType(match.queueId);
  const champion = championData ? Object.values(championData).find(champ => champ.key === participant.championId.toString()) : null;
  const getImageUrl = (type, id, fallback = '') => {
    if (!latestVersion) return fallback;
    switch (type) {
      case 'champion':
        return `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${id}`;
      case 'item':
        return `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/item/${id}.png`;
      case 'spell':
        return `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/spell/${id}`;
      default:
        return fallback;
    }
  };
  const handlePlayerClick = async (playerData, event) => {
    event.stopPropagation();
    const region = currentRegion || match.platformId?.toLowerCase() || 'euw1';
    console.log('🔍 Player click data:', {
      playerData,
      region,
      riotId: playerData.riotId,
      summonerName: playerData.summonerName,
      puuid: playerData.puuid?.slice(-8)
    });
    if (playerData.riotId && playerData.riotId.includes('#') && !playerData.riotId.includes('null')) {
      const [gameName, tagLine] = playerData.riotId.split('#');
      if (gameName && tagLine && tagLine !== 'null' && tagLine !== 'undefined') {
        console.log('✅ Using Riot ID:', {
          gameName,
          tagLine
        });
        router.push(`/summoner/${region}/${encodeURIComponent(gameName)}-${encodeURIComponent(tagLine)}`);
        return;
      }
    }
    if (playerData.puuid) {
      try {
        console.log('🔄 Resolving PUUID to Riot ID...');
        const response = await fetch(`/api/resolve-puuid?puuid=${playerData.puuid}&region=${region}`);
        if (response.ok) {
          const resolved = await response.json();
          console.log('✅ PUUID resolved:', resolved);
          router.push(`/summoner/${region}/${encodeURIComponent(resolved.gameName)}-${encodeURIComponent(resolved.tagLine)}`);
          return;
        } else {
          console.warn('⚠️ Failed to resolve PUUID:', response.status);
        }
      } catch (error) {
        console.warn('⚠️ Error resolving PUUID:', error);
      }
    }
    if (playerData.summonerName) {
      const regionTagMap = {
        'euw1': 'EUW',
        'eun1': 'EUNE',
        'na1': 'NA1',
        'kr': 'KR',
        'jp1': 'JP1',
        'br1': 'BR1',
        'la1': 'LAN',
        'la2': 'LAS',
        'oc1': 'OCE',
        'tr1': 'TR1',
        'ru': 'RU',
        'ph2': 'PH2',
        'sg2': 'SG2',
        'th2': 'TH2',
        'tw2': 'TW2',
        'vn2': 'VN2'
      };
      const defaultTag = regionTagMap[region.toLowerCase()] || 'EUW';
      console.log(`⚠️ Using fallback: summoner name with region tag: ${defaultTag}`);
      router.push(`/summoner/${region}/${encodeURIComponent(playerData.summonerName)}-${encodeURIComponent(defaultTag)}`);
    } else {
      console.error('❌ No way to identify player - no riotId, puuid, or summonerName');
    }
  };
  const handleScreenshot = async e => {
    e.stopPropagation();
    setScreenshotLoading(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const width = 1400;
      const height = 1000;
      canvas.width = width;
      canvas.height = height;
      const loadImage = src => {
        return new Promise(resolve => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = src;
        });
      };
      const roundedRect = (ctx, x, y, width, height, radius) => {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
      };
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0, '#1c1917');
      bgGradient.addColorStop(0.5, '#161412');
      bgGradient.addColorStop(1, '#0c0a09');
      ctx.fillStyle = bgGradient;
      roundedRect(ctx, 0, 0, width, height, 16);
      ctx.fill();
      const glowGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
      glowGradient.addColorStop(0, 'transparent');
      glowGradient.addColorStop(0.95, 'transparent');
      glowGradient.addColorStop(1, isWin ? 'rgba(16, 185, 129, 0.02)' : 'rgba(239, 68, 68, 0.02)');
      ctx.fillStyle = glowGradient;
      roundedRect(ctx, -5, -5, width + 10, height + 10, 20);
      ctx.fill();
      const borderGradient = ctx.createLinearGradient(0, 0, width, 0);
      borderGradient.addColorStop(0, isWin ? '#10b981' : '#ef4444');
      borderGradient.addColorStop(0.5, '#f59e0b');
      borderGradient.addColorStop(1, isWin ? '#10b981' : '#ef4444');
      ctx.fillStyle = borderGradient;
      ctx.fillRect(0, 0, width, 8);
      const headerHeight = 140;
      const headerGradient = ctx.createLinearGradient(0, 8, 0, headerHeight);
      headerGradient.addColorStop(0, isWin ? 'rgba(16, 185, 129, 0.04)' : 'rgba(239, 68, 68, 0.04)');
      headerGradient.addColorStop(1, 'rgba(28, 25, 23, 0.8)');
      ctx.fillStyle = headerGradient;
      ctx.fillRect(0, 8, width, headerHeight - 8);
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 38px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('LoL Stats Tracker', 40, 55);
      ctx.fillStyle = isWin ? '#10b981' : '#ef4444';
      ctx.font = 'bold 42px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
      const resultText = isWin ? 'VICTORY' : 'DEFEAT';
      const resultWidth = ctx.measureText(resultText).width;
      ctx.fillText(resultText, width - resultWidth - 40, 55);
      ctx.fillStyle = '#d6d3d1';
      ctx.font = 'bold 18px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
      const matchDetails = `${queueType} • ${duration} • ${new Date(match.gameCreation).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })}`;
      const detailsWidth = ctx.measureText(matchDetails).width;
      ctx.fillText(matchDetails, width - detailsWidth - 40, 78);
      const perfCardX = 40;
      const perfCardY = 95;
      const perfCardWidth = width - 80;
      const perfCardHeight = 40;
      const perfGradient = ctx.createLinearGradient(perfCardX, perfCardY, perfCardX + perfCardWidth, perfCardY);
      perfGradient.addColorStop(0, isWin ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)');
      perfGradient.addColorStop(1, 'rgba(68, 64, 60, 0.3)');
      ctx.fillStyle = perfGradient;
      roundedRect(ctx, perfCardX, perfCardY, perfCardWidth, perfCardHeight, 12);
      ctx.fill();
      ctx.strokeStyle = isWin ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#f5f5f4';
      ctx.font = 'bold 20px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(`Your Performance: ${participant.championName} • ${participant.kills}/${participant.deaths}/${participant.assists} • ${kda} KDA`, perfCardX + 18, perfCardY + 26);
      const teamStartY = headerHeight + 20;
      const team1 = match.teams.team1.participants;
      const team2 = match.teams.team2.participants;
      const drawTeam = async (teamPlayers, x, y, teamName, teamWin) => {
        const teamHeaderHeight = 55;
        const teamGradient = ctx.createLinearGradient(x, y, x + 650, y);
        if (teamWin) {
          teamGradient.addColorStop(0, '#065f46');
          teamGradient.addColorStop(0.5, '#047857');
          teamGradient.addColorStop(1, '#059669');
        } else {
          teamGradient.addColorStop(0, '#7f1d1d');
          teamGradient.addColorStop(0.5, '#991b1b');
          teamGradient.addColorStop(1, '#b91c1c');
        }
        ctx.fillStyle = teamGradient;
        roundedRect(ctx, x, y, 650, teamHeaderHeight, 12);
        ctx.fill();
        ctx.strokeStyle = teamWin ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        roundedRect(ctx, x + 2, y + teamHeaderHeight + 2, 646, 4, 8);
        ctx.fill();
        ctx.fillStyle = '#f5f5f4';
        ctx.font = 'bold 24px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(teamName, x + 20, y + 35);
        ctx.fillStyle = teamWin ? '#34d399' : '#f87171';
        ctx.font = 'bold 18px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
        const resultText = teamWin ? 'VICTORY' : 'DEFEAT';
        const resultWidth = ctx.measureText(resultText).width;
        ctx.fillText(resultText, x + 650 - resultWidth - 20, y + 35);
        for (let index = 0; index < teamPlayers.length; index++) {
          const player = teamPlayers[index];
          const playerY = y + teamHeaderHeight + 8 + index * 72;
          const isCurrentPlayer = player.championName === participant.championName && player.kills === participant.kills && player.deaths === participant.deaths;
          const cardGradient = ctx.createLinearGradient(x, playerY, x + 650, playerY);
          if (isCurrentPlayer) {
            cardGradient.addColorStop(0, 'rgba(251, 191, 36, 0.3)');
            cardGradient.addColorStop(0.5, 'rgba(251, 191, 36, 0.2)');
            cardGradient.addColorStop(1, 'rgba(251, 191, 36, 0.1)');
          } else {
            cardGradient.addColorStop(0, 'rgba(68, 64, 60, 0.4)');
            cardGradient.addColorStop(1, 'rgba(41, 37, 36, 0.3)');
          }
          ctx.fillStyle = cardGradient;
          roundedRect(ctx, x + 8, playerY + 2, 634, 61, 8);
          ctx.fill();
          ctx.strokeStyle = isCurrentPlayer ? '#f59e0b' : 'rgba(120, 113, 108, 0.3)';
          ctx.lineWidth = isCurrentPlayer ? 2 : 1;
          roundedRect(ctx, x + 8, playerY + 2, 634, 61, 8);
          ctx.stroke();
          ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
          roundedRect(ctx, x + 10, playerY + 64, 630, 3, 4);
          ctx.fill();
          const iconX = x + 15;
          const iconY = playerY + 8;
          const iconSize = 50;
          ctx.fillStyle = isCurrentPlayer ? '#f59e0b' : '#44403c';
          ctx.beginPath();
          ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2 + 2, 0, 2 * Math.PI);
          ctx.fill();
          try {
            const championImg = await loadImage(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${player.championName}.png`);
            if (championImg) {
              ctx.save();
              ctx.beginPath();
              ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2, 0, 2 * Math.PI);
              ctx.clip();
              ctx.drawImage(championImg, iconX, iconY, iconSize, iconSize);
              ctx.restore();
            } else {
              ctx.fillStyle = '#292524';
              ctx.beginPath();
              ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2, 0, 2 * Math.PI);
              ctx.fill();
              ctx.fillStyle = '#f5f5f4';
              ctx.font = 'bold 12px system-ui';
              ctx.textAlign = 'center';
              ctx.fillText(player.championName.slice(0, 3).toUpperCase(), iconX + iconSize / 2, iconY + iconSize / 2 + 4);
              ctx.textAlign = 'left';
            }
          } catch (e) {
            ctx.fillStyle = '#292524';
            ctx.beginPath();
            ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = '#f5f5f4';
            ctx.font = 'bold 12px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText(player.championName.slice(0, 3).toUpperCase(), iconX + iconSize / 2, iconY + iconSize / 2 + 4);
            ctx.textAlign = 'left';
          }
          const textX = x + 80;
          ctx.fillStyle = isCurrentPlayer ? '#fbbf24' : '#f5f5f4';
          ctx.font = 'bold 15px system-ui';
          const playerName = player.riotId || player.summonerName || 'Unknown';
          const displayName = playerName.length > 12 ? playerName.slice(0, 11) + '...' : playerName;
          ctx.fillText(displayName, textX, playerY + 22);
          ctx.fillStyle = isCurrentPlayer ? '#fed7aa' : '#a8a29e';
          ctx.font = '12px system-ui';
          ctx.fillText(player.championName, textX, playerY + 40);
          const kdaX = textX + 140;
          ctx.fillStyle = isCurrentPlayer ? '#fbbf24' : '#e7e5e4';
          ctx.font = 'bold 15px system-ui';
          const playerKda = player.deaths === 0 ? 'Perfect' : ((player.kills + player.assists) / player.deaths).toFixed(1);
          ctx.fillText(`${player.kills}/${player.deaths}/${player.assists}`, kdaX, playerY + 22);
          ctx.fillStyle = isCurrentPlayer ? '#fed7aa' : '#a8a29e';
          ctx.font = '12px system-ui';
          ctx.fillText(`${playerKda} KDA`, kdaX, playerY + 40);
          const statsX = kdaX + 120;
          ctx.fillStyle = '#d6d3d1';
          ctx.font = '13px system-ui';
          const cs = (player.totalMinionsKilled || 0) + (player.neutralMinionsKilled || 0);
          ctx.fillText(`${cs} CS`, statsX, playerY + 22);
          ctx.fillText(`${(player.goldEarned / 1000).toFixed(1)}k gold`, statsX, playerY + 40);
          const itemsStartX = statsX + 100;
          const items = player.items || [];
          for (let i = 0; i < 6; i++) {
            const itemX = itemsStartX + i * 30;
            const itemY = playerY + 12;
            const itemSize = 26;
            const itemId = items[i];
            if (itemId && itemId > 0) {
              try {
                const itemImg = await loadImage(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/item/${itemId}.png`);
                if (itemImg) {
                  const itemGradient = ctx.createRadialGradient(itemX + itemSize / 2, itemY + itemSize / 2, 0, itemX + itemSize / 2, itemY + itemSize / 2, itemSize / 2 + 3);
                  itemGradient.addColorStop(0, isCurrentPlayer ? 'rgba(245, 158, 11, 0.4)' : 'rgba(68, 64, 60, 0.4)');
                  itemGradient.addColorStop(1, 'transparent');
                  ctx.fillStyle = itemGradient;
                  roundedRect(ctx, itemX - 2, itemY - 2, itemSize + 4, itemSize + 4, 6);
                  ctx.fill();
                  ctx.fillStyle = isCurrentPlayer ? '#f59e0b' : '#44403c';
                  roundedRect(ctx, itemX - 1, itemY - 1, itemSize + 2, itemSize + 2, 4);
                  ctx.fill();
                  ctx.save();
                  roundedRect(ctx, itemX, itemY, itemSize, itemSize, 3);
                  ctx.clip();
                  ctx.drawImage(itemImg, itemX, itemY, itemSize, itemSize);
                  ctx.restore();
                } else {
                  ctx.fillStyle = '#44403c';
                  roundedRect(ctx, itemX, itemY, itemSize, itemSize, 4);
                  ctx.fill();
                  ctx.strokeStyle = '#6b7280';
                  ctx.lineWidth = 1;
                  ctx.stroke();
                  ctx.fillStyle = '#a8a29e';
                  ctx.font = '8px system-ui';
                  ctx.textAlign = 'center';
                  ctx.fillText(itemId.toString().slice(-2), itemX + itemSize / 2, itemY + itemSize / 2 + 3);
                  ctx.textAlign = 'left';
                }
              } catch (e) {
                ctx.fillStyle = '#44403c';
                roundedRect(ctx, itemX, itemY, itemSize, itemSize, 4);
                ctx.fill();
                ctx.strokeStyle = '#6b7280';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.fillStyle = '#a8a29e';
                ctx.font = '8px system-ui';
                ctx.textAlign = 'center';
                ctx.fillText(itemId.toString().slice(-2), itemX + itemSize / 2, itemY + itemSize / 2 + 3);
                ctx.textAlign = 'left';
              }
            } else {
              ctx.fillStyle = '#1c1917';
              roundedRect(ctx, itemX, itemY, itemSize, itemSize, 4);
              ctx.fill();
              ctx.strokeStyle = '#374151';
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }
      };
      await drawTeam(team1, 30, teamStartY, 'Blue Team', match.teams.team1.win);
      await drawTeam(team2, 720, teamStartY, 'Red Team', match.teams.team2.win);
      const graphY = teamStartY + 470;
      const footerStartY = height - 60;
      const availableHeight = footerStartY - graphY - 20;
      const graphHeight = Math.max(200, availableHeight);
      const graphWidth = width - 60;
      const graphX = 30;
      const graphBgGradient = ctx.createLinearGradient(graphX, graphY, graphX, graphY + graphHeight);
      graphBgGradient.addColorStop(0, 'rgba(41, 37, 36, 0.3)');
      graphBgGradient.addColorStop(0.5, 'rgba(28, 25, 23, 0.4)');
      graphBgGradient.addColorStop(1, 'rgba(20, 16, 15, 0.5)');
      ctx.fillStyle = graphBgGradient;
      roundedRect(ctx, graphX, graphY, graphWidth, graphHeight, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(120, 113, 108, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
      const gameDurationMin = match.gameDuration / 60;
      let goldProgression = [];
      let killEvents = [];
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 18px system-ui';
      const hasRealData = match.timeline && match.timeline.info;
      const titleText = hasRealData ? 'Gold Difference Over Time' : 'Gold Difference (Estimated)';
      ctx.fillText(titleText, graphX + 20, graphY + 25);
      const team1TotalGold = team1.reduce((sum, p) => sum + (p.goldEarned || 0), 0);
      const team2TotalGold = team2.reduce((sum, p) => sum + (p.goldEarned || 0), 0);
      const goldDiff = team1TotalGold - team2TotalGold;
      const maxGoldDiff = Math.max(Math.abs(goldDiff), 10000);
      if (match.timeline && match.timeline.info && match.timeline.info.frames) {
        const frames = match.timeline.info.frames;
        frames.forEach((frame, index) => {
          const timestamp = frame.timestamp / 1000 / 60;
          if (frame.participantFrames) {
            let team1Gold = 0;
            let team2Gold = 0;
            Object.values(frame.participantFrames).forEach(pFrame => {
              const participantId = pFrame.participantId;
              const teamId = participantId <= 5 ? 100 : 200;
              if (teamId === 100) {
                team1Gold += pFrame.totalGold || 0;
              } else {
                team2Gold += pFrame.totalGold || 0;
              }
            });
            goldProgression.push({
              time: timestamp,
              goldDiff: team1Gold - team2Gold
            });
          }
        });
        frames.forEach(frame => {
          if (frame.events) {
            frame.events.forEach(event => {
              if (event.type === 'CHAMPION_KILL') {
                killEvents.push({
                  timestamp: event.timestamp / 1000 / 60,
                  killerId: event.killerId,
                  victimId: event.victimId,
                  assistingParticipantIds: event.assistingParticipantIds || []
                });
              }
            });
          }
        });
      } else {
        const timePoints = 25;
        const team1Kills = team1.reduce((sum, p) => sum + (p.kills || 0), 0);
        const team2Kills = team2.reduce((sum, p) => sum + (p.kills || 0), 0);
        const team1CS = team1.reduce((sum, p) => sum + ((p.totalMinionsKilled || 0) + (p.neutralMinionsKilled || 0)), 0);
        const team2CS = team2.reduce((sum, p) => sum + ((p.totalMinionsKilled || 0) + (p.neutralMinionsKilled || 0)), 0);
        const team1Damage = team1.reduce((sum, p) => sum + (p.totalDamageDealtToChampions || 0), 0);
        const team2Damage = team2.reduce((sum, p) => sum + (p.totalDamageDealtToChampions || 0), 0);
        const killAdvantage = team1Kills - team2Kills;
        const csAdvantage = team1CS - team2CS;
        const damageRatio = team2Damage > 0 ? team1Damage / team2Damage : 1;
        const isEarlyGameTeam = killAdvantage > 0 && gameDurationMin < 25;
        const isLateGameTeam = csAdvantage > 0 && gameDurationMin > 30;
        for (let i = 0; i <= timePoints; i++) {
          const timeRatio = i / timePoints;
          const currentTime = timeRatio * gameDurationMin;
          let baseProgression = Math.pow(timeRatio, 1.3);
          if (currentTime <= 15) {
            const earlyFactor = isEarlyGameTeam ? 1.3 : 0.8;
            baseProgression *= earlyFactor;
          } else if (currentTime <= 25) {
            const midGameBoost = 1 + killAdvantage * 0.05;
            baseProgression *= midGameBoost;
          } else {
            const lateGameFactor = isLateGameTeam ? 1.2 : 0.9;
            const scalingFactor = 1 + csAdvantage * 0.0001;
            baseProgression *= lateGameFactor * scalingFactor;
          }
          const performanceVariation = Math.sin(i * 0.6) * 0.15 * (damageRatio - 1);
          const randomVariation = (Math.sin(i * 0.9) + Math.cos(i * 1.3)) * 0.08;
          const progressiveFactor = baseProgression + performanceVariation + randomVariation;
          let currentGoldDiff = goldDiff * Math.max(0, progressiveFactor);
          if (goldDiff > 0 && currentTime > gameDurationMin * 0.7 || goldDiff < 0 && currentTime > gameDurationMin * 0.7) {
            const comebackFactor = 1 - Math.abs(goldDiff) / Math.max(team1TotalGold, team2TotalGold) * 0.1;
            currentGoldDiff *= comebackFactor;
          }
          goldProgression.push({
            time: currentTime,
            goldDiff: Math.max(-maxGoldDiff, Math.min(maxGoldDiff, currentGoldDiff))
          });
        }
      }
      ctx.fillStyle = '#a8a29e';
      ctx.font = '14px system-ui';
      const subtitleText = hasRealData ? `${Math.round(gameDurationMin)} minute game • ${killEvents.length} kills tracked` : `${Math.round(gameDurationMin)} minute game • Simulated progression`;
      ctx.fillText(subtitleText, graphX + 20, graphY + 45);
      const graphAreaX = graphX + 80;
      const graphAreaY = graphY + 65;
      const graphAreaWidth = graphWidth - 180;
      const graphAreaHeight = graphHeight - 120;
      const centerY = graphAreaY + graphAreaHeight / 2;
      ctx.strokeStyle = 'rgba(120, 113, 108, 0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 6]);
      for (let i = 0; i <= 4; i++) {
        const y = graphAreaY + i * graphAreaHeight / 4;
        ctx.beginPath();
        ctx.moveTo(graphAreaX, y);
        ctx.lineTo(graphAreaX + graphAreaWidth, y);
        ctx.stroke();
      }
      for (let i = 0; i <= 4; i++) {
        const x = graphAreaX + i * graphAreaWidth / 4;
        ctx.beginPath();
        ctx.moveTo(x, graphAreaY);
        ctx.lineTo(x, graphAreaY + graphAreaHeight);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(156, 163, 175, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(graphAreaX, centerY);
      ctx.lineTo(graphAreaX + graphAreaWidth, centerY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#d6d3d1';
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'right';
      const quarterMax = maxGoldDiff / 2;
      ctx.fillText(`+${(maxGoldDiff / 1000).toFixed(1)}k`, graphAreaX - 10, graphAreaY + 5);
      ctx.fillText(`+${(quarterMax / 1000).toFixed(1)}k`, graphAreaX - 10, graphAreaY + graphAreaHeight / 4 + 5);
      ctx.fillText('0k', graphAreaX - 10, centerY + 5);
      ctx.fillText(`-${(quarterMax / 1000).toFixed(1)}k`, graphAreaX - 10, graphAreaY + 3 * graphAreaHeight / 4 + 5);
      ctx.fillText(`-${(maxGoldDiff / 1000).toFixed(1)}k`, graphAreaX - 10, graphAreaY + graphAreaHeight + 5);
      ctx.fillStyle = '#a8a29e';
      ctx.font = '11px system-ui';
      ctx.textAlign = 'center';
      for (let i = 0; i <= 4; i++) {
        const timePoint = i / 4 * gameDurationMin;
        const x = graphAreaX + i * graphAreaWidth / 4;
        ctx.fillText(`${Math.round(timePoint)}m`, x, graphY + graphHeight - 8);
      }
      ctx.textAlign = 'left';
      if (hasRealData && killEvents.length > 0) {
        const legendY = graphY + 25;
        const legendStartX = graphX + graphWidth - 250;
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(legendStartX, legendY, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#a8a29e';
        ctx.font = '11px system-ui';
        ctx.fillText('Blue Team Kills', legendStartX + 10, legendY + 4);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(legendStartX + 120, legendY, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#a8a29e';
        ctx.fillText('Red Team Kills', legendStartX + 130, legendY + 4);
      }
      ctx.strokeStyle = goldDiff >= 0 ? '#10b981' : '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const maxTimePoints = goldProgression.length - 1;
      goldProgression.forEach((point, index) => {
        const x = graphAreaX + index / maxTimePoints * graphAreaWidth;
        const normalizedGoldDiff = point.goldDiff / maxGoldDiff;
        const y = centerY - normalizedGoldDiff * (graphAreaHeight / 2);
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      if (killEvents && killEvents.length > 0) {
        killEvents.forEach(killEvent => {
          const eventX = graphAreaX + killEvent.timestamp / gameDurationMin * graphAreaWidth;
          const isBlueTeamKill = killEvent.killerId <= 5;
          const markerColor = isBlueTeamKill ? '#3b82f6' : '#ef4444';
          ctx.strokeStyle = markerColor;
          ctx.lineWidth = 2;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(eventX, graphAreaY);
          ctx.lineTo(eventX, graphAreaY + graphAreaHeight);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = markerColor;
          ctx.beginPath();
          ctx.arc(eventX, graphAreaY - 8, 4, 0, 2 * Math.PI);
          ctx.fill();
          const killGradient = ctx.createRadialGradient(eventX, graphAreaY - 8, 0, eventX, graphAreaY - 8, 8);
          killGradient.addColorStop(0, markerColor);
          killGradient.addColorStop(1, 'transparent');
          ctx.fillStyle = killGradient;
          ctx.beginPath();
          ctx.arc(eventX, graphAreaY - 8, 8, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
      const areaGradient = ctx.createLinearGradient(0, graphAreaY, 0, graphAreaY + graphAreaHeight);
      if (goldDiff >= 0) {
        areaGradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
        areaGradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.1)');
        areaGradient.addColorStop(1, 'rgba(16, 185, 129, 0.05)');
      } else {
        areaGradient.addColorStop(0, 'rgba(239, 68, 68, 0.05)');
        areaGradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.1)');
        areaGradient.addColorStop(1, 'rgba(239, 68, 68, 0.3)');
      }
      ctx.fillStyle = areaGradient;
      ctx.beginPath();
      goldProgression.forEach((point, index) => {
        const x = graphAreaX + index / maxTimePoints * graphAreaWidth;
        const normalizedGoldDiff = point.goldDiff / maxGoldDiff;
        const y = centerY - normalizedGoldDiff * (graphAreaHeight / 2);
        if (index === 0) {
          ctx.moveTo(x, centerY);
          ctx.lineTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.lineTo(graphAreaX + graphAreaWidth, centerY);
      ctx.closePath();
      ctx.fill();
      const finalGoldX = graphAreaX + graphAreaWidth + 20;
      const finalGoldY = centerY - goldDiff / maxGoldDiff * (graphAreaHeight / 2);
      const indicatorGradient = ctx.createRadialGradient(finalGoldX, finalGoldY, 0, finalGoldX, finalGoldY, 12);
      indicatorGradient.addColorStop(0, goldDiff >= 0 ? '#10b981' : '#ef4444');
      indicatorGradient.addColorStop(1, goldDiff >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)');
      ctx.fillStyle = indicatorGradient;
      ctx.beginPath();
      ctx.arc(finalGoldX, finalGoldY, 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = goldDiff >= 0 ? '#059669' : '#dc2626';
      ctx.beginPath();
      ctx.arc(finalGoldX, finalGoldY, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#f5f5f4';
      ctx.font = 'bold 14px system-ui';
      ctx.textAlign = 'left';
      const goldDiffText = `${goldDiff >= 0 ? '+' : ''}${(goldDiff / 1000).toFixed(1)}k`;
      ctx.fillText(goldDiffText, finalGoldX + 18, finalGoldY + 5);
      const infoBoxY = graphY + graphHeight - 35;
      const infoBoxHeight = 25;
      const infoBoxWidth = 120;
      const blueBoxX = graphAreaX;
      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
      roundedRect(ctx, blueBoxX, infoBoxY, infoBoxWidth, infoBoxHeight, 6);
      ctx.fill();
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#60a5fa';
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Blue Team', blueBoxX + infoBoxWidth / 2, infoBoxY + 10);
      ctx.fillStyle = '#f5f5f4';
      ctx.font = 'bold 12px system-ui';
      ctx.fillText(`${(team1TotalGold / 1000).toFixed(1)}k gold`, blueBoxX + infoBoxWidth / 2, infoBoxY + 22);
      const redBoxX = graphAreaX + graphAreaWidth - infoBoxWidth;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      roundedRect(ctx, redBoxX, infoBoxY, infoBoxWidth, infoBoxHeight, 6);
      ctx.fill();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 11px system-ui';
      ctx.fillText('Red Team', redBoxX + infoBoxWidth / 2, infoBoxY + 10);
      ctx.fillStyle = '#f5f5f4';
      ctx.font = 'bold 12px system-ui';
      ctx.fillText(`${(team2TotalGold / 1000).toFixed(1)}k gold`, redBoxX + infoBoxWidth / 2, infoBoxY + 22);
      ctx.textAlign = 'left';
      const footerHeight = 60;
      const footerGradient = ctx.createLinearGradient(0, height - footerHeight, 0, height);
      footerGradient.addColorStop(0, '#44403c');
      footerGradient.addColorStop(1, '#292524');
      ctx.fillStyle = footerGradient;
      ctx.fillRect(0, height - footerHeight, width, footerHeight);
      ctx.strokeStyle = 'rgba(120, 113, 108, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(30, height - footerHeight);
      ctx.lineTo(width - 30, height - footerHeight);
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 16px system-ui';
      ctx.fillText('Generated by LoL Stats Tracker', 30, height - 35);
      ctx.fillStyle = '#a8a29e';
      ctx.font = '14px system-ui';
      ctx.fillText(`Match ID: ${match.matchId}`, 30, height - 15);
      canvas.toBlob(async blob => {
        try {
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([new ClipboardItem({
              'image/png': blob
            })]);
            setScreenshotCopied(true);
            setTimeout(() => setScreenshotCopied(false), 2000);
          } else {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `lol-match-${match.matchId}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        } catch (clipboardError) {
          console.error('Failed to copy image to clipboard:', clipboardError);
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `lol-match-${match.matchId}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Failed to create screenshot:', error);
    } finally {
      setScreenshotLoading(false);
    }
  };
  const renderGoldGraph = () => {
    const canvas = goldGraphCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 600;
    const height = canvas.height = 300;
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, width, height);
    const gameDurationMin = match.gameDuration / 60;
    let goldProgression = [];
    let killEvents = [];
    const graphX = 20;
    const graphY = 20;
    const graphWidth = width - 40;
    const graphHeight = height - 40;
    const team1 = match.teams.team1;
    const team2 = match.teams.team2;
    const team1TotalGold = team1.participants.reduce((sum, p) => sum + (p.goldEarned || 0), 0);
    const team2TotalGold = team2.participants.reduce((sum, p) => sum + (p.goldEarned || 0), 0);
    const goldDiff = team1TotalGold - team2TotalGold;
    const maxGoldDiff = Math.max(Math.abs(goldDiff), 10000);
    const hasRealData = match.timeline && match.timeline.info;
    if (hasRealData && match.timeline.info.frames) {
      const frames = match.timeline.info.frames;
      frames.forEach((frame, index) => {
        const timestamp = frame.timestamp / 1000 / 60;
        if (frame.participantFrames) {
          let team1Gold = 0;
          let team2Gold = 0;
          Object.values(frame.participantFrames).forEach(pFrame => {
            const participantId = pFrame.participantId;
            const teamId = participantId <= 5 ? 100 : 200;
            if (teamId === 100) {
              team1Gold += pFrame.totalGold || 0;
            } else {
              team2Gold += pFrame.totalGold || 0;
            }
          });
          goldProgression.push({
            time: timestamp,
            goldDiff: team1Gold - team2Gold
          });
        }
      });
      frames.forEach(frame => {
        if (frame.events) {
          frame.events.forEach(event => {
            if (event.type === 'CHAMPION_KILL') {
              killEvents.push({
                timestamp: event.timestamp / 1000 / 60,
                killerId: event.killerId,
                victimId: event.victimId
              });
            }
          });
        }
      });
    } else {
      const timePoints = 25;
      for (let i = 0; i <= timePoints; i++) {
        const timeRatio = i / timePoints;
        const currentTime = timeRatio * gameDurationMin;
        let currentGoldDiff = goldDiff * Math.pow(timeRatio, 1.3);
        goldProgression.push({
          time: currentTime,
          goldDiff: Math.max(-maxGoldDiff, Math.min(maxGoldDiff, currentGoldDiff))
        });
      }
    }
    const graphAreaX = graphX + 60;
    const graphAreaY = graphY + 40;
    const graphAreaWidth = graphWidth - 120;
    const graphAreaHeight = graphHeight - 80;
    const centerY = graphAreaY + graphAreaHeight / 2;
    ctx.strokeStyle = 'rgba(120, 113, 108, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = graphAreaY + i * graphAreaHeight / 4;
      ctx.beginPath();
      ctx.moveTo(graphAreaX, y);
      ctx.lineTo(graphAreaX + graphAreaWidth, y);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(120, 113, 108, 0.3)';
    ctx.beginPath();
    ctx.moveTo(graphAreaX, centerY);
    ctx.lineTo(graphAreaX + graphAreaWidth, centerY);
    ctx.stroke();
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 16px system-ui';
    const titleText = hasRealData ? 'Gold Difference Over Time' : 'Gold Difference (Estimated)';
    ctx.fillText(titleText, graphX, graphY + 15);
    ctx.fillStyle = '#a8a29e';
    ctx.font = '12px system-ui';
    const subtitleText = hasRealData ? `${Math.round(gameDurationMin)} minute game • ${killEvents.length} kills tracked` : `${Math.round(gameDurationMin)} minute game • Simulated progression`;
    ctx.fillText(subtitleText, graphX, graphY + 35);
    if (goldProgression.length > 0) {
      ctx.strokeStyle = goldDiff >= 0 ? '#3b82f6' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      goldProgression.forEach((point, index) => {
        const x = graphAreaX + point.time / gameDurationMin * graphAreaWidth;
        const y = centerY - point.goldDiff / maxGoldDiff * (graphAreaHeight / 2) * 0.8;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }
    if (hasRealData && killEvents.length > 0) {
      killEvents.forEach(kill => {
        const x = graphAreaX + kill.timestamp / gameDurationMin * graphAreaWidth;
        const isBlueTeamKill = kill.killerId >= 1 && kill.killerId <= 5;
        ctx.fillStyle = isBlueTeamKill ? '#3b82f6' : '#ef4444';
        ctx.shadowColor = isBlueTeamKill ? '#3b82f6' : '#ef4444';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(x, centerY, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    }
    ctx.fillStyle = '#a8a29e';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const value = maxGoldDiff * (1 - i / 2);
      const y = graphAreaY + i * graphAreaHeight / 4;
      ctx.fillText(`${value >= 0 ? '+' : ''}${(value / 1000).toFixed(0)}k`, graphAreaX - 10, y + 3);
    }
    ctx.textAlign = 'center';
    for (let i = 0; i <= 4; i++) {
      const timePoint = i / 4 * gameDurationMin;
      const x = graphAreaX + i * graphAreaWidth / 4;
      ctx.fillText(`${Math.round(timePoint)}m`, x, graphAreaY + graphAreaHeight + 15);
    }
    if (hasRealData && killEvents.length > 0) {
      const legendY = graphY + 20;
      const legendStartX = graphX + graphWidth - 200;
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(legendStartX, legendY, 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#a8a29e';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('Blue Team Kills', legendStartX + 10, legendY + 3);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(legendStartX + 100, legendY, 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#a8a29e';
      ctx.fillText('Red Team Kills', legendStartX + 110, legendY + 3);
    }
  };
  useEffect(() => {
    if (activeTab === 'gold-graph' && isExpanded) {
      setTimeout(renderGoldGraph, 100);
    }
  }, [activeTab, isExpanded, match]);
  return <Card className={`group transition-all duration-300 hover:shadow-lg cursor-pointer border-l-4 ${isWin ? 'border-l-emerald-400 bg-stone-900/95 shadow-emerald-500/10 hover:shadow-emerald-500/20 border-emerald-500/20 hover:border-emerald-400/40' : 'border-l-red-400 bg-stone-900/95 shadow-red-500/10 hover:shadow-red-500/20 border-red-500/20 hover:border-red-400/40'} border-stone-700/60 hover:border-stone-600/80 shadow-lg hover:shadow-xl backdrop-blur-sm hover:scale-[1.01] transform origin-center`} onClick={() => setIsExpanded(!isExpanded)}>
      <CardContent className="p-3 relative overflow-hidden">
        {}
        <div className={`absolute inset-0 pointer-events-none rounded transition-all duration-300 ${isWin ? 'bg-gradient-to-r from-emerald-500/8 via-emerald-500/4 to-transparent group-hover:from-emerald-500/12 group-hover:via-emerald-500/6' : 'bg-gradient-to-r from-red-500/8 via-red-500/4 to-transparent group-hover:from-red-500/12 group-hover:via-red-500/6'}`}></div>
        
        {}
        <div className={`absolute top-0 left-0 right-0 h-px transition-all duration-300 ${isWin ? 'bg-gradient-to-r from-emerald-400/30 via-emerald-400/10 to-transparent group-hover:from-emerald-400/50' : 'bg-gradient-to-r from-red-400/30 via-red-400/10 to-transparent group-hover:from-red-400/50'}`}></div>
        
        {}
        <div className="flex items-center justify-between gap-3 relative z-10">
          {}
          <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
            <div className="relative group/avatar">
              <div className={`absolute inset-0 rounded-full blur-sm transition-all duration-300 ${isWin ? 'bg-emerald-400/20 group-hover:bg-emerald-400/30' : 'bg-red-400/20 group-hover:bg-red-400/30'}`}></div>
              <Avatar className="h-11 w-11 border border-stone-600 relative z-10 group-hover/avatar:border-stone-500 transition-colors">
                <AvatarImage src={champion ? getImageUrl('champion', champion.image.full) : ''} alt={participant.championName} />
                <AvatarFallback className="bg-stone-700 text-amber-500 font-bold text-sm">
                  {participant.championName[0]}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-0.5 -right-0.5 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-stone-800 shadow-lg backdrop-blur-sm transition-all duration-300 z-20 ${isWin ? 'bg-stone-700/90 text-emerald-300 border-emerald-500/30 group-hover:bg-stone-600/90 group-hover:text-emerald-200' : 'bg-stone-700/90 text-red-300 border-red-500/30 group-hover:bg-stone-600/90 group-hover:text-red-200'}`}>
                {participant.champLevel}
              </div>
            </div>

            <div className="min-w-0">
              <h3 className="font-semibold text-stone-100 text-base truncate">{participant.championName}</h3>
              
              {}
              <div className="text-xs text-stone-500 mb-1 truncate">
                {queueType.replace('Ranked ', '').replace('Normal ', '')}
              </div>
              
              {}
              <div className="flex items-center gap-1.5 mt-1">
                {[participant.summoner1Id, participant.summoner2Id].map((spellId, index) => {
                const spell = summonerSpellData ? Object.values(summonerSpellData).find(s => s.key === spellId.toString()) : null;
                return <img key={index} src={spell ? getImageUrl('spell', spell.image.full) : ''} alt={spell?.name || 'Spell'} className="w-4 h-4 rounded border border-stone-600" title={spell?.name} />;
              })}

                {}
                {participant.perks && runeData && participant.perks.styles?.[0]?.selections?.[0] && (() => {
                const keystoneId = participant.perks.styles[0].selections[0].perk;
                const keystone = findRuneById(runeData, keystoneId);
                return keystone ? <img src={getRuneImageUrl(keystone.icon)} alt={keystone.name} className="w-4 h-4 rounded border border-amber-500/50" title={keystone.name} /> : null;
              })()}
              </div>
            </div>
          </div>

          {}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-center">
              <div className="text-base font-bold text-stone-100 font-mono">
                <span className="text-white">{participant.kills}</span>/
                <span className="text-red-400">{participant.deaths}</span>/
                <span className="text-white">{participant.assists}</span>
              </div>
              <div className="text-sm text-stone-400">{kda}</div>
            </div>

            <div className="hidden lg:flex gap-3 text-sm">
              <div className="text-center">
                <div className="font-semibold text-stone-100">{(participant.totalMinionsKilled || 0) + (participant.neutralMinionsKilled || 0)}</div>
                <div className="text-stone-400 text-xs">
                  CS ({(((participant.totalMinionsKilled || 0) + (participant.neutralMinionsKilled || 0)) / (match.gameDuration / 60)).toFixed(1)}/min)
                </div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-stone-100">{(participant.goldEarned / 1000).toFixed(0)}k</div>
                <div className="text-stone-400 text-xs">Gold</div>
              </div>
            </div>
          </div>

          {}
          <div className="flex items-center gap-2 flex-shrink-0">
            {}
            <div className="hidden md:flex gap-1">
              {participant.items.slice(0, 6).map((itemId, index) => <div key={index} className="w-8 h-8 bg-stone-700/30 rounded border border-stone-600 overflow-hidden hover:border-amber-500/50 transition-all duration-200">
                  {itemData && itemData[itemId] && <img src={getImageUrl('item', itemId)} alt={itemData[itemId].name} className="w-full h-full object-cover" title={itemData[itemId].name} />}
                </div>)}
            </div>

            <div className="text-right text-sm min-w-0">
              <div className="font-medium text-stone-100">{duration}</div>
              <div className="text-stone-400 truncate">
                {new Date(match.gameCreation).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
              </div>
              <DataStatus lastFetched={match.lastFetched || new Date(Date.now() - 120000)} savedToDb={match.savedToDb !== false} size="xs" className="justify-end" />
            </div>

            {}
            <Button size="sm" variant="ghost" onClick={handleScreenshot} disabled={screenshotLoading} className="h-8 w-8 p-0 text-stone-400 hover:text-amber-400 hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-amber-600/10 transition-all duration-200 flex-shrink-0 screenshot-ignore border border-transparent hover:border-amber-500/30 rounded-lg cursor-pointer" title={screenshotCopied ? "Screenshot copied to clipboard!" : "Copy match screenshot"}>
              {screenshotCopied ? <Copy className="h-4 w-4 text-emerald-400" /> : screenshotLoading ? <div className="h-4 w-4 border-2 border-stone-400 border-t-amber-400 rounded-full animate-spin" /> : <Camera className="h-4 w-4" />}
            </Button>

            <div className="text-stone-400 flex-shrink-0">
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </div>
          </div>
        </div>

        {}
        {isExpanded && <div className="mt-3 pt-3 border-t border-stone-700/60">
            {}
            <div className="flex space-x-1 mb-4">
              {[{
            id: 'overview',
            label: 'Overview',
            icon: Trophy
          }, {
            id: 'runes',
            label: 'Runes',
            icon: Shield
          }, {
            id: 'gold-graph',
            label: 'Gold Graph',
            icon: TrendingUp
          }].map(tab => {
            const IconComponent = tab.icon;
            return <button key={tab.id} onClick={e => {
              e.stopPropagation();
              setActiveTab(tab.id);
            }} className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${activeTab === tab.id ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-stone-400 hover:text-stone-200 hover:bg-stone-700/50'}`}>
                    <IconComponent className="h-4 w-4" />
                    {tab.label}
                  </button>;
          })}
            </div>

            {}
            <div className="space-y-4">
              {}
              {activeTab === 'overview' && <div className="space-y-4">
                  {}
            <div className="bg-stone-800/30 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
                <Trophy className="h-3 w-3" />
                Match Overview
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="text-center">
                  <div className="text-stone-100 font-bold">{duration}</div>
                  <div className="text-stone-400 text-xs">Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-stone-100 font-bold">{queueType.replace('Ranked ', '').replace('Normal ', '')}</div>
                  <div className="text-stone-400 text-xs">Queue</div>
                </div>
                <div className="text-center">
                  <div className={`font-bold ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isWin ? 'Victory' : 'Defeat'}
                  </div>
                  <div className="text-stone-400 text-xs">Result</div>
                </div>
                <div className="text-center">
                  <div className="text-stone-100 font-bold">{new Date(match.gameCreation).toLocaleDateString()}</div>
                  <div className="text-stone-400 text-xs">Date</div>
                </div>
              </div>
            </div>

            {}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {['team1', 'team2'].map(teamKey => {
                const team = match.teams[teamKey];
                const teamStats = {
                  totalKills: team.participants.reduce((sum, p) => sum + (p.kills || 0), 0),
                  totalGold: team.participants.reduce((sum, p) => sum + (p.goldEarned || 0), 0),
                  totalDamage: team.participants.reduce((sum, p) => sum + (p.totalDamageDealtToChampions || 0), 0),
                  totalCS: team.participants.reduce((sum, p) => sum + ((p.totalMinionsKilled || 0) + (p.neutralMinionsKilled || 0)), 0)
                };
                return <div key={teamKey} className={`border rounded-lg p-3 ${team.win ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                    {}
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`text-sm font-semibold ${team.win ? 'text-emerald-400' : 'text-red-400'}`}>
                        {teamKey === 'team1' ? 'Blue Team' : 'Red Team'} 
                        <span className="ml-1 text-xs">({team.win ? 'Victory' : 'Defeat'})</span>
                      </h4>
                      <div className="text-xs text-stone-400">
                        {teamStats.totalKills} kills • {(teamStats.totalGold / 1000).toFixed(0)}k gold
                      </div>
                    </div>

                    {}
                    <div className="grid grid-cols-4 gap-1 mb-3 p-2 bg-stone-800/40 rounded text-center text-xs">
                      <div>
                        <div className="text-stone-100 font-bold">{teamStats.totalKills}</div>
                        <div className="text-stone-400 text-xs">Kills</div>
                      </div>
                      <div>
                        <div className="text-stone-100 font-bold">{(teamStats.totalGold / 1000).toFixed(0)}k</div>
                        <div className="text-stone-400 text-xs">Gold</div>
                      </div>
                      <div>
                        <div className="text-stone-100 font-bold">{(teamStats.totalDamage / 1000).toFixed(0)}k</div>
                        <div className="text-stone-400 text-xs">Damage</div>
                      </div>
                      <div>
                        <div className="text-stone-100 font-bold">{teamStats.totalCS}</div>
                        <div className="text-stone-400 text-xs">CS</div>
                      </div>
                    </div>

                    {}
                    <div className="space-y-1">
                      {team.participants.map((p, index) => {
                      const pChampion = championData ? Object.values(championData).find(champ => champ.key === p.championId.toString()) : null;
                      const cs = (p.totalMinionsKilled || 0) + (p.neutralMinionsKilled || 0);
                      const kda = p.deaths === 0 ? p.kills + p.assists : ((p.kills + p.assists) / p.deaths).toFixed(1);
                      const dmgPercent = teamStats.totalDamage > 0 ? ((p.totalDamageDealtToChampions || 0) / teamStats.totalDamage * 100).toFixed(0) : 0;
                      const isMainPlayer = p.championId === participant.championId && p.kills === participant.kills && p.deaths === participant.deaths && p.assists === participant.assists && p.totalMinionsKilled === participant.totalMinionsKilled;
                      return <div key={index} onClick={e => handlePlayerClick(p, e)} className={`flex items-center gap-2 p-2 rounded transition-all duration-200 cursor-pointer group border ${isMainPlayer ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 hover:border-amber-500/50' : 'bg-stone-800/20 hover:bg-stone-700/40 border-transparent hover:border-stone-600/40'}`}>
                            {}
                            <div className="relative flex-shrink-0">
                              <Avatar className="h-8 w-8 border border-stone-600 group-hover:border-amber-500/50 ring-2 ring-stone-700/50">
                                <AvatarImage src={pChampion ? getImageUrl('champion', pChampion.image.full) : ''} alt={p.championName} />
                                <AvatarFallback className="text-sm bg-stone-600 text-stone-200">
                                  {p.championName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-0.5 -right-0.5 bg-stone-800 border border-stone-600 rounded text-xs px-0.5 text-stone-200 font-bold text-[9px] leading-none">
                                {p.champLevel || 'N/A'}
                              </div>
                            </div>
                            
                            {}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 mb-0.5">
                                <p className="text-xs font-medium truncate text-stone-100 group-hover:text-amber-400 max-w-20">
                                  {p.riotId || p.summonerName}
                                </p>
                                <p className="text-xs text-stone-400 truncate text-[10px]">{p.championName}</p>
                              </div>
                              
                              {}
                              <div className="flex gap-1">
                                {(() => {
                              const items = p.items || [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6].filter(itemId => itemId && itemId !== 0);
                              return items.slice(0, 6).map((itemId, itemIndex) => <div key={itemIndex} className="w-6 h-6 bg-stone-700/50 rounded border border-stone-600/50 overflow-hidden">
                                      {itemData && itemData[itemId] && <img src={getImageUrl('item', itemId)} alt={itemData[itemId].name} className="w-full h-full object-cover" title={itemData[itemId].name} />}
                                    </div>);
                            })()}
                              </div>
                            </div>

                            {}
                            <div className="flex flex-col gap-1 text-right min-w-0">
                              {}
                              <div className="bg-stone-700/20 rounded px-2 py-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-stone-400 text-[10px] font-medium">KDA</span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-emerald-400 font-bold text-xs">{p.kills}</span>
                                    <span className="text-stone-400 text-[10px]">/</span>
                                    <span className="text-red-400 font-bold text-xs">{p.deaths}</span>
                                    <span className="text-stone-400 text-[10px]">/</span>
                                    <span className="text-blue-400 font-bold text-xs">{p.assists}</span>
                                    <span className="text-stone-300 text-[10px] ml-1">({kda})</span>
                                  </div>
                                </div>
                              </div>
                              
                              {}
                              <div className="grid grid-cols-3 gap-1 text-[10px]">
                                <div className="bg-stone-800/30 rounded px-1.5 py-0.5">
                                  <div className="text-stone-100 font-bold">{cs}</div>
                                  <div className="text-stone-400 text-[9px]">CS</div>
                                </div>
                                <div className="bg-stone-800/30 rounded px-1.5 py-0.5">
                                  <div className="text-amber-400 font-bold">{(p.goldEarned / 1000).toFixed(1)}k</div>
                                  <div className="text-stone-400 text-[9px]">Gold</div>
                                </div>
                                <div className="bg-stone-800/30 rounded px-1.5 py-0.5">
                                  <div className="text-orange-400 font-bold">{(p.totalDamageDealtToChampions / 1000).toFixed(0)}k</div>
                                  <div className="text-stone-400 text-[9px]">{dmgPercent}%</div>
                                </div>
                              </div>
                            </div>
                          </div>;
                    })}
                    </div>
                  </div>;
              })}
            </div>
                </div>}

              {}
              {activeTab === 'runes' && <div className="space-y-4">
                  <div className="bg-stone-800/30 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Rune Analysis
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {['team1', 'team2'].map(teamKey => {
                  const team = match.teams[teamKey];
                  return <div key={teamKey} className={`border rounded-lg p-3 ${team.win ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                            <h5 className={`text-sm font-medium mb-3 ${team.win ? 'text-emerald-400' : 'text-red-400'}`}>
                              {teamKey === 'team1' ? 'Blue Team' : 'Red Team'}
                            </h5>
                            <div className="space-y-2">
                              {team.participants.map((p, index) => {
                        const champion = championData ? Object.values(championData).find(champ => champ.key === p.championId.toString()) : null;
                        const primaryRune = findRuneById(runeData, p.perks?.styles?.[0]?.selections?.[0]?.perk);
                        const secondaryStyle = runeData?.find(style => style.id === p.perks?.styles?.[1]?.style);
                        const primarySelections = p.perks?.styles?.[0]?.selections || [];
                        const secondarySelections = p.perks?.styles?.[1]?.selections || [];
                        return <div key={index} className="p-3 bg-stone-700/30 rounded-lg">
                                    <div className="flex items-center gap-3 mb-2">
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage src={champion ? getImageUrl('champion', `${champion.id}.png`) : ''} alt={champion?.name || 'Champion'} />
                                        <AvatarFallback className="bg-stone-600 text-stone-300 text-xs">
                                          {champion?.name?.[0] || '?'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium text-stone-200 truncate">
                                          {champion?.name || 'Unknown'}
                                        </div>
                                        <div className="text-xs text-stone-400 truncate">
                                          {p.riotId || p.summonerName}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {}
                                    <div className="flex items-center gap-4">
                                      {}
                                      <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                          {runeData?.find(style => style.id === p.perks?.styles?.[0]?.style) && <img src={getRuneImageUrl(runeData.find(style => style.id === p.perks?.styles?.[0]?.style).icon)} alt="Primary Tree" className="h-3 w-3 opacity-80" />}
                                          <span className="text-xs text-stone-300 font-medium">Primary</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          {primarySelections.map((selection, selIndex) => {
                                  const rune = findRuneById(runeData, selection.perk);
                                  return rune ? <div key={selIndex} className="relative group">
                                                <img src={getRuneImageUrl(rune.icon)} alt={rune.name} className={`${selIndex === 0 ? 'h-5 w-5' : 'h-4 w-4'} ${selIndex === 0 ? 'ring-1 ring-amber-400/50' : ''}`} title={rune.name} />
                                              </div> : null;
                                })}
                                        </div>
                                      </div>
                                      
                                      {}
                                      <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                          {secondaryStyle && <img src={getRuneImageUrl(secondaryStyle.icon)} alt="Secondary Tree" className="h-3 w-3 opacity-60" />}
                                          <span className="text-xs text-stone-400 font-medium">Secondary</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          {secondarySelections.map((selection, selIndex) => {
                                  const rune = findRuneById(runeData, selection.perk);
                                  return rune ? <div key={selIndex} className="relative group">
                                                <img src={getRuneImageUrl(rune.icon)} alt={rune.name} className="h-4 w-4 opacity-80" title={rune.name} />
                                              </div> : null;
                                })}
                                        </div>
                                      </div>
                                    </div>
                                  </div>;
                      })}
                            </div>
                          </div>;
                })}
                    </div>
                  </div>
                </div>}



              {}
              {activeTab === 'gold-graph' && <div className="space-y-4">
                  <div className="bg-stone-800/30 rounded-lg p-4">
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4" />
                        Match Timeline Analysis
                      </h4>
                      <div className="text-sm text-stone-400 mb-3">
                        Gold difference progression with kill events {match.timeline?.info ? '(Real Data)' : '(Estimated)'}
                      </div>
                    </div>
                    <div className="bg-stone-900/50 rounded border border-stone-700 p-2 overflow-hidden">
                      <canvas ref={goldGraphCanvasRef} className="w-full h-auto max-w-full" style={{
                  display: 'block'
                }} />
                    </div>
                  </div>
                </div>}
            </div>
          </div>}
      </CardContent>
    </Card>;
};
export default CompactMatchCard;