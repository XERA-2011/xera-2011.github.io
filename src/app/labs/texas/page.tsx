"use client";

import React, { useEffect, useRef, useState } from 'react';
import { PokerGame } from './_components/game-engine';
import { PlayerSpot, PokerCard, GameControls } from './_components/poker-ui';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Background from '@/components/background/star';

// Position configurations for 7 players (0 is human at bottom)
// Coordinates are roughly based on a 800x500 table centered
const POSTIONS = [
  { bottom: '10px', left: '50%', transform: 'translateX(-50%)' }, // P0 (Human)
  { bottom: '120px', left: '40px' }, // P1
  { top: '140px', left: '40px' },    // P2
  { top: '30px', left: '260px' },    // P3
  { top: '30px', right: '260px' },   // P4
  { top: '140px', right: '40px' },   // P5
  { bottom: '120px', right: '40px' }, // P6
];

export default function TexasHoldemPage() {
  // We use a ref for the game instance to persist it across renders without triggering re-renders itself
  // We use a dummy state to force re-render when the game updates
  const gameRef = useRef<PokerGame>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!gameRef.current) {
      // Initialize game with a callback to force update
      gameRef.current = new PokerGame(() => {
        setTick(t => t + 1);
      });
      // Auto-start first round
      gameRef.current.startNextRound();
    }
  }, []);

  const game = gameRef.current;

  if (!game) return <div className="text-white flex items-center justify-center h-screen">Loading Table...</div>;

  const human = game.players[0];
  const callAmt = game.highestBet - human.currentBet;
  const canCheck = callAmt === 0;

  // Show "Next" button if round is over (showdown or single winner)
  const isRoundOver = game.stage === 'showdown' || game.players.filter(p => p.status !== 'folded' && p.status !== 'eliminated').length === 1;

  const handleAction = (action: 'fold' | 'call' | 'raise', amount?: number) => {
    if (action === 'raise') {
      game.humanAction(action); // Assumes fixed raise of 10 for now as per original
    } else {
      game.handleAction(human, action);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative font-sans selection:bg-blue-500/30">
      <Background />

      {/* Header / Nav */}
      <div className="absolute top-4 left-4 z-50">
        <Link href="/labs">
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Labs
          </Button>
        </Link>
      </div>

      <div className="absolute top-4 right-4 z-50 text-white/40 text-xs">
        Texas Hold'em (7-Max) • v0.1 • Pocket Universe
      </div>

      {/* Main Game Area */}
      <div className="flex flex-col items-center justify-center h-screen pt-10 pb-20">

        {/* Table Container */}
        <div className="relative w-[900px] h-[550px] bg-[#1a1a1a] rounded-[250px] border-8 border-[#2a2a2a] shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] mx-auto overflow-hidden">
          {/* Felt Texture / Gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#2a2a2a_0%,_#0a0a0a_100%)] opacity-80" />

          {/* Logo/Table Text */}
          <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 font-bold text-6xl tracking-widest select-none pointer-events-none">
            TEXAS
          </div>

          {/* Pot Display */}
          <div className="absolute top-[32%] left-1/2 -translate-x-1/2 text-white/80 bg-black/40 px-4 py-1 rounded-full border border-white/5 backdrop-blur-sm shadow-inner">
            <span className="text-white/60 text-xs uppercase tracking-wider mr-2">Total Pot</span>
            <span className="text-xl font-bold text-yellow-500">${game.pot}</span>
          </div>

          {/* Community Cards */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-3">
            {game.communityCards.map((card, idx) => (
              <PokerCard key={idx} card={card} />
            ))}
            {/* Placeholders for missing cards */}
            {Array.from({ length: 5 - game.communityCards.length }).map((_, i) => (
              <div key={`placeholder-${i}`} className="w-12 h-16 rounded-[4px] border-2 border-dashed border-white/10 bg-white/5" />
            ))}
          </div>

          {/* Players */}
          {game.players.map((p, idx) => (
            <PlayerSpot
              key={p.id}
              player={p}
              positionStyles={POSTIONS[idx] as React.CSSProperties}
              isActive={game.currentTurnIdx === p.id && !isRoundOver}
              isDealer={game.dealerIdx === p.id}
              isWinner={false} // Todo: Highlight winner specifically if needed
              showCards={p.isHuman || game.stage === 'showdown'}
            />
          ))}

        </div>

        {/* Log Area - Floating Output */}
        <div className="absolute bottom-8 right-8 w-64 h-40 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden flex flex-col pointer-events-none">
          <div className="bg-white/5 px-3 py-1 text-[10px] text-white/50 uppercase font-bold tracking-wider">
            Game Log
          </div>
          <div className="flex-1 overflow-y-auto p-2 text-xs font-mono text-white/80 space-y-1 mask-linear-fade">
            {game.logs.map((log, i) => (
              <div key={i} className="leading-tight opacity-80 first:opacity-100 first:font-bold">{log}</div>
            ))}
          </div>
        </div>

        {/* User Controls */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40">
          <GameControls
            onAction={handleAction}
            onNext={() => game.startNextRound()}
            canCheck={canCheck}
            callAmount={callAmt}
            minRaise={10}
            userChips={human.chips}
            showNext={isRoundOver}
            disabled={!human.isHuman || game.currentTurnIdx !== human.id || isRoundOver}
          />
        </div>

      </div>
    </div>
  );
}
