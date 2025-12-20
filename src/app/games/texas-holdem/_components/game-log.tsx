import { useEffect, useRef, useState } from 'react';
import { GameLog as GameLogType, Player, Card, evaluateHand, HandRankType } from '../_lib/poker-engine';

interface LogProps {
  logs: GameLogType[];
  players?: Player[];
  communityCards?: Card[];
}

const RANK_NAMES: Record<HandRankType, string> = {
  [HandRankType.HIGH_CARD]: 'High Card 高牌',
  [HandRankType.PAIR]: 'Pair 对子',
  [HandRankType.TWO_PAIR]: 'Two Pair 两对',
  [HandRankType.TRIPS]: 'Trips 三条',
  [HandRankType.STRAIGHT]: 'Straight 顺子',
  [HandRankType.FLUSH]: 'Flush 同花',
  [HandRankType.FULL_HOUSE]: 'Full House 葫芦',
  [HandRankType.QUADS]: 'Quads 四条',
  [HandRankType.STRAIGHT_FLUSH]: 'Straight Flush 同花顺'
};

export function GameLog({ logs, players, communityCards }: LogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopy = () => {
    if (!players || !communityCards) {
      // Fallback
      const text = logs.map(log => {
        const cleanMessage = log.message.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
        return `[${log.type}] ${cleanMessage}`;
      }).join('\n');
      navigator.clipboard.writeText(text);

      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
      return;
    }

    const activePlayers = players.filter(p => !p.isEliminated && p.status !== 'folded');

    let report = `Texas Hold'em Showdown\n`;
    report += `Community Cards: [${communityCards.map(c => c.toString()).join(' ')}]\n`;
    report += `--------------------------------\n`;

    activePlayers.forEach(p => {
      const fullHand = [...p.hand, ...communityCards];
      if (fullHand.length >= 5) {
        const result = evaluateHand(fullHand);
        const rankStr = RANK_NAMES[result.rank];
        const cardsStr = p.hand.map(c => c.toString()).join(' ');

        // Calculate Kickers
        const kickers = result.bestHand.filter(c => !result.winningCards.some(wc => wc.suit === c.suit && wc.rank === c.rank));
        const kickerText = kickers.length > 0 ? ` (Kicker: ${kickers.map(c => c.toString()).join(' ')})` : '';

        report += `Player ${p.name}: [${cardsStr}] - ${rankStr}${kickerText}\n`;
      } else {
        report += `Player ${p.name}: [${p.hand.map(c => c.toString()).join(' ')}] - (Folded/Incomplete)\n`;
      }
    });

    navigator.clipboard.writeText(report).then(() => {
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    }).catch(err => console.error(err));
  };

  return (
    <div className="w-full flex flex-col bg-white/90 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-lg backdrop-blur-sm shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/5">
        <span className="text-xs md:text-sm font-bold text-zinc-700 dark:text-gray-400">Game Log</span>
        <button
          onClick={handleCopy}
          disabled={copyState === 'copied'}
          className={`text-[10px] px-2 py-0.5 rounded transition-all duration-300 ${copyState === 'copied'
            ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 cursor-default'
            : 'bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/20 text-zinc-600 dark:text-gray-300'
            }`}
          title="Copy showdown details"
        >
          {copyState === 'copied' ? '已复制' : '复制摊牌内容'}
        </button>
      </div>

      {/* Log Content */}
      <div
        ref={scrollRef}
        className="h-16 sm:h-24 overflow-y-auto p-2 font-mono text-xs md:text-sm text-zinc-700 dark:text-gray-300 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent"
      >
        {logs.length === 0 && <div className="text-center text-gray-500 italic">Game log...</div>}
        {logs.map((log) => (
          <div key={log.id} className="mb-0.5 leading-tight">
            {log.type === 'phase' && (
              <div className="text-zinc-900 dark:text-zinc-100 font-bold border-t border-zinc-200 dark:border-white/10 mt-1 pt-1" dangerouslySetInnerHTML={{ __html: log.message }} />
            )}
            {log.type === 'win' && (
              <div className="text-zinc-900 dark:text-white font-extrabold underline decoration-dotted decoration-zinc-500" dangerouslySetInnerHTML={{ __html: log.message }} />
            )}
            {log.type === 'action' && (
              <div className="text-zinc-600 dark:text-zinc-400" dangerouslySetInnerHTML={{ __html: log.message }} />
            )}
            {log.type === 'normal' && (
              <div className="text-zinc-500 dark:text-zinc-500" dangerouslySetInnerHTML={{ __html: log.message }} />
            )}
            {log.type === 'showdown' && (
              <div className="text-zinc-800 dark:text-zinc-200 font-bold italic" dangerouslySetInnerHTML={{ __html: log.message }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
