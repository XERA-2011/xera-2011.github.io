'use client';

import { usePokerGame } from './_hooks/use-poker-game';
import { GameTable } from './_components/game-table';
import { GameControls } from './_components/game-controls';


export default function TexasHoldemPage() {
  const { gameState, humanAction, startNextRound } = usePokerGame();

  if (!gameState) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-900 text-white">
        Loading Poker Engine...
      </div>
    );
  }

  const { players, communityCards, pot, dealerIdx, currentTurnIdx, stage, logs, highestBet, winners, winningCards } = gameState;
  const human = players[0];
  const isHumanTurn = stage !== 'showdown' && currentTurnIdx === 0 && human.status === 'active';
  const callAmount = highestBet - human.currentBet;

  // Calculate if raise is allowed (example logic)
  const canRaise = human.chips > callAmount;

  return (
    <div className="w-full h-[100dvh] text-white selection:bg-orange-500 selection:text-white overflow-hidden flex flex-col">

      {/* Header Area - Compact */}
      <div className="flex-none pt-24 px-4 pb-4 lg:p-10 flex justify-center items-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-yellow-200 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">
          Texas Hold'em
        </h1>
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
            winners={winners}
            winningCards={winningCards}
          />
        </div>
      </div>

      {/* Bottom Controls Area */}
      <div className="flex-none pb-safe mb-2 w-full px-2 sm:mb-4">
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
