import { Card as CardType } from '../_lib/poker-engine';

interface CardProps {
  card?: CardType;
  hidden?: boolean;
  className?: string;
  isWinning?: boolean;
}

export function Card({ card, hidden, className = "", isWinning }: CardProps) {
  if (hidden || !card) {
    return (
      <div
        className={`w-8 h-11 sm:w-12 sm:h-16 bg-blue-900 border-[1px] sm:border-2 border-slate-200 rounded-sm sm:rounded-md shadow-sm bg-[linear-gradient(45deg,#1e3a8a_25%,transparent_25%,transparent_75%,#1e3a8a_75%,#1e3a8a),linear-gradient(45deg,#1e3a8a_25%,transparent_25%,transparent_75%,#1e3a8a_75%,#1e3a8a)] bg-[length:6px_6px] sm:bg-[length:10px_10px] ${className}`}
      />
    );
  }

  const isRed = card.color === 'red';

  return (
    <div
      className={`
        w-8 h-11 sm:w-12 sm:h-16 bg-white rounded-sm sm:rounded-md shadow-sm flex flex-col items-center justify-center select-none
        border-[1px] sm:border-2
        ${isWinning ? 'border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)] z-10' : 'border-gray-200'}
        ${className}
      `}
    >
      <div className={`text-xs sm:text-lg font-bold leading-none ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
        {card.suit}
      </div>
      <div className={`text-[10px] sm:text-base font-bold leading-none ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
        {card.rank}
      </div>
    </div>
  );
}
