'use client';

import { usePokerGame } from './_hooks/use-poker-game';
import { GameTable } from './_components/game-table';
import { GameControls } from './_components/game-controls';
import { GameLog } from './_components/game-log';

export default function TexasHoldemPage() {
  const { gameState, humanAction, startNextRound } = usePokerGame();

  if (!gameState) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-900 text-white">
        Loading Poker Engine...
      </div>
    );
  }

  const { players, communityCards, pot, dealerIdx, currentTurnIdx, stage, logs, highestBet } = gameState;
  const human = players[0];
  const isHumanTurn = stage !== 'showdown' && currentTurnIdx === 0 && human.status === 'active';
  const callAmount = highestBet - human.currentBet;

  // Calculate if raise is allowed (example logic)
  const canRaise = human.chips > callAmount;

  return (
    <div className="h-[100dvh] w-full bg-neutral-950 text-white selection:bg-orange-500 selection:text-white overflow-hidden flex flex-col">

      {/* Header Area - Compact */}
      <div className="flex-none p-2 sm:p-4 flex justify-between items-center bg-gradient-to-b from-neutral-900/80 to-transparent z-50">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-yellow-200 to-yellow-600 bg-clip-text text-transparent">
            Texas Hold'em
          </h1>
        </div>

        <div className="flex gap-4">
          {/* Desktop Log Placeholder or Stats */}
          <div className="hidden md:block text-xs text-gray-500">
            {gameState && `Blind: $5/$10 | Pot: $${gameState.pot}`}
          </div>
        </div>
      </div>

      {/* Main Game Area - Flex Grow to take available space */}
      <div className="flex-1 relative flex items-center justify-center w-full max-w-7xl mx-auto px-2">

        {/* Table Container - Centered and SCALED to fit */}
        <div className="w-full h-full flex items-center justify-center">
          <GameTable
            players={players}
            communityCards={communityCards}
            pot={pot}
            dealerIdx={dealerIdx}
            currentTurnIdx={currentTurnIdx}
            stage={stage}
            logs={logs}
          />
        </div>

        {/* Floating Log for Desktop (Top Right or Absolute) */}
        <div className="hidden md:block absolute top-4 right-4 w-64 h-48 pointer-events-none opacity-80">
          <GameLog logs={logs} />
        </div>
      </div>

      {/* Bottom Controls Area */}
      <div className="flex-none pb-safe mb-2 w-full px-2 sm:mb-4">
        {/* Mobile Log (Brief) - overlap or simple 1-line? 
             Actually, let's put mobile log above controls if needed, or overlay. 
             For now, keep it simple.
         */}
        <div className="md:hidden w-full max-h-24 overflow-y-auto mb-2 opacity-70 text-[10px]">
          <GameLog logs={logs} />
        </div>

        <div className="flex justify-center">
          <GameControls
            onAction={humanAction}
            canRaise={canRaise}
            callAmount={callAmount}
            playerChips={human.chips}
            isHumanTurn={isHumanTurn}
            showNextRound={stage === 'showdown'}
            onNextRound={startNextRound}
          />
        </div>
      </div>
    </div>
  );
}
