import { Player as PlayerType, Card as CardType, GameLog as GameLogType } from '../_lib/poker-engine';
import { Player } from './player';
import { Card } from './card';

interface TableProps {
  players: PlayerType[];
  communityCards: CardType[];
  pot: number;
  dealerIdx: number;
  currentTurnIdx: number;
  stage: string;
  logs: GameLogType[];
}

export function GameTable({ players, communityCards, pot, dealerIdx, currentTurnIdx, stage, logs }: TableProps) {
  // Mobile/Desktop positions
  // We use percentages or absolute classes. Tailwind is great for this.
  // Using a relative container with padding-bottom to maintain aspect ratio is a good trick from the original demo.
  // But for modern CSS, we can just use a fixed aspect ratio container or simpler flex/grid for mobile.
  // We will try to replicate the "oval" table look.

  // Winning cards? We need to know who won to highlight cards.
  // The engine logs who won, but the state snapshot might not explicitly easy-to-parse winning cards for highlighting unless we store it.
  // In our engine, we log it but didn't store "winningCards" in a persistent state field easily accessible except via logs.
  // Wait, the engine's `showdown` method calculates locally. 
  // Let's improve the engine or just parse the logs? Parsing logs is brittle.
  // Better: The engine should probably expose "winners" in its state if the stage is showdown.
  // For now, let's just highlight the cards of the winner if we can deduce it or if the engine was updated.
  // Actually, I can just update the engine to store 'winners' state. 
  // For this MV migration, I'll skip complex winning line highlighting unless I patch the engine.
  // Let's stick to basic display first. The Player component handles individual card highlighting if we pass it.
  // I'll add a helper to extract winning cards from the last log if it's a win log? No, that's hacky.
  // Let's assume for now we just show all cards at showdown.

  const winningCardsMap = new Map<number, CardType[]>();
  // Quick hack: if stage is showdown, find the "win" logs? 
  // actually, let's just show the cards. Highlighting is a nice-to-have.

  // Position config
  const positions = [
    "bottom-[0%] left-1/2 -translate-x-1/2 translate-y-[25%] z-20", // P0 (You) - Center bottom
    "bottom-[0%] left-[-2%] sm:bottom-[10%] sm:left-[-5%] z-10",       // P1 - Bottom Left
    "top-[0%] left-[-2%] sm:top-[12%] sm:left-[-5%] z-10",             // P2 - Top Left
    "top-[-14%] left-[28%] sm:top-[-15%] sm:left-[25%] z-10",          // P3 - Top Left-Center
    "top-[-14%] right-[28%] sm:top-[-15%] sm:right-[25%] z-10",        // P4 - Top Right-Center
    "top-[0%] right-[-2%] sm:top-[12%] sm:right-[-5%] z-10",           // P5 - Top Right
    "bottom-[0%] right-[-2%] sm:bottom-[10%] sm:right-[-5%] z-10",     // P6 - Bottom Right
  ];

  return (
    <div className="relative w-full max-w-[900px] h-auto max-h-[60vh] aspect-[1/0.6] sm:aspect-[1/0.5] mx-auto flex-shrink-0">
      {/* The Felt Table */}
      <div className="absolute inset-0 bg-[#35654d] border-[12px] border-[#5d4037] rounded-[100px] sm:rounded-[200px] shadow-[inset_0_0_60px_rgba(0,0,0,0.8)]">

        {/* Pot Display */}
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="px-4 py-1.5 bg-black/40 rounded-full border border-white/10 text-yellow-400 font-bold font-mono text-sm sm:text-base md:text-lg lg:text-xl shadow-sm backdrop-blur-sm">
            Pot: ${pot}
          </div>
        </div>

        {/* Community Cards */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1 sm:gap-2 items-center justify-center z-10 w-full px-8">
          {communityCards.map((card, i) => (
            <Card key={i} card={card} />
          ))}
          {Array.from({ length: 5 - communityCards.length }).map((_, i) => (
            <div key={`empty-${i}`} className="w-10 h-14 sm:w-14 sm:h-20 border-2 border-dashed border-white/20 rounded-md" />
          ))}
        </div>

        {/* Brand/Logo (Optional) */}
        <div className="absolute bottom-[25%] left-1/2 -translate-x-1/2 text-white/10 font-bold tracking-widest pointer-events-none select-none text-xl sm:text-2xl md:text-3xl lg:text-4xl">
          TEXAS HOLD'EM
        </div>
      </div>

      {/* Players */}
      {players.map((p) => (
        <Player
          key={p.id}
          player={p}
          isActiveTurn={p.id === currentTurnIdx && stage !== 'showdown'}
          isDealer={p.id === dealerIdx}
          gameStage={stage}
          className={positions[p.id]}
        />
      ))}
    </div>
  );
}
