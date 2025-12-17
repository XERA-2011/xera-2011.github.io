"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Card as CardType, Player } from './game-engine';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

// --- Card Component ---
interface PokerCardProps {
  card?: CardType;
  hidden?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PokerCard: React.FC<PokerCardProps> = ({ card, hidden, className, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-12 text-[10px] rounded-[2px]',
    md: 'w-12 h-16 text-sm rounded-[4px]',
    lg: 'w-16 h-24 text-lg rounded-[6px]',
  };

  if (hidden || !card) {
    return (
      <div className={cn(
        "bg-gradient-to-br from-blue-900 to-indigo-900 border border-white/20 shadow-md flex items-center justify-center relative overflow-hidden",
        sizeClasses[size],
        className
      )}>
        <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#fff_5px,#fff_10px)]" />
      </div>
    );
  }

  const isRed = card.suit === '♥' || card.suit === '♦';

  return (
    <div className={cn(
      "bg-white shadow-md flex flex-col items-center justify-center font-bold relative select-none",
      isRed ? "text-red-600" : "text-slate-900",
      sizeClasses[size],
      className
    )}>
      <div className="absolute top-0.5 left-1 leading-none">{card.rank}</div>
      <div className="text-xl leading-none">{card.suit}</div>
      <div className="absolute bottom-0.5 right-1 leading-none rotate-180">{card.rank}</div>
    </div>
  );
};

// --- Player Spot Component ---
interface PlayerSpotProps {
  player: Player;
  isActive: boolean;
  isDealer: boolean;
  isWinner: boolean;
  showCards: boolean; // For when it's showdown or human
  positionStyles: React.CSSProperties; // Pass absolute position styles
}

export const PlayerSpot: React.FC<PlayerSpotProps> = ({
  player, isActive, isDealer, isWinner, showCards, positionStyles
}) => {
  return (
    <div
      className={cn(
        "absolute flex flex-col items-center justify-center transition-all duration-300 w-32",
        player.status === 'eliminated' && "opacity-30 grayscale",
        player.status === 'folded' && "opacity-60",
      )}
      style={positionStyles}
    >
      {/* Cards Container */}
      <div className="flex gap-1 mb-2 h-16 relative">
        <AnimatePresence>
          {player.hand.map((card, idx) => (
            <motion.div
              key={`card-${player.id}-${idx}`}
              initial={{ opacity: 0, y: -10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <PokerCard
                card={card}
                hidden={!showCards}
                className={cn(
                  "shadow-lg ring-1 ring-black/20",
                  player.status === 'folded' && "grayscale"
                )}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Info Badge */}
      <div className={cn(
        "relative rounded-lg px-3 py-2 min-w-[100px] text-center backdrop-blur-md border transition-colors duration-300",
        isActive
          ? "bg-yellow-500/20 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
          : "bg-black/60 border-white/10",
        isWinner && "bg-green-500/20 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)] scale-110",
        player.status === 'folded' && "border-transparent bg-black/40"
      )}>
        {/* Dealer Button */}
        {isDealer && (
          <div className="absolute -top-3 -right-2 w-5 h-5 bg-white text-black rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm border border-gray-300 z-10">
            D
          </div>
        )}

        {/* Action Badge */}
        {player.lastAction && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-6 left-0 right-0 mx-auto w-max px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold shadow-sm"
          >
            {player.lastAction}
          </motion.div>
        )}

        <div className="text-xs font-medium text-gray-300 truncate">
          {player.isHuman ? "You" : `Bot ${player.id}`}
        </div>
        <div className="text-sm font-bold text-white flex items-center justify-center gap-1">
          <span className="text-yellow-500">$</span>
          {player.chips}
        </div>

        {/* Current Bet Display */}
        {player.currentBet > 0 && (
          <div className="absolute -bottom-6 left-0 right-0 text-center">
            <span className="inline-block bg-black/80 text-white text-[10px] px-2 py-0.5 rounded-full border border-white/20">
              Bet: {player.currentBet}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Game Controls ---
interface GameControlsProps {
  onAction: (action: 'fold' | 'call' | 'raise', amount?: number) => void;
  onNext: () => void;
  canCheck: boolean;
  callAmount: number;
  minRaise: number;
  userChips: number;
  showNext: boolean;
  disabled: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onAction, onNext, canCheck, callAmount, minRaise, userChips, showNext, disabled
}) => {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl">
      {showNext ? (
        <Button onClick={onNext} className="bg-orange-600 hover:bg-orange-700 w-full md:w-auto font-bold text-lg animate-pulse" size="lg">
          Start Next Hand
        </Button>
      ) : (
        <>
          <Button
            variant="destructive"
            onClick={() => onAction('fold')}
            disabled={disabled}
            className="w-24"
          >
            Fold
          </Button>

          <Button
            variant={"secondary"}
            onClick={() => onAction('call')}
            disabled={disabled}
            className={cn("w-32", canCheck ? "bg-blue-600/80 hover:bg-blue-600 text-white" : "bg-green-600/80 hover:bg-green-600 text-white")}
          >
            {canCheck ? "Check" : `Call ${callAmount}`}
          </Button>

          <Button
            variant="outline"
            onClick={() => onAction('raise')}
            disabled={disabled || userChips < callAmount + 10}
            className="w-32 border-white/20 hover:bg-white/10"
          >
            Raise 10
          </Button>
        </>
      )}
    </div>
  );
};
