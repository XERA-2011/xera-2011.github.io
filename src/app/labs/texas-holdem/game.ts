
export type Suit = '♠' | '♥' | '♣' | '♦';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export const SUITS: Suit[] = ['♠', '♥', '♣', '♦'];
export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
export const RANK_VALUE: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
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
    for (let s of SUITS) {
      for (let r of RANKS) {
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
  HIGH_CARD = 0, PAIR = 1, TWO_PAIR = 2, TRIPS = 3, STRAIGHT = 4,
  FLUSH = 5, FULL_HOUSE = 6, QUADS = 7, STRAIGHT_FLUSH = 8
}

export function evaluateHand(cards: Card[]): [HandRankType, number] {
  // Clone and sort cards by value desc
  const sortedCards = [...cards].sort((a, b) => b.value - a.value);

  // Count Suits and Ranks
  const suitCounts: Record<string, number> = {};
  const rankCounts: Record<number, number> = {};
  
  sortedCards.forEach(c => {
    suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
    rankCounts[c.value] = (rankCounts[c.value] || 0) + 1;
  });

  // Check Flush
  const flushSuit = Object.keys(suitCounts).find(s => suitCounts[s] >= 5);
  const flushCards = flushSuit ? sortedCards.filter(c => c.suit === flushSuit) : [];

  // Check Straight
  const getStraightHigh = (cardList: Card[]) => {
    const uniqueValues = Array.from(new Set(cardList.map(c => c.value))).sort((a, b) => b - a);
    // Special case A-5 straight (A=14, 5,4,3,2)
    if (uniqueValues.includes(14)) uniqueValues.push(1);

    for (let i = 0; i <= uniqueValues.length - 5; i++) {
      if (uniqueValues[i] - uniqueValues[i + 4] === 4) return uniqueValues[i];
    }
    return null;
  };

  const straightHigh = getStraightHigh(sortedCards);
  const straightFlushHigh = flushSuit ? getStraightHigh(flushCards) : null;

  if (straightFlushHigh !== null) return [HandRankType.STRAIGHT_FLUSH, straightFlushHigh];

  // Quads
  const quads = Object.keys(rankCounts).find(r => rankCounts[parseInt(r)] === 4);
  if (quads) return [HandRankType.QUADS, parseInt(quads)];

  // Full House
  const trips = Object.keys(rankCounts).filter(r => rankCounts[parseInt(r)] === 3).map(Number).sort((a, b) => b - a);
  const pairs = Object.keys(rankCounts).filter(r => rankCounts[parseInt(r)] === 2).map(Number).sort((a, b) => b - a);

  if (trips.length > 0 && (trips.length > 1 || pairs.length > 0)) {
    const t = trips[0];
    const p = (trips.length > 1) ? trips[1] : pairs[0];
    return [HandRankType.FULL_HOUSE, t * 100 + p];
  }

  if (flushSuit) return [HandRankType.FLUSH, flushCards[0].value];
  if (straightHigh !== null) return [HandRankType.STRAIGHT, straightHigh];
  if (trips.length > 0) return [HandRankType.TRIPS, trips[0]];

  if (pairs.length >= 2) return [HandRankType.TWO_PAIR, pairs[0] * 100 + pairs[1]];
  if (pairs.length === 1) return [HandRankType.PAIR, pairs[0]];

  return [HandRankType.HIGH_CARD, sortedCards[0].value];
}

export interface Player {
  id: number;
  isHuman: boolean;
  chips: number;
  hand: Card[];
  status: 'active' | 'folded' | 'allin' | 'eliminated';
  currentBet: number;
  isEliminated: boolean;
}

export type GameStage = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export class PokerGame {
  players: Player[] = [];
  deck: Deck;
  communityCards: Card[] = [];
  pot: number = 0;
  dealerIdx: number = 0;
  currentTurnIdx: number = 0;
  highestBet: number = 0;
  stage: GameStage = 'preflop';
  logs: string[] = [];
  roundEnder: number = 0;
  
  private listeners: (() => void)[] = [];

  constructor() {
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
    // Don't auto start in constructor to allow React to control init
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  log(msg: string) {
    this.logs = [msg, ...this.logs].slice(0, 50);
    this.notify();
  }

  startNextRound() {
    const activePlayers = this.players.filter(p => !p.isEliminated);
    if (activePlayers.length <= 1) {
      this.log(`游戏结束! 获胜者是 P${activePlayers[0].id}`);
      return;
    }

    this.deck.reset();
    this.communityCards = [];
    this.pot = 0;
    this.stage = 'preflop';
    this.players.forEach(p => {
      if (!p.isEliminated) {
        p.hand = [this.deck.deal()!, this.deck.deal()!];
        p.status = 'active';
        p.currentBet = 0;
      } else {
        p.status = 'eliminated';
        p.hand = [];
      }
    });

    // Move Dealer
    do {
      this.dealerIdx = (this.dealerIdx + 1) % 7;
    } while (this.players[this.dealerIdx].isEliminated);

    // Blinds
    let sbIdx = this.getNextActive(this.dealerIdx);
    let bbIdx = this.getNextActive(sbIdx!);

    if (sbIdx !== null) this.bet(sbIdx, 5);
    if (bbIdx !== null) this.bet(bbIdx, 10);
    this.highestBet = 10;

    this.currentTurnIdx = this.getNextActive(bbIdx!)!;
    this.roundEnder = this.currentTurnIdx; // Initial round ender is UTG

    this.log(`--- 新回合开始 --- Dealer: P${this.dealerIdx}`);
    this.notify();
    this.processTurn();
  }

  getNextActive(idx: number): number | null {
    let next = (idx + 1) % 7;
    let count = 0;
    while ((this.players[next].isEliminated || this.players[next].status === 'folded') && count < 8) {
      next = (next + 1) % 7;
      count++;
    }
    if (count >= 8) return null; // Should not happen
    return next;
  }

  bet(playerIdx: number, amount: number) {
    let p = this.players[playerIdx];
    if (amount > p.chips) amount = p.chips; // All in
    p.chips -= amount;
    p.currentBet += amount;
    this.pot += amount;
    if (p.currentBet > this.highestBet) this.highestBet = p.currentBet;
    if (p.chips === 0 && p.status !== 'folded') p.status = 'allin';
  }

  async processTurn() {
    if (this.isRoundComplete()) {
      this.nextStage();
      return;
    }

    let p = this.players[this.currentTurnIdx];
    this.notify();

    if (p.isHuman) {
      this.log("轮到你了...");
      // Wait for human input
    } else {
      setTimeout(() => this.aiAction(p), 800);
    }
  }

  isRoundComplete() {
    let active = this.players.filter(p => p.status !== 'folded' && p.status !== 'eliminated');
    if (active.length === 1) return true;

    let activeNotAllIn = active.filter(p => p.status !== 'allin');
    if (activeNotAllIn.length === 0) return true;

    return false; // Logic handled in advanceTurn with roundEnder
  }

  betsSettled() {
    let active = this.players.filter(p => p.status !== 'folded' && p.status !== 'eliminated' && p.status !== 'allin');
    if (active.length === 0) return true;
    let allMatched = active.every(p => p.currentBet === this.highestBet);
    return allMatched;
  }

  advanceTurn() {
    let next = this.getNextActive(this.currentTurnIdx);
    if (next === null) return;

    this.currentTurnIdx = next;

    if (this.betsSettled() && this.currentTurnIdx === this.roundEnder) {
      this.nextStage();
    } else {
      this.processTurn();
    }
  }

  nextStage() {
    this.players.forEach(p => p.currentBet = 0);
    this.highestBet = 0;
    this.roundEnder = this.getNextActive(this.dealerIdx)!;
    this.currentTurnIdx = this.roundEnder;

    let activeCount = this.players.filter(p => p.status !== 'folded' && p.status !== 'eliminated').length;
    if (activeCount < 2) {
      this.showdown();
      return;
    }

    if (this.stage === 'preflop') {
      this.stage = 'flop';
      this.communityCards.push(this.deck.deal()!, this.deck.deal()!, this.deck.deal()!);
      this.log(`翻牌: ${this.communityCards.join(' ')}`);
    } else if (this.stage === 'flop') {
      this.stage = 'turn';
      this.communityCards.push(this.deck.deal()!);
      this.log(`转牌: ${this.communityCards[this.communityCards.length - 1]}`);
    } else if (this.stage === 'turn') {
      this.stage = 'river';
      this.communityCards.push(this.deck.deal()!);
      this.log(`河牌: ${this.communityCards[this.communityCards.length - 1]}`);
    } else if (this.stage === 'river') {
      this.showdown();
      return;
    }

    this.notify();
    this.processTurn();
  }

  showdown() {
    this.stage = 'showdown';
    
    let active = this.players.filter(p => p.status !== 'folded' && p.status !== 'eliminated');
    if (active.length === 0) return;

    let bestPlayer: Player | null = null;
    let bestScore = -1;

    let msg = "--- 摊牌 ---\n";

    active.forEach(p => {
      let fullHand = [...p.hand, ...this.communityCards];
      let result = evaluateHand(fullHand);
      let score = result[0] * 10000 + result[1];

      let rankName = HandRankType[result[0]];
      msg += `P${p.id}: ${rankName} \n`;

      if (score > bestScore) {
        bestScore = score;
        bestPlayer = p;
      }
    });

    this.log(msg);

    if (bestPlayer) {
      // @ts-ignore
      this.log(`P${bestPlayer.id} 赢得了底池 ${this.pot}!`);
      // @ts-ignore
      bestPlayer.chips += this.pot;
    }

    this.pot = 0;

    this.players.forEach(p => {
      if (p.chips <= 0) {
        p.chips = 0;
        p.isEliminated = true;
        p.status = 'eliminated';
        this.log(`P${p.id} 已破产退场。`);
      }
    });

    this.notify();
  }

  handleAction(player: Player, action: 'fold' | 'call' | 'raise', amount: number = 0) {
    let callAmt = this.highestBet - player.currentBet;

    if (action === 'fold') {
      player.status = 'folded';
      this.log(`P${player.id} 弃牌`);
    } else if (action === 'call') {
      this.bet(player.id, callAmt);
      if (callAmt === 0) this.log(`P${player.id} 过牌`);
      else this.log(`P${player.id} 跟注 ${callAmt}`);
    } else if (action === 'raise') {
      let raiseAmt = callAmt + amount;
      this.bet(player.id, raiseAmt);
      this.log(`P${player.id} 加注 ${amount}`);
      this.roundEnder = player.id;
    }

    this.notify();
    this.advanceTurn();
  }

  humanAction(type: 'fold' | 'call' | 'raise') {
    let p = this.players[0];
    if (type === 'raise') {
      this.handleAction(p, 'raise', 10);
    } else {
      this.handleAction(p, type);
    }
  }

  aiAction(player: Player) {
    let callAmt = this.highestBet - player.currentBet;
    let fullHand = [...player.hand, ...this.communityCards];

    if (fullHand.length < 5) {
      // Preflop
      let c1 = player.hand[0].value;
      let c2 = player.hand[1].value;
      let isPair = c1 === c2;
      let highCard = Math.max(c1, c2);

      if (isPair && c1 >= 8) this.handleAction(player, 'raise', 10);
      else if (highCard >= 12 && callAmt <= 10) this.handleAction(player, 'call');
      else if (callAmt === 0) this.handleAction(player, 'call');
      else if (callAmt > 5) this.handleAction(player, 'fold');
      else this.handleAction(player, 'call');
    } else {
      // Postflop
      let result = evaluateHand(fullHand);
      let rank = result[0];
      let strength = rank;
      let r = Math.random();

      if (strength >= 2) {
        if (r > 0.3) this.handleAction(player, 'raise', 10);
        else this.handleAction(player, 'call');
      } else if (strength === 1) {
        if (callAmt < 20) this.handleAction(player, 'call');
        else this.handleAction(player, 'fold');
      } else {
        if (callAmt === 0) this.handleAction(player, 'call');
        else if (r > 0.9) this.handleAction(player, 'raise', 10);
        else this.handleAction(player, 'fold');
      }
    }
  }
}
