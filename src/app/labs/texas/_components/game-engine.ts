export type Suit = '♠' | '♥' | '♣' | '♦';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export const SUITS: Suit[] = ['♠', '♥', '♣', '♦'];
export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
export const RANK_VALUE: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

export class Card {
  rank: Rank;
  suit: Suit;
  value: number;

  constructor(rank: Rank, suit: Suit) {
    this.rank = rank;
    this.suit = suit;
    this.value = RANK_VALUE[rank];
  }

  toString() { return `${this.suit}${this.rank}`; }
  get color() { return (this.suit === '♥' || this.suit === '♦') ? 'red' : 'black'; }
}

export class Deck {
  cards: Card[] = [];

  constructor() {
    this.reset();
  }

  reset() {
    this.cards = [];
    for (const s of SUITS) {
      for (const r of RANKS) {
        this.cards.push(new Card(r, s));
      }
    }
    this.shuffle();
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal() { return this.cards.pop(); }
}

export enum HandRankType {
  HIGH_CARD = 0,
  PAIR = 1,
  TWO_PAIR = 2,
  TRIPS = 3,
  STRAIGHT = 4,
  FLUSH = 5,
  FULL_HOUSE = 6,
  QUADS = 7,
  STRAIGHT_FLUSH = 8
}

export function evaluateHand(cards: Card[]): [HandRankType, number] {
  if (!cards || cards.length === 0) return [HandRankType.HIGH_CARD, 0];
  
  // Sort cards by value desc
  const sortedCards = [...cards].sort((a, b) => b.value - a.value);

  // Stats
  const suitCounts: Record<string, number> = {};
  const rankCounts: Record<number, number> = {};
  
  sortedCards.forEach(c => {
    suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
    rankCounts[c.value] = (rankCounts[c.value] || 0) + 1;
  });

  // Check flush
  const flushSuit = Object.keys(suitCounts).find(s => suitCounts[s] >= 5);
  const flushCards = flushSuit ? sortedCards.filter(c => c.suit === flushSuit) : [];

  // Check straight
  const getStraightHigh = (cardList: Card[]) => {
    const uniqueValues = Array.from(new Set(cardList.map(c => c.value))).sort((a, b) => b - a);
    // A-5 straight (A=14, 5,4,3,2) -> Treat A as 1
    if (uniqueValues.includes(14)) uniqueValues.push(1);

    for (let i = 0; i <= uniqueValues.length - 5; i++) {
        // Check if 5 consecutive values exist
        // The slice is strict so we need to be careful.
        // Simplified check:
        // Because uniqueValues is sorted desc, uniqueValues[i] is the potential high.
        // We need to check if uniqueValues[i] - uniqueValues[i+4] === 4
        // Logic from original code:
        if (uniqueValues[i] - uniqueValues[i + 4] === 4) return uniqueValues[i];
    }
    return null;
  };

  const straightHigh = getStraightHigh(sortedCards);
  const straightFlushHigh = flushSuit ? getStraightHigh(flushCards) : null;

  if (straightFlushHigh) return [HandRankType.STRAIGHT_FLUSH, straightFlushHigh];

  // Quads
  const quads = Object.keys(rankCounts).find(r => rankCounts[parseInt(r)] === 4);
  if (quads) return [HandRankType.QUADS, parseInt(quads)];

  // Full House
  const trips = Object.keys(rankCounts).filter(r => rankCounts[parseInt(r)] === 3).sort((a, b) => parseInt(b) - parseInt(a));
  const pairs = Object.keys(rankCounts).filter(r => rankCounts[parseInt(r)] === 2).sort((a, b) => parseInt(b) - parseInt(a));

  if (trips.length > 0 && (trips.length > 1 || pairs.length > 0)) {
    const t = parseInt(trips[0]);
    const p = (trips.length > 1) ? parseInt(trips[1]) : parseInt(pairs[0]);
    return [HandRankType.FULL_HOUSE, t * 100 + p];
  }

  if (flushSuit) return [HandRankType.FLUSH, flushCards[0].value];
  if (straightHigh) return [HandRankType.STRAIGHT, straightHigh];
  if (trips.length > 0) return [HandRankType.TRIPS, parseInt(trips[0])];

  if (pairs.length >= 2) return [HandRankType.TWO_PAIR, parseInt(pairs[0]) * 100 + parseInt(pairs[1])];
  if (pairs.length === 1) return [HandRankType.PAIR, parseInt(pairs[0])];

  return [HandRankType.HIGH_CARD, sortedCards[0].value];
}

export type PlayerStatus = 'active' | 'folded' | 'allin' | 'eliminated';

export interface Player {
  id: number;
  isHuman: boolean;
  chips: number;
  hand: Card[];
  status: PlayerStatus;
  currentBet: number;
  isEliminated: boolean;
  lastAction?: string; // For UI feedback
}

export type GameStage = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export class PokerGame {
  players: Player[];
  deck: Deck;
  communityCards: Card[];
  pot: number;
  dealerIdx: number;
  currentTurnIdx: number;
  highestBet: number;
  stage: GameStage;
  logs: string[];
  roundEnder: number; // The player index that ends the betting round if reached with settled bets
  
  // Callback for UI updates
  onUpdate: () => void;

  constructor(onUpdate: () => void) {
    this.onUpdate = onUpdate;
    this.players = [];
    for (let i = 0; i < 7; i++) {
        this.players.push({
            id: i,
            isHuman: i === 0,
            chips: 100,
            hand: [],
            status: 'active',
            currentBet: 0,
            isEliminated: false
        });
    }
    this.deck = new Deck();
    this.communityCards = [];
    this.pot = 0;
    this.dealerIdx = 0;
    this.currentTurnIdx = 0;
    this.highestBet = 0;
    this.stage = 'preflop';
    this.logs = [];
    this.roundEnder = 0;
  }

  log(msg: string) {
    this.logs.unshift(msg);
    if (this.logs.length > 50) this.logs.pop();
    this.onUpdate();
  }

  startNextRound() {
    // Check winner of game
    const activePlayers = this.players.filter(p => !p.isEliminated);
    if (activePlayers.length <= 1) {
        this.log(`Game Over! Winner is P${activePlayers[0].id}`);
        // Optionally reset game or just stop
        // For now, let's just reset everyone's chips to 100 to restart
        this.players.forEach(p => {
            p.chips = 100;
            p.isEliminated = false;
            p.status = 'active';
        });
        this.log("Starting new game...");
    }

    // Reset state
    this.deck.reset();
    this.communityCards = [];
    this.pot = 0;
    this.stage = 'preflop';
    this.players.forEach(p => {
        if (!p.isEliminated) {
            const c1 = this.deck.deal();
            const c2 = this.deck.deal();
            p.hand = (c1 && c2) ? [c1, c2] : [];
            p.status = 'active';
            p.currentBet = 0;
            p.lastAction = undefined;
        } else {
            p.status = 'eliminated';
            p.hand = [];
            p.lastAction = undefined;
        }
    });

    // Move Dealer
    let loopCount = 0;
    do {
        this.dealerIdx = (this.dealerIdx + 1) % 7;
        loopCount++;
    } while (this.players[this.dealerIdx].isEliminated && loopCount < 10);

    // Blinds
    const sbIdx = this.getNextActive(this.dealerIdx);
    const bbIdx = sbIdx !== null ? this.getNextActive(sbIdx) : null;

    if (sbIdx !== null) this.bet(sbIdx, 5);
    if (bbIdx !== null) this.bet(bbIdx, 10);

    this.highestBet = 10;
    
    // UTG starts
    this.currentTurnIdx = bbIdx !== null ? (this.getNextActive(bbIdx) ?? bbIdx) : 0;
    
    // Set initial round ender (for preflop it's usually BB unless there's a raise, but we simplify to BB's next)
    // Actually, in preflop, action ends when it comes back to BB and they check, or everyone calls.
    // We set roundEnder to the player who acts after BB originally. 
    // If it comes back to this person and bets are settled, round over.
    this.roundEnder = this.currentTurnIdx;

    this.log(`--- New Round --- Dealer: P${this.dealerIdx}`);
    this.processTurn();
    this.onUpdate();
  }

  getNextActive(idx: number): number | null {
    let next = (idx + 1) % 7;
    let loops = 0;
    while ((this.players[next].isEliminated || this.players[next].status === 'folded') && loops < 8) {
        next = (next + 1) % 7;
        loops++;
    }
    if (loops >= 7) return null; 
    return next;
  }

  bet(playerIdx: number, amount: number) {
    const p = this.players[playerIdx];
    if (amount > p.chips) amount = p.chips; 
    p.chips -= amount;
    p.currentBet += amount;
    this.pot += amount;
    if (p.currentBet > this.highestBet) this.highestBet = p.currentBet;
    if (p.chips === 0 && p.status !== 'folded') p.status = 'allin';
  }

  async processTurn() {
     // Check if round should end immediately (e.g. all folded/all in)
     const active = this.players.filter(p => p.status !== 'folded' && p.status !== 'eliminated');
     if (active.length === 1) {
        this.showdown(); // Technically just wins, but showdown logic handles "1 active" too
        return;
     }

     const p = this.players[this.currentTurnIdx];
     if (!p) return; // Should not happen

     this.onUpdate();

     if (p.isHuman) {
         // Wait for user input
         this.log("Your turn...");
     } else {
         // AI delay simulation
         setTimeout(() => {
             this.aiAction(p);
         }, 600);
     }
  }

  betsSettled() {
    const active = this.players.filter(p => p.status !== 'folded' && p.status !== 'eliminated' && p.status !== 'allin');
    if (active.length === 0) return true; 
    // Everyone playing must match the highest bet
    const allMatched = active.every(p => p.currentBet === this.highestBet);
    return allMatched;
  }

  nextStage() {
    this.players.forEach(p => {
        p.currentBet = 0;
        p.lastAction = undefined;
    });
    this.highestBet = 0;
    
    // Next to act is the one after dealer
    const nextAfterDealer = this.getNextActive(this.dealerIdx);
    this.roundEnder = nextAfterDealer ?? 0;
    this.currentTurnIdx = this.roundEnder;

    const activeCount = this.players.filter(p => p.status !== 'folded' && p.status !== 'eliminated').length;
    if (activeCount < 2) {
        this.showdown();
        return;
    }

    if (this.stage === 'preflop') {
        this.stage = 'flop';
        const c1 = this.deck.deal(); const c2 = this.deck.deal(); const c3 = this.deck.deal();
        if(c1 && c2 && c3) this.communityCards.push(c1, c2, c3);
        this.log(`Flop: ${this.communityCards.map(c=>c.toString()).join(' ')}`);
    } else if (this.stage === 'flop') {
        this.stage = 'turn';
        const c = this.deck.deal();
        if(c) this.communityCards.push(c);
        this.log(`Turn: ${this.communityCards[this.communityCards.length-1].toString()}`);
    } else if (this.stage === 'turn') {
        this.stage = 'river';
        const c = this.deck.deal();
        if(c) this.communityCards.push(c);
        this.log(`River: ${this.communityCards[this.communityCards.length-1].toString()}`);
    } else if (this.stage === 'river') {
        this.showdown();
        return;
    }

    this.processTurn();
    this.onUpdate();
  }

  advanceTurn() {
     const next = this.getNextActive(this.currentTurnIdx);
     if (next === null) {
         this.showdown();
         return;
     }

     this.currentTurnIdx = next;

     // Check if we reached the round ender AND bets are settled
     // If bets are NOT settled, we continue regardless of roundEnder
     // If bets ARE settled, and we are at roundEnder, we move to next stage
     // Special case: if roundEnder is the current player, and they just checked/called to close action
     
     if (this.betsSettled() && this.currentTurnIdx === this.roundEnder) {
         this.nextStage();
     } else {
         this.processTurn();
     }
  }

  handleAction(player: Player, action: 'fold'|'call'|'raise', amount=0) {
    const callAmt = this.highestBet - player.currentBet;

    if (action === 'fold') {
        player.status = 'folded';
        player.lastAction = 'Fold';
        this.log(`P${player.id} Folds`);
    } else if (action === 'call') {
        this.bet(player.id, callAmt);
        player.lastAction = callAmt === 0 ? 'Check' : 'Call';
        if (callAmt === 0) this.log(`P${player.id} Checks`);
        else this.log(`P${player.id} Calls ${callAmt}`);
    } else if (action === 'raise') {
        const raiseAmt = callAmt + amount;
        this.bet(player.id, raiseAmt);
        player.lastAction = `Raise ${amount}`;
        this.log(`P${player.id} Raises ${amount}`);
        // Reset round ender to the current player because they reopened the betting
        this.roundEnder = player.id;
    }
    
    this.onUpdate();
    this.advanceTurn();
  }

  humanAction(type: 'fold'|'call'|'raise'|'check') {
    const p = this.players[0];
    if (type === 'raise') {
        this.handleAction(p, 'raise', 10);
    } else {
        // cast type to handleAction expected type, 'check' maps to 'call' logic in handleAction? 
        // Actually handleAction takes 'fold' | 'call' | 'raise'. 
        // 'check' is essentially 'call' with 0 amount difference.
        if (type === 'check') this.handleAction(p, 'call');
        else this.handleAction(p, type as 'fold'|'call');
    }
  }

  aiAction(player: Player) {
    const callAmt = this.highestBet - player.currentBet;
    const fullHand = [...player.hand, ...this.communityCards];

    // Simple AI
    if (fullHand.length < 5) {
        // Preflop
        const c1 = player.hand[0].value;
        const c2 = player.hand[1].value;
        const isPair = c1 === c2;
        const highCard = Math.max(c1, c2);

        if (isPair && c1 >= 8) this.handleAction(player, 'raise', 10);
        else if (highCard >= 12 && callAmt <= 10) this.handleAction(player, 'call');
        else if (callAmt === 0) this.handleAction(player, 'call');
        else if (callAmt > 5) this.handleAction(player, 'fold');
        else this.handleAction(player, 'call');
    } else {
        // Postflop
        const [rank, score] = evaluateHand(fullHand);
        const r = Math.random();

        if (rank >= 2) { // Two Pair or better
            if (r > 0.3) this.handleAction(player, 'raise', 10);
            else this.handleAction(player, 'call');
        } else if (rank === 1) { // Pair
            if (callAmt < 20) this.handleAction(player, 'call');
            else this.handleAction(player, 'fold');
        } else { // High Card
            if (callAmt === 0) this.handleAction(player, 'call');
            else if (r > 0.9) this.handleAction(player, 'raise', 10); // Bluff
            else this.handleAction(player, 'fold');
        }
    }
  }

  showdown() {
      this.stage = 'showdown';
      const active = this.players.filter(p => !p.isEliminated && p.status !== 'folded');
      
      let bestPlayer: Player | null = null;
      let bestScore = -1;
      let winnerDesc = '';

      if (active.length === 1) {
          bestPlayer = active[0];
          winnerDesc = '(Others Folded)';
      } else {
          this.log("--- Showdown ---");
          active.forEach(p => {
              const fullHand = [...p.hand, ...this.communityCards];
              const [rankType, tieBreaker] = evaluateHand(fullHand);
              const score = rankType * 10000 + tieBreaker;
              const rankName = HandRankType[rankType];
              
              this.log(`P${p.id}: ${rankName}`);
              
              if (score > bestScore) {
                  bestScore = score;
                  bestPlayer = p;
                  winnerDesc = rankName;
              }
          });
      }

      if (bestPlayer) {
          this.log(`P${bestPlayer.id} Wins ${this.pot}! ${winnerDesc}`);
          bestPlayer.chips += this.pot;
          bestPlayer.lastAction = 'WINNER';
      }

      this.pot = 0;
      
      // Check elimination
      this.players.forEach(p => {
          if (p.chips <= 0) {
              p.chips = 0;
              p.isEliminated = true;
              p.status = 'eliminated';
              this.log(`P${p.id} Eliminated`);
          }
      });

      this.onUpdate();
  }
}
