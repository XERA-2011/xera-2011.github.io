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

  get color(): 'red' | 'black' {
    return (this.suit === '♥' || this.suit === '♦') ? 'red' : 'black';
  }

  toString(): string {
    return `${this.suit}${this.rank}`;
  }
}

export class Deck {
  cards: Card[];

  constructor() {
    this.cards = [];
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

  deal(): Card | undefined {
    return this.cards.pop();
  }
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

export interface HandResult {
  rank: HandRankType;
  score: number;
  winningCards: Card[];
}

export function evaluateHand(cards: Card[]): HandResult {
  let sorted = [...cards].sort((a, b) => b.value - a.value);

  let suitCounts: Record<string, number> = {};
  let rankCounts: Record<number, number> = {};
  
  sorted.forEach(c => {
    suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
    rankCounts[c.value] = (rankCounts[c.value] || 0) + 1;
  });

  let flushSuit = Object.keys(suitCounts).find(s => suitCounts[s] >= 5);
  let flushCards = flushSuit ? sorted.filter(c => c.suit === flushSuit) : [];

  const getStraight = (cardList: Card[]): Card[] | null => {
    let unique: Card[] = [];
    cardList.forEach(c => { if (!unique.find(u => u.value === c.value)) unique.push(c); });
    
    // Check for Ace low straight (A, 2, 3, 4, 5)
    if (unique.some(c => c.value === 14)) {
      let aceLow = new Card('A', unique.find(c => c.value === 14)!.suit);
      aceLow.value = 1;
      unique.push(aceLow);
    }
    // Re-sort because we might have added Ace as 1 at the end
    unique.sort((a, b) => b.value - a.value);

    for (let i = 0; i <= unique.length - 5; i++) {
        // Check if 5 consecutive cards have values decreasing by 1
        // Since we allow Ace as 1, the values can handle straight logic.
        // However, unique array might have gaps if we blindly push.
        // Correct logic: check if unique[i].value - unique[i+4].value === 4
        // Logic from original code:
        if (unique[i].value - unique[i+4].value === 4) return unique.slice(i, i + 5);
    }
    return null;
  };

  let straightCards = getStraight(sorted);
  let straightFlushCards = flushSuit ? getStraight(flushCards) : null;

  const calcScore = (rankIdx: number, best5: Card[]) => {
    let s = rankIdx * 10000000000;
    if (best5[0]) s += (best5[0].value * 100000000);
    if (best5[1]) s += (best5[1].value * 1000000);
    if (best5[2]) s += (best5[2].value * 10000);
    if (best5[3]) s += (best5[3].value * 100);
    if (best5[4]) s += (best5[4].value * 1);
    return s;
  };

  if (straightFlushCards) return { rank: HandRankType.STRAIGHT_FLUSH, score: calcScore(8, straightFlushCards), winningCards: straightFlushCards };

  let quadsValStr = Object.keys(rankCounts).find(r => rankCounts[parseInt(r)] === 4);
  if (quadsValStr) {
    let quadsVal = parseInt(quadsValStr);
    let quads = sorted.filter(c => c.value === quadsVal);
    let kicker = sorted.find(c => c.value !== quadsVal);
    let best5 = [...quads, ...(kicker ? [kicker] : [])];
    return { rank: HandRankType.QUADS, score: calcScore(7, best5), winningCards: best5 };
  }

  let tripsVals = Object.keys(rankCounts).filter(r => rankCounts[parseInt(r)] === 3).map(Number).sort((a, b) => b - a);
  let pairVals = Object.keys(rankCounts).filter(r => rankCounts[parseInt(r)] === 2).map(Number).sort((a, b) => b - a);

  if (tripsVals.length > 0) {
    let tVal = tripsVals[0];
    let pVal = -1;
    if (tripsVals.length > 1) pVal = tripsVals[1];
    else if (pairVals.length > 0) pVal = pairVals[0];

    if (pVal !== -1) {
      let tCards = sorted.filter(c => c.value === tVal);
      let pCards = sorted.filter(c => c.value === pVal).slice(0, 2);
      let best5 = [...tCards, ...pCards];
      return { rank: HandRankType.FULL_HOUSE, score: calcScore(6, best5), winningCards: best5 };
    }
  }

  if (flushCards.length >= 5) {
    let best5 = flushCards.slice(0, 5);
    return { rank: HandRankType.FLUSH, score: calcScore(5, best5), winningCards: best5 };
  }

  if (straightCards) return { rank: HandRankType.STRAIGHT, score: calcScore(4, straightCards), winningCards: straightCards };

  if (tripsVals.length > 0) {
    let tVal = tripsVals[0];
    let trips = sorted.filter(c => c.value === tVal);
    let kickers = sorted.filter(c => c.value !== tVal).slice(0, 2);
    let best5 = [...trips, ...kickers];
    return { rank: HandRankType.TRIPS, score: calcScore(3, best5), winningCards: best5 };
  }

  if (pairVals.length >= 2) {
    let p1 = pairVals[0], p2 = pairVals[1];
    let pair1 = sorted.filter(c => c.value === p1);
    let pair2 = sorted.filter(c => c.value === p2);
    let kicker = sorted.find(c => c.value !== p1 && c.value !== p2);
    let best5 = [...pair1, ...pair2, ...(kicker ? [kicker] : [])];
    return { rank: HandRankType.TWO_PAIR, score: calcScore(2, best5), winningCards: best5 };
  }

  if (pairVals.length === 1) {
    let p1 = pairVals[0];
    let pair = sorted.filter(c => c.value === p1);
    let kickers = sorted.filter(c => c.value !== p1).slice(0, 3);
    let best5 = [...pair, ...kickers];
    return { rank: HandRankType.PAIR, score: calcScore(1, best5), winningCards: best5 };
  }

  let best5 = sorted.slice(0, 5);
  return { rank: HandRankType.HIGH_CARD, score: calcScore(0, best5), winningCards: best5 };
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
}

export interface GameLog {
  id: string; // unique id for list rendering
  message: string;
  type: 'normal' | 'phase' | 'win' | 'action';
}

export class PokerGameEngine {
  players: Player[];
  deck: Deck;
  communityCards: Card[];
  pot: number;
  dealerIdx: number;
  highestBet: number;
  stage: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  actorsLeft: number;
  raisesInRound: number;
  logs: GameLog[];
  currentTurnIdx: number;
  
  // Callback to notify UI of changes
  private onChange: () => void;

  constructor(onChange: () => void) {
    this.onChange = onChange;
    this.players = [];
    this.logs = [];
    for (let i = 0; i < 7; i++) {
        this.players.push({
            id: i, isHuman: i === 0, chips: 1000, hand: [],
            status: 'active', currentBet: 0, isEliminated: false
        });
    }
    this.deck = new Deck();
    this.communityCards = [];
    this.pot = 0;
    this.dealerIdx = Math.floor(Math.random() * 7);
    this.highestBet = 0;
    this.stage = 'preflop';
    this.actorsLeft = 0;
    this.raisesInRound = 0;
    this.currentTurnIdx = 0;
    
    // Initial start
    // We defer starting next round slightly to let caller set up
    // But for simplified logic, we can just init.
  }

  getSnapshot() {
    return {
        players: [...this.players],
        communityCards: [...this.communityCards],
        pot: this.pot,
        dealerIdx: this.dealerIdx,
        highestBet: this.highestBet,
        stage: this.stage,
        currentTurnIdx: this.currentTurnIdx,
        logs: [...this.logs]
    };
  }

  log(msg: string, type: GameLog['type'] = 'normal') {
    this.logs = [...this.logs, { id: Math.random().toString(36).substring(7), message: msg, type }];
    this.notify();
  }

  notify() {
    this.onChange();
  }

  formatCards(cards: Card[]) {
    return cards.map(c => c.toString()).join(' ');
  }

  startNextRound() {
    let activePlayers = this.players.filter(p => !p.isEliminated);
    if (activePlayers.length <= 1) {
        if(activePlayers.length === 1) {
             alert(`游戏结束! 获胜者: P${activePlayers[0].id}`);
        }
        return;
    }

    // Reset loop
    this.logs = []; // Or keep history? Original clears per round mostly
    this.log('<div style="text-align:center; color:#888;">--- 新回合开始 ---</div>');

    this.deck.reset();
    this.communityCards = [];
    this.pot = 0;
    this.stage = 'preflop';
    this.players.forEach(p => {
        if (!p.isEliminated) {
            let c1 = this.deck.deal();
            let c2 = this.deck.deal();
            p.hand = (c1 && c2) ? [c1, c2] : [];
            p.status = 'active';
            p.currentBet = 0;
        } else {
            p.status = 'eliminated';
            p.hand = [];
        }
    });

    do { this.dealerIdx = (this.dealerIdx + 1) % 7; }
    while (this.players[this.dealerIdx].isEliminated);

    let sbIdx = this.getNextActive(this.dealerIdx);
    let bbIdx = this.getNextActive(sbIdx);

    this.bet(sbIdx, 5);
    this.bet(bbIdx, 10);
    this.highestBet = 10;

    this.log(`庄家 P${this.dealerIdx}, 盲注 $5/$10`, 'phase');
    
    this.prepareBettingRound(this.getNextActive(bbIdx));
    this.notify();
  }

  prepareBettingRound(startIdx: number) {
    this.raisesInRound = 0;
    let activeCount = this.players.filter(p => p.status !== 'eliminated' && p.status !== 'folded').length;
    if (activeCount < 2) { this.showdown(); return; }
    this.actorsLeft = activeCount;
    this.currentTurnIdx = startIdx;
    this.processTurn();
  }

  getNextActive(idx: number) {
    let next = (idx + 1) % 7;
    while (this.players[next].isEliminated || this.players[next].status === 'folded') {
        next = (next + 1) % 7;
    }
    return next;
  }

  bet(playerIdx: number, amount: number) {
    let p = this.players[playerIdx];
    if (amount > p.chips) amount = p.chips;
    p.chips -= amount;
    p.currentBet += amount;
    this.pot += amount;
    if (p.currentBet > this.highestBet) this.highestBet = p.currentBet;
    if (p.chips === 0 && p.status !== 'folded') p.status = 'allin';
  }

  async processTurn() {
    this.notify();
    let active = this.players.filter(p => p.status !== 'eliminated' && p.status !== 'folded');
    let notAllIn = active.filter(p => p.status !== 'allin');

    if (active.length === 1 || (notAllIn.length === 0 && this.isBetsSettled())) {
        this.runRemainingStages();
        return;
    }

    if (this.actorsLeft <= 0 && this.isBetsSettled()) {
        this.nextStage();
        return;
    }

    let p = this.players[this.currentTurnIdx];
    if (p.status === 'allin') {
        this.currentTurnIdx = this.getNextActive(this.currentTurnIdx);
        this.processTurn();
        return;
    }

    if (!p.isHuman) {
        setTimeout(() => this.aiAction(p), 500);
    }
    // if human, wait for input via handleAction
  }

  isBetsSettled() {
    let active = this.players.filter(p => p.status !== 'eliminated' && p.status !== 'folded' && p.status !== 'allin');
    if (active.length === 0) return true;
    let target = this.highestBet;
    return active.every(p => p.currentBet === target);
  }

  nextStage() {
    this.players.forEach(p => p.currentBet = 0);
    this.highestBet = 0;

    let newCards: Card[] = [];
    let stageName = "";

    if (this.stage === 'preflop') {
        this.stage = 'flop';
        newCards = [this.deck.deal()!, this.deck.deal()!, this.deck.deal()!].filter(c=>c);
        stageName = "翻牌";
    } else if (this.stage === 'flop') {
        this.stage = 'turn';
        newCards = [this.deck.deal()!].filter(c=>c);
        stageName = "转牌";
    } else if (this.stage === 'turn') {
        this.stage = 'river';
        newCards = [this.deck.deal()!].filter(c=>c);
        stageName = "河牌";
    } else if (this.stage === 'river') {
        this.showdown();
        return;
    }

    this.communityCards.push(...newCards);
    this.log(`--- ${stageName}: <span class="text-white font-bold">[${this.formatCards(newCards)}]</span> ---`, 'phase');
    
    let startIdx = this.getNextActive(this.dealerIdx);
    this.prepareBettingRound(startIdx);
    this.notify();
  }

  runRemainingStages() {
    const run = () => {
        if (this.stage !== 'showdown') {
             if (this.stage === 'river') { this.showdown(); return; }
             this.nextStage();
             // small delay for visual effect? or just immediate
             setTimeout(run, 1000); // add delay for dramatic effect
        }
    };
    run();
  }

  showdown() {
    this.stage = 'showdown';
    this.notify();

    let active = this.players.filter(p => p.status !== 'folded' && p.status !== 'eliminated');
    let bestScore = -1;
    let winners: { player: Player, result: HandResult }[] = [];

    this.log('>>> 摊牌决胜 <<<', 'phase');

    let results = active.map(p => {
        let fullHand = [...p.hand, ...this.communityCards];
        let res = evaluateHand(fullHand);
        // Debug Log for every active player at showdown
        this.log(`P${p.id}: ${this.getRankName(res.rank)} (${this.formatCards(res.winningCards)})`, 'action');
        return { player: p, result: res };
    });

    results.forEach(r => {
        if (r.result.score > bestScore) bestScore = r.result.score;
    });

    winners = results.filter(r => r.result.score === bestScore);
    let winAmount = Math.floor(this.pot / (winners.length || 1));

    winners.forEach(w => {
        let p = w.player;
        p.chips += winAmount;
        
        // Log
        let rankName = this.getRankName(w.result.rank);
        let winCardsStr = this.formatCards(w.result.winningCards);
        this.log(`🏆 P${p.id} 赢了 $${winAmount}!`, 'win');
        this.log(`&nbsp;&nbsp;牌型: ${rankName}`, 'win');
        this.log(`&nbsp;&nbsp;最佳五张: ${winCardsStr}`, 'win');
    });

    this.players.forEach(p => {
        if (p.chips <= 0) {
            p.chips = 0; p.isEliminated = true; p.status = 'eliminated';
        }
    });

    this.pot = 0;
    this.notify();
  }

  getRankName(idx: number) {
    const names = ["高牌", "一对", "两对", "三条", "顺子", "同花", "葫芦", "四条", "同花顺"];
    return names[idx];
  }

  handleAction(player: Player, action: 'fold' | 'call' | 'raise', amount = 0) {
    let callAmt = this.highestBet - player.currentBet;
    let actionStr = "";

    if (action === 'fold') {
        player.status = 'folded';
        actionStr = "弃牌";
    } else if (action === 'call') {
        this.bet(player.id, callAmt);
        actionStr = callAmt === 0 ? "过牌" : `跟注 $${callAmt}`;
    } else if (action === 'raise') {
        let raiseAmt = callAmt + amount;
        this.bet(player.id, raiseAmt);
        this.raisesInRound++;
        actionStr = `加注 到 $${player.currentBet}`;
        // Re-count actors left logic actually implies if someone raises, everyone else must act again
        // Simple way: just set everyone else who is active/not-allin as needed to act logic is complex.
        // For simple engine: 
        // If raise happens, we reset the 'done' state for others? 
        // In this simple engine, we iterate until isBetsSettled() is true.
        // But actorsLeft is a countdown. If raise happens, we might need to reset actorsLeft?
        // Original code:
        // let activeNotAllIn = this.players.filter(...)
        // this.actorsLeft = activeNotAllIn; 
        let activeNotAllIn = this.players.filter(p =>
            p.status !== 'folded' && p.status !== 'eliminated' && p.status !== 'allin'
        ).length;
        this.actorsLeft = activeNotAllIn;
    }

    let name = player.isHuman ? "你" : `P${player.id}`;
    this.log(`${name}: ${actionStr}`, 'action');

    this.actorsLeft--;
    this.notify();

    this.currentTurnIdx = this.getNextActive(this.currentTurnIdx);
    this.processTurn();
  }

  humanAction(type: 'fold' | 'call' | 'raise') {
    let p = this.players[0];
    if (type === 'raise') this.handleAction(p, 'raise', 20);
    else this.handleAction(p, type);
  }

  aiAction(player: Player) {
    let callAmt = this.highestBet - player.currentBet;
    let fullHand = [...player.hand, ...this.communityCards];
    let action: 'fold' | 'call' | 'raise' = 'fold';
    let strength = 0;

    if (fullHand.length < 5) {
        if(player.hand.length === 2) {
             let v1 = player.hand[0].value, v2 = player.hand[1].value;
             if (v1 === v2) strength = 0.8;
             else if (v1 > 10 && v2 > 10) strength = 0.6;
             else if (v1 > 12 || v2 > 12) strength = 0.4;
        }
    } else {
        let res = evaluateHand(fullHand);
        // Normalized score roughly
        strength = (res.rank + (res.score % 10000000000) / 10000000000) / 9;
        if (res.rank >= 2) strength = 0.8;
        else if (res.rank === 1) strength = 0.5;
        else strength = 0.2;
    }

    let rnd = Math.random();
    if (strength > 0.7) {
        if (rnd > 0.3) action = 'raise'; else action = 'call';
    } else if (strength > 0.4) {
        if (callAmt < 50) action = 'call'; else action = (rnd > 0.6 ? 'call' : 'fold');
    } else {
        if (callAmt === 0) action = 'call'; else action = (rnd > 0.8 ? 'call' : 'fold');
    }

    if (action === 'raise' && this.raisesInRound >= 3) action = 'call';
    if (action === 'raise' && player.chips <= callAmt + 20) action = 'call';

    if (action === 'raise') this.handleAction(player, 'raise', 20);
    else this.handleAction(player, action);
  }
}
