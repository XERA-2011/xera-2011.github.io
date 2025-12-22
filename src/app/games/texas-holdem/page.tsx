'use client';

import { usePokerGame } from './_hooks/use-poker-game';
import { GameTable } from './_components/game-table';
import { GameControls } from './_components/game-controls';


export default function TexasHoldemPage() {
  const { gameState, humanAction, startNextRound, resetGame } = usePokerGame();

  if (!gameState) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-zinc-950 text-black dark:text-white">
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

  const survivorCount = players.filter(p => !p.isEliminated).length;
  const isGameOver = survivorCount <= 1;

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        footer { display: none !important; }
      `}} />
      <div className="w-full h-dvh pt-16 text-zinc-900 dark:text-zinc-100 selection:bg-zinc-300 dark:selection:bg-zinc-700 selection:text-black overflow-hidden flex flex-col overscroll-none">

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
              isGameOver={isGameOver}
              onReset={resetGame}
            />
          </div>
        </div>
      </div>
    </>
  );
}
