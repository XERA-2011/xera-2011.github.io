'use client';

import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { PokerGame, Player, Card as CardType } from './game';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Custom hook to subscribe to game state
function usePokerGame(game: PokerGame) {
  const subscribe = useMemo(() => game.subscribe.bind(game), [game]);
  const getSnapshot = () => game; // This is a bit hacky, as game mutates. 
  // Better to force update on change.
  
  const [tick, setTick] = useState(0);
  useEffect(() => {
    return game.subscribe(() => setTick(t => t + 1));
  }, [game]);

  return game;
}

export default function TexasHoldemPage() {
  const game = useMemo(() => new PokerGame(), []);
  usePokerGame(game); // Trigger re-renders

  // Start game on mount
  useEffect(() => {
    // Small delay to ensure hydration
    const timer = setTimeout(() => {
      game.startNextRound();
    }, 500);
    return () => clearTimeout(timer);
  }, [game]);

  return (
    <div className="min-h-screen bg-[#222] text-white flex flex-col items-center p-4 font-sans">
      <h1 className="text-2xl font-bold mb-4">单机德州扑克 (7人局)</h1>
      
      {/* Game Table */}
      <div className="relative w-[800px] h-[500px] bg-[#35654d] border-[15px] border-[#5d4037] rounded-[250px] shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] my-5">
        
        {/* Pot Display */}
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl bg-black/30 px-4 py-1 rounded-full">
          Pot: {game.pot}
        </div>

        {/* Community Cards */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2">
          {game.communityCards.map((card, i) => (
            <PlayingCard key={i} card={card} />
          ))}
        </div>

        {/* Players */}
        {game.players.map((player) => (
          <PlayerPosition 
            key={player.id} 
            player={player} 
            isDealer={game.dealerIdx === player.id}
            isActive={game.currentTurnIdx === player.id}
            showCards={player.isHuman || game.stage === 'showdown'}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-4 mt-5">
        <Button 
          variant="destructive"
          onClick={() => game.humanAction('fold')}
          disabled={!game.players[0].isHuman || game.currentTurnIdx !== 0}
        >
          弃牌 (Fold)
        </Button>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => game.humanAction('call')}
          disabled={!game.players[0].isHuman || game.currentTurnIdx !== 0}
        >
          {game.highestBet - game.players[0].currentBet === 0 ? '过牌 (Check)' : `跟注 (Call ${game.highestBet - game.players[0].currentBet})`}
        </Button>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={() => game.humanAction('raise')}
          disabled={!game.players[0].isHuman || game.currentTurnIdx !== 0 || game.players[0].chips <= (game.highestBet - game.players[0].currentBet)}
        >
          加注 (Raise 10)
        </Button>
        
        {game.stage === 'showdown' && (
          <Button 
            className="bg-orange-500 hover:bg-orange-600"
            onClick={() => game.startNextRound()}
          >
            下一局
          </Button>
        )}
      </div>

      {/* Logs */}
      <div className="w-[800px] h-[150px] bg-[#111] mt-4 overflow-y-auto p-2 font-mono text-sm border border-[#444] rounded">
        {game.logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
}

function PlayerPosition({ player, isDealer, isActive, showCards }: { player: Player, isDealer: boolean, isActive: boolean, showCards: boolean }) {
  // Positions based on the original CSS
  const positions = [
    { bottom: '10px', left: '50%', transform: 'translateX(-50%)' }, // P0
    { bottom: '100px', left: '20px' }, // P1
    { top: '150px', left: '20px' }, // P2
    { top: '20px', left: '250px' }, // P3
    { top: '20px', right: '250px' }, // P4
    { top: '150px', right: '20px' }, // P5
    { bottom: '100px', right: '20px' }, // P6
  ];

  const style = positions[player.id];

  return (
    <div 
      className={cn(
        "absolute w-[100px] h-[120px] flex flex-col items-center justify-center transition-all duration-300",
        isActive && "ring-4 ring-yellow-400 rounded-xl shadow-[0_0_15px_5px_rgba(255,255,0,0.5)]",
        player.isEliminated && "opacity-30"
      )}
      style={style as any}
    >
      <div className="bg-black/60 p-1 rounded w-full text-center text-xs mb-1 relative">
        <div>{player.isHuman ? '你 (P0)' : `电脑 ${player.id}`}</div>
        <div className="text-yellow-400">${player.chips}</div>
        <div className="text-[10px] text-gray-300 h-4">
          {player.status === 'folded' ? 'Fold' : 
           player.status === 'eliminated' ? 'Out' :
           player.status === 'allin' ? 'All-in' :
           player.currentBet > 0 ? `Bet: ${player.currentBet}` : 
           isDealer ? 'Dealer' : ''}
        </div>
        {isDealer && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-white text-black rounded-full flex items-center justify-center font-bold text-xs border border-gray-400">
            D
          </div>
        )}
      </div>

      <div className={cn("flex gap-[2px]", player.status === 'folded' && "opacity-50 grayscale")}>
        {player.hand.length > 0 ? (
          showCards ? (
            player.hand.map((card, i) => <PlayingCard key={i} card={card} />)
          ) : (
            <>
              <CardBack />
              <CardBack />
            </>
          )
        ) : (
          <div className="h-[70px]"></div>
        )}
      </div>
    </div>
  );
}

function PlayingCard({ card }: { card: CardType }) {
  return (
    <div className={cn(
      "w-[50px] h-[70px] bg-white rounded flex flex-col items-center justify-center text-lg font-bold shadow-sm select-none",
      card.color === 'red' ? "text-red-600" : "text-black"
    )}>
      <div className="leading-none">{card.suit}</div>
      <div className="leading-none">{card.rank}</div>
    </div>
  );
}

function CardBack() {
  return (
    <div className="w-[50px] h-[70px] rounded border-2 border-white shadow-sm bg-blue-800 relative overflow-hidden">
      <div className="absolute inset-0 opacity-50" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, #606dbc, #606dbc 10px, #465298 10px, #465298 20px)'
      }}></div>
    </div>
  );
}
