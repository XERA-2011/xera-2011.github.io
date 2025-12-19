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
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-neutral-900/90 border-t border-white/10 backdrop-blur md:static md:bg-transparent md:border-none md:p-0 flex justify-center z-50">
        <button
          onClick={onNextRound}
          className="w-full max-w-md bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg active:scale-95 transition-all text-lg"
        >
          Start Next Round
        </button>
      </div>
    );
  }

  const isDisabled = !isHumanTurn;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-neutral-900/90 border-t border-white/10 backdrop-blur md:static md:bg-transparent md:border-none md:p-0 flex justify-center gap-2 sm:gap-4 z-50">
      <button
        onClick={() => onAction('fold')}
        disabled={isDisabled}
        className="flex-1 max-w-[140px] bg-rose-700 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg shadow-lg active:scale-95 transition-all"
      >
        Fold
      </button>

      <button
        onClick={() => onAction('call')}
        disabled={isDisabled}
        className="flex-1 max-w-[140px] bg-blue-700 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg shadow-lg active:scale-95 transition-all"
      >
        {callAmount === 0 ? 'Check' : `Call $${callAmount}`}
      </button>

      <button
        onClick={() => onAction('raise')}
        disabled={isDisabled || !canRaise}
        className="flex-1 max-w-[140px] bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg shadow-lg active:scale-95 transition-all"
      >
        Raise (+20)
      </button>
    </div>
  );
}
