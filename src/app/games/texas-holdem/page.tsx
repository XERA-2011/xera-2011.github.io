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
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-orange-500 selection:text-white pb-24 md:pb-0">

      {/* Navbar Placeholder space if needed, assuming global nav exists */}
      <div className="h-16" />

      <div className="container mx-auto px-2 sm:px-4 max-w-5xl py-4 sm:py-8 flex flex-col gap-4">

        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-200 to-yellow-600 bg-clip-text text-transparent">
              Texas Hold'em
            </h1>
            <p className="text-gray-400 text-sm hidden sm:block">
              Classic No-Limit Hold'em against AI bots.
            </p>
          </div>

          {/* Desktop Side Log - Hidden on mobile, shown on right/top for desktop ?? 
                Actually, let's put log below table or to the side. 
            */}
          <div className="w-full md:w-80 hidden md:block">
            <GameLog logs={logs} />
          </div>
        </div>

        {/* Game Area */}
        <GameTable
          players={players}
          communityCards={communityCards}
          pot={pot}
          dealerIdx={dealerIdx}
          currentTurnIdx={currentTurnIdx}
          stage={stage}
          logs={logs}
        />

        {/* Mobile Log */}
        <div className="block md:hidden w-full">
          <GameLog logs={logs} />
        </div>

        {/* Controls */}
        <div className="mt-4 flex justify-center">
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
