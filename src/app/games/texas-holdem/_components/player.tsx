import { Player as PlayerType, Card as CardType, HandResult } from '../_lib/poker-engine';
import { Card } from './card';

interface PlayerProps {
  player: PlayerType;
  isActiveTurn: boolean;
  isDealer: boolean;
  gameStage: string;
  className?: string;
  winningCards?: CardType[];
  isWinner?: boolean;
}

export function Player({ player, isActiveTurn, isDealer, gameStage, className = "", winningCards, isWinner }: PlayerProps) {
  const showFace = player.isHuman || gameStage === 'showdown';

  return (
    <div className={`absolute flex flex-col items-center transition-all duration-300 ${className} ${(player.status === 'folded' || player.isEliminated) ? 'opacity-40' : ''}`}>

      {/* Speech Bubble */}
      {player.currentSpeech && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="relative bg-white text-black text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg border border-gray-200">
            {player.currentSpeech}
            {/* Triangle */}
            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-b border-r border-gray-200"></div>
          </div>
        </div>
      )}

      {/* Player Info Box */}
      <div
        className={`
          relative mb-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded border 
          text-[10px] sm:text-xs md:text-sm lg:text-base 
          text-center 
          min-w-[60px] sm:min-w-[80px] md:min-w-[100px] lg:min-w-[120px]
          transition-colors duration-300
          ${isActiveTurn || isWinner ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black scale-105 z-20 shadow-lg' : ''}
          ${!isActiveTurn && !isWinner ? 'bg-white/90 border-zinc-200 text-zinc-900 dark:bg-neutral-900/80 dark:border-neutral-700 dark:text-neutral-300' : ''}
          ${player.isEliminated ? 'opacity-50 grayscale' : ''}
        `}
      >
        <div className="font-bold truncate max-w-[60px] sm:max-w-none mx-auto text-[9px] sm:text-xs md:text-sm lg:text-base">
          {player.name}
        </div>
        <div className={`font-mono leading-none md:text-lg ${(isActiveTurn || isWinner) ? 'text-zinc-200 dark:text-zinc-800' : 'text-zinc-600 dark:text-zinc-400'}`}>${player.chips}</div>

        {/* Status Badge */}
        {player.status !== 'active' && (
          <div className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm uppercase font-bold text-slate-400 mt-0.5 leading-none">
            {player.status === 'folded' && 'Fold'}
            {player.status === 'allin' && <span className="text-zinc-900 dark:text-white font-black underline decoration-zinc-500">All-in</span>}
            {player.status === 'eliminated' && 'Out'}
          </div>
        )}
        {player.status !== 'folded' && player.status !== 'eliminated' && player.currentBet > 0 && (
          <div className={`text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-bold leading-none ${(isActiveTurn || isWinner) ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'} ${gameStage === 'showdown' ? 'invisible' : ''}`}>
            ${player.currentBet}
          </div>
        )}

        {/* Dealer Button */}
        {isDealer && (
          <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 md:-top-3 md:-right-3 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-white text-black font-bold text-[8px] sm:text-[10px] md:text-xs flex items-center justify-center border border-gray-400 shadow-sm z-30">
            D
          </div>
        )}
      </div>

      {/* Cards */}
      <div className={`flex gap-0.5 sm:gap-1 ${player.status === 'folded' ? 'opacity-40 grayscale' : ''}`}>
        {player.hand.length > 0 ? (
          player.hand.map((card, idx) => {
            const isWinningCard = winningCards?.some(wc => wc.rank === card.rank && wc.suit === card.suit);
            return <Card key={idx} card={card} hidden={!showFace} isWinning={isWinningCard} />;
          })
        ) : (
          // Placeholder empty layout if no cards dealt yet
          <div className="h-11 sm:h-14 w-0"></div>
        )}
      </div>
    </div>
  );
}
