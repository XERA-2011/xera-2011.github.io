interface ControlsProps {
  onAction: (action: 'fold' | 'call' | 'raise') => void;
  canRaise: boolean;
  callAmount: number;
  playerChips: number;
  isHumanTurn: boolean;
  showNextRound: boolean;
  onNextRound: () => void;
}

export function GameControls({
  onAction,
  canRaise,
  callAmount,
  playerChips,
  isHumanTurn,
  showNextRound,
  onNextRound
}: ControlsProps) {

  if (showNextRound) {
    return (
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-neutral-900/90 border-t border-zinc-200 dark:border-white/10 backdrop-blur md:static md:bg-transparent md:border-none md:p-0 flex justify-center z-50">
        <button
          onClick={onNextRound}
          className="w-full max-w-md bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black font-bold h-14 flex items-center justify-center px-6 rounded-lg shadow-lg active:scale-95 transition-all text-lg md:text-xl"
        >
          Start Next Round
        </button>
      </div>
    );
  }

  const isDisabled = !isHumanTurn;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-neutral-900/90 border-t border-zinc-200 dark:border-white/10 backdrop-blur md:static md:bg-transparent md:border-none md:p-0 flex justify-center gap-2 sm:gap-4 z-50">
      <button
        onClick={() => onAction('fold')}
        disabled={isDisabled}
        className="flex-1 max-w-[140px] md:max-w-[180px] bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-black dark:text-white font-bold h-14 flex items-center justify-center px-4 rounded-lg shadow-lg active:scale-95 transition-all md:text-lg"
      >
        Fold
      </button>

      <button
        onClick={() => onAction('call')}
        disabled={isDisabled}
        className="flex-1 max-w-[140px] md:max-w-[180px] bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-700 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold h-14 flex items-center justify-center px-4 rounded-lg shadow-lg active:scale-95 transition-all md:text-lg"
      >
        {callAmount === 0 ? 'Check' : `Call $${callAmount}`}
      </button>

      <button
        onClick={() => onAction('raise')}
        disabled={isDisabled || !canRaise}
        className="flex-1 max-w-[140px] md:max-w-[180px] bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-black font-bold h-14 flex items-center justify-center px-4 rounded-lg shadow-lg active:scale-95 transition-all md:text-lg"
      >
        Raise (+20)
      </button>
    </div>
  );
}
