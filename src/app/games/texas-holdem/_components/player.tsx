import { Player as PlayerType, Card as CardType, HandResult } from '../_lib/poker-engine';
import { Card } from './card';

interface PlayerProps {
  player: PlayerType;
  isActiveTurn: boolean;
  isDealer: boolean;
  gameStage: string;
  className?: string;
  winningCards?: CardType[];
}

export function Player({ player, isActiveTurn, isDealer, gameStage, className = "", winningCards }: PlayerProps) {
  const showFace = player.isHuman || gameStage === 'showdown';
  const isWinner = !!winningCards;

  return (
    <div className={`absolute flex flex-col items-center transition-all duration-300 ${className}`}>

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
          relative mb-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded border text-[10px] sm:text-xs text-center min-w-[60px] sm:min-w-[80px]
          transition-colors duration-300
          ${isActiveTurn ? 'bg-orange-600 border-orange-400 scale-105 z-20 shadow-lg text-white' : ''}
          ${isWinner ? 'bg-yellow-900/80 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)] z-20 text-yellow-100' : ''}
          ${!isActiveTurn && !isWinner ? 'bg-neutral-900/80 border-neutral-700 text-neutral-300' : ''}
          ${player.isEliminated ? 'opacity-50 grayscale' : ''}
        `}
      >
        <div className="font-bold truncate max-w-[60px] sm:max-w-none mx-auto text-[9px] sm:text-xs">
          {player.name}
        </div>
        <div className="text-emerald-400 font-mono leading-none">${player.chips}</div>

        {/* Status Badge */}
        {player.status !== 'active' && (
          <div className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 mt-0.5 leading-none">
            {player.status === 'folded' && 'Fold'}
            {player.status === 'allin' && <span className="text-red-400">All-in</span>}
            {player.status === 'eliminated' && 'Out'}
          </div>
        )}
        {player.currentBet > 0 && player.status !== 'folded' && (
          <div className="text-[9px] sm:text-[10px] text-blue-300 font-bold leading-none">
            ${player.currentBet}
          </div>
        )}

        {/* Dealer Button */}
        {isDealer && (
          <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white text-black font-bold text-[8px] sm:text-[10px] flex items-center justify-center border border-gray-400 shadow-sm z-30">
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
