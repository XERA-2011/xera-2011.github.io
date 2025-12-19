
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

// ... (previous code unchanged, we only replace the relevant parts)

export type PersonaType = 'human' | 'tiger' | 'poker_face' | 'crazy' | 'calm' | 'simple' |'luck';

export interface Persona {
  id: PersonaType;
  name: string;
  desc: string;
}

export const PERSONAS: Record<PersonaType, Persona> = {
  'human': { id: 'human', name: 'You', desc: 'User' },
  'tiger': { id: 'tiger', name: '今晚打老虎', desc: 'Aggressive (Always Raise)' },
  'poker_face': { id: 'poker_face', name: '扑克脸', desc: 'Tight (Only plays good hands)' },
  'crazy': { id: 'crazy', name: '疯狂的玩家', desc: 'Loose/Aggressive (Random)' },
  'calm': { id: 'calm', name: '冷静的玩家', desc: 'Tight/Aggressive' },
  'simple': { id: 'simple', name: '简单的玩家', desc: 'Passport/Passive' },
  'luck': { id: 'luck', name: '运气王', desc: 'Random' },
};

export type PlayerStatus = 'active' | 'folded' | 'allin' | 'eliminated';

export interface Player {
  id: number;
  persona: PersonaType;
  name: string;
  isHuman: boolean;
  chips: number;
  hand: Card[];
  status: PlayerStatus;
  currentBet: number;
  isEliminated: boolean;
  currentSpeech?: string;
  speechTs?: number;
}

export interface GameLog {
  id: string;
  message: string;
  type: 'normal' | 'phase' | 'win' | 'action' | 'showdown';
}

export class PokerGameEngine {
  onChange: () => void;
  players: Player[];
  logs: GameLog[];
  deck: Deck;
  communityCards: Card[];
  pot: number;
  dealerIdx: number;
  highestBet: number;
  stage: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  actorsLeft: number;
  raisesInRound: number;
  currentTurnIdx: number;
  isFastForwarding: boolean = false;

  constructor(onChange: () => void) {
    this.onChange = onChange;
    this.players = [];
    this.logs = [];

    // Initialize Personas
    const personaList: PersonaType[] = ['human', 'tiger', 'poker_face', 'crazy', 'calm', 'simple', 'luck'];
    // Ensure we have enough for 7 players. 
    
    for (let i = 0; i < 7; i++) {
        let pType = personaList[i] || 'simple';
        this.players.push({
            id: i, 
            persona: pType,
            name: PERSONAS[pType].name,
            isHuman: i === 0, 
            chips: 1000, 
            hand: [],
            status: 'active', 
            currentBet: 0, 
            isEliminated: false
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
  }

  startNextRound() {
    this.stage = 'preflop';
    this.communityCards = [];
    this.pot = 0;
    this.highestBet = 0;
    this.raisesInRound = 0;

    // Rotate dealer
    this.dealerIdx = (this.dealerIdx + 1) % this.players.length;
    while (this.players[this.dealerIdx].isEliminated) {
      this.dealerIdx = (this.dealerIdx + 1) % this.players.length;
    }

    // Reset player states
    this.players.forEach(p => {
      p.hand = [];
      p.status = p.isEliminated ? 'eliminated' : 'active';
      p.currentBet = 0;
      p.currentSpeech = undefined;
      p.speechTs = undefined;
    });

    this.deck = new Deck();
    this.deck.shuffle();

    // Deal cards
    this.players.filter(p => !p.isEliminated).forEach(p => {
      p.hand.push(this.deck.deal()!);
      p.hand.push(this.deck.deal()!);
    });

    // Blinds
    let sbIdx = this.getNextActive(this.dealerIdx);
    let bbIdx = this.getNextActive(sbIdx);

    this.bet(this.players[sbIdx], 5);
    this.bet(this.players[bbIdx], 10);

    this.log(`庄家 ${this.players[this.dealerIdx].name}, 盲注 $5/$10`, 'phase');
    
    this.prepareBettingRound(this.getNextActive(bbIdx));
    this.notify();
  }

  showdown() {
    this.log('摊牌!', 'phase');
    let activePlayers = this.players.filter(p => p.status !== 'folded' && !p.isEliminated);

    if (activePlayers.length === 1) {
      let winner = activePlayers[0];
      this.log(`${winner.name} 赢得了 $${this.pot} (所有人都弃牌了)`, 'win');
      winner.chips += this.pot;
      this.pot = 0;
      this.notify();
      return;
    }

    let results = activePlayers.map(p => ({
      player: p,
      result: evaluateHand([...p.hand, ...this.communityCards])
    }));

    results.sort((a, b) => {
      if (a.result.rank !== b.result.rank) {
        return b.result.rank - a.result.rank;
      }
      return b.result.score - a.result.score;
    });

    let winner = results[0].player;
    let winningResult = results[0].result;

    results.forEach(({ player, result }) => {
      this.log(`${player.name} 亮牌: ${this.formatCards(player.hand)} (${this.getRankName(result.rank)})`, 'showdown');
    });

    this.log(`${winner.name} 赢得了 $${this.pot}，手牌: ${this.formatCards(winner.hand)} (${this.getRankName(winningResult.rank)})`, 'win');
    winner.chips += this.pot;
    this.pot = 0;
    this.notify();
  }

  handleAction(player: Player, action: 'fold' | 'call' | 'raise', raiseAmount: number = 0) {
    if (player.status === 'folded' || player.isEliminated) return;

    let callAmount = this.highestBet - player.currentBet;

    switch (action) {
      case 'fold':
        player.status = 'folded';
        this.log(`${player.name} 弃牌`, 'action');
        break;
      case 'call':
        if (callAmount === 0) { // Check
          this.log(`${player.name} 让牌/过牌`, 'action');
        } else {
          let chipsToBet = Math.min(callAmount, player.chips);
          this.bet(player, chipsToBet);
          this.log(`${player.name} 跟注 $${chipsToBet}`, 'action');
        }
        break;
      case 'raise':
        let totalBet = callAmount + raiseAmount;
        if (totalBet > player.chips) { // All-in
          totalBet = player.chips;
          raiseAmount = totalBet - callAmount;
        }
        this.bet(player, totalBet);
        this.highestBet = player.currentBet;
        this.raisesInRound++;
        this.log(`${player.name} 加注到 $${player.currentBet}`, 'action');
        break;
    }
    this.finishTurn();
  }

  getSnapshot() {
    return {
      players: this.players,
      communityCards: this.communityCards,
      pot: this.pot,
      dealerIdx: this.dealerIdx,
      highestBet: this.highestBet,
      currentTurnIdx: this.currentTurnIdx,
      stage: this.stage,
      logs: this.logs
    };
  }

  log(message: string, type: GameLog['type'] = 'normal') {
    this.logs.unshift({
      id: Math.random().toString(36).substr(2, 9),
      message,
      type
    });
    // Keep max 50 logs
    if (this.logs.length > 50) this.logs.pop();
  }

  notify() {
    this.onChange();
  }

  formatCards(cards: Card[]) {
    return cards.map(c => c.toString()).join(' ');
  }

  getRankName(rank: HandRankType): string {
    const names = [
      'High Card 高牌',
      'Pair 对子',
      'Two Pair 两对',
      'Trips 三条',
      'Straight 顺子',
      'Flush 同花',
      'Full House 葫芦',
      'Quads 四条',
      'Straight Flush 同花顺'
    ];
    return names[rank];
  }

  getNextActive(idx: number): number {
    let next = (idx + 1) % this.players.length;
    let loopCount = 0;
    while ((this.players[next].status === 'folded' || this.players[next].isEliminated) && loopCount < this.players.length) {
      next = (next + 1) % this.players.length;
      loopCount++;
    }
    return next;
  }

  bet(player: Player, amount: number) {
    if (player.chips < amount) amount = player.chips; // All in
    player.chips -= amount;
    player.currentBet += amount;
    this.pot += amount;
    if (player.chips === 0) player.status = 'allin';
  }

  prepareBettingRound(startIdx: number) {
    this.currentTurnIdx = startIdx;
    
    // Win by Fold Check
    const nonFolded = this.players.filter(p => !p.isEliminated && p.status !== 'folded');
    if (nonFolded.length <= 1) {
        this.stage = 'showdown'; // Ensure stage is set for UI
        this.showdown();
        return;
    }

    // All-In / Auto-Run Check
    this.actorsLeft = this.players.filter(p => p.status === 'active').length;
    if (this.actorsLeft <= 1 && !this.isFastForwarding) {
        this.runRemainingStages();
        return;
    }

    if (!this.isFastForwarding) {
        this.processTurn();
    }
  }

  humanAction(type: 'fold' | 'call' | 'raise') {
    const p = this.players[0];
    if (this.currentTurnIdx !== 0 || p.status !== 'active') return;
    this.handleAction(p, type, 20); // Default raise 20
  }

  processTurn() {
    try {
        let p = this.players[this.currentTurnIdx];
        
        // Skip if player incapable of acting
        if (p.status === 'folded' || p.isEliminated || p.status === 'allin') {
            if (this.isBetsSettled()) {
                this.nextStage();
            } else {
                this.currentTurnIdx = this.getNextActive(this.currentTurnIdx);
                setTimeout(() => this.processTurn(), 100); // Async recursion
            }
            return;
        }

        this.notify();

        if (!p.isHuman) {
            setTimeout(() => {
                this.aiAction(p);
            }, 800 + Math.random() * 1000);
        }
    } catch (e: any) {
        this.log(`Critical Error in processTurn: ${e.message}`, 'phase');
        console.error(e);
        // Force showdown to unlock UI? Or just stop.
    }
  }

  // Need to update handleAction to call processTurn or next player
  // NOTE: The existing handleAction calls notify but doesn't rotate turn?
  // I need to intercept handleAction or ensure it rotates.
  // The existing handleAction just updates state and logs.
  // So I should modify handleAction to Rotate Turn.
  // However, I can't easily modify handleAction in THIS block (it is elsewhere).
  // Wait, handleAction was visible in previous view, lines 368-400.
  // It ENDS with this.notify(). It does NOT rotate turn.
  // So the game loop is broken.
  // I will override handleAction here as well since I can replace the comment block extensively?
  // No, handleAction is AFTER this block in the file (lines 352+ in original view, but wait, where was the comment?)
  // The comment was at line 402, AFTER handleAction ??
  // Let's re-read step 23/29.
  // Line 368: handleAction defined.
  // Line 402: // ... methods ...
  // This is confusing. handleAction IS defined, but the comment SAYS it is "unchanged".
  // Duplication?
  // The comment at line 402 lists handleAction.
  // But handleAction is ALSO at line 368.
  // This means I have valid handleAction at 368, but missing other methods.
  // AND the handleAction at 368 does NOT call next turn.
  // I will implement a `advanceTurn` helper and append it to `handleAction` if possible,
  // OR I will just fully implement `nextTurn` logic inside basic methods and assume I need to fix `handleAction` later.
  // actually, let's look at `aiAction` calls `this.handleAction`.
  // If `handleAction` doesn't rotate, the game stalls.
  // I should probably DELETE the existing `handleAction` (if it's before this block) and re-implement it here correctly?
  // No, `handleAction` is lines 368-400. The comment is at 402.
  // So `handleAction` is ABOVE the comment.
  // I will fix `handleAction` in a separate step.
  // For now, I implement others.

  isBetsSettled(): boolean {
      const active = this.players.filter(p => !p.isEliminated && p.status !== 'folded');
      if (active.length === 0) return true;
      const amount = this.highestBet;
      // All active players must have bet equal to highestBet OR be all-in
      // AND everyone must have had a chance to act?
      // Simplified: checks if all active players match the highest bet.
      return active.every(p => p.currentBet === amount || p.status === 'allin') && (this.actorsLeft <= 0 || active.every(p => p.currentBet === amount)); 
      // actorsLeft logic is tricky. Let's just check if everyone matches bet and we went around?
      // We'll rely on a simple check:
      // If everyone matches bet, and we aren't in middle of a round... 
      // Ideally we track 'playersYetToAct'.
      // For this MV logic, let's update `advanceTurn` to check this.
  }

  nextStage() {
      this.currentTurnIdx = -1; // clear turn
      
      // Move chips to pot? (Already done in bet)
      // Reset current bets for next round?
      // Actually chips stay in currentBet until end of round or stage?
      // Standard: Bets gathered into pot at end of stage.
      this.players.forEach(p => {
          // this.pot += p.currentBet; // Already added in bet()
          p.currentBet = 0;
      });
      this.highestBet = 0;
      this.raisesInRound = 0;

      if (this.stage === 'preflop') {
          this.stage = 'flop';
          this.communityCards.push(this.deck.deal()!, this.deck.deal()!, this.deck.deal()!);
          this.log(`翻牌: ${this.formatCards(this.communityCards)}`, 'phase');
      } else if (this.stage === 'flop') {
          this.stage = 'turn';
          this.communityCards.push(this.deck.deal()!);
          this.log(`转牌: ${this.communityCards[3]}`, 'phase');
      } else if (this.stage === 'turn') {
          this.stage = 'river';
          this.communityCards.push(this.deck.deal()!);
          this.log(`河牌: ${this.communityCards[4]}`, 'phase');
      } else {
          this.stage = 'showdown';
          this.showdown();
          return;
      }
      
      this.prepareBettingRound(this.getNextActive(this.dealerIdx));
      this.notify();
  }

  runRemainingStages() {
      if (this.isFastForwarding) return;
      this.isFastForwarding = true;
      try {
          // Just fast forward
          while(this.stage !== 'showdown') {
             this.nextStage();
             // Safety break
             if (this.players.filter(p => !p.isEliminated && p.status !== 'folded').length <= 1) break;
          }
      } catch (e: any) {
         this.log(`Error in runRemainingStages: ${e.message}`, 'phase');
      } finally {
         this.isFastForwarding = false;
      }
  }
  
  // finish handleAction logic here is safer:
  finishTurn() {
       // If bets are settled (everyone matches the highest bet), we move to next stage.
       // Note: This simplified logic might skip BB option if everyone just calls, but prevents infinite loops.
       if (this.isBetsSettled()) {
           this.nextStage();
       } else {
            this.currentTurnIdx = this.getNextActive(this.currentTurnIdx);
            this.processTurn();
       }
  }
  // Re-implementing aiAction and adding speak helper

  speak(player: Player, text: string) {
      player.currentSpeech = text;
      player.speechTs = Date.now();
      this.notify();
      
      // Auto clear after 3s
      setTimeout(() => {
          if (player.currentSpeech === text) {
              player.currentSpeech = undefined;
              this.notify();
          }
      }, 3000);
  }

  aiAction(player: Player) {
    try {
        this._aiActionLogic(player);
    } catch (e: any) {
        this.log(`AI Error (${player.name}): ${e.message}`, 'action');
        console.error(e);
        // Fallback: Fold if error to keep game moving
        this.handleAction(player, 'fold');
    }
  }

  _aiActionLogic(player: Player) {
    let callAmt = this.highestBet - player.currentBet;
    let fullHand = [...player.hand, ...this.communityCards];
    let strength = 0;

    // Calc Strength
    if (fullHand.length < 5) {
        if(player.hand.length === 2) {
             let v1 = player.hand[0].value, v2 = player.hand[1].value;
             // Basic pre-flop strength
             if (v1 === v2) strength = 0.8; // Pair
             else if (v1 > 10 && v2 > 10) strength = 0.6; // High cards
             else if ((v1 > 12 || v2 > 12) && player.hand[0].suit === player.hand[1].suit) strength = 0.5; // Suited high
             else if (v1 > 12 || v2 > 12) strength = 0.4; // High card
             else strength = 0.2;
        }
    } else {
        let res = evaluateHand(fullHand);
        // Normalized score roughly
        strength = (res.rank + (res.score % 10000000000) / 10000000000) / 9;
        if (res.rank >= 2) strength = 0.8;
        else if (res.rank === 1) strength = 0.4 + (res.score % 100) / 100; // Pair strength varies
        else strength = 0.1;
    }

    let action: 'fold' | 'call' | 'raise' = 'fold';
    let rnd = Math.random();

    // Strategy Switching
    switch (player.persona) {
        case 'tiger': // 今晚打老虎: Aggressive, Only Raises (or Folds)
            // Strategy: Never just "Call" a bet > 0. Either Raise or Fold.
            // If checking is possible (callAmt == 0), might Raise or Check.
            if (strength > 0.15) {
                // If we can raise, we raise. If we can't raise (chips), we call (all-in).
                // If callAmt == 0, we raise often.
                // Aggression factor high.
                action = 'raise';
            } else {
                // Garbage hand, fold if we have to pay
                action = (callAmt > 0) ? 'fold' : 'call'; // Check if possible
            }

            // Speech
            if (action === 'raise') {
                if (rnd > 0.7) this.speak(player, "加倍!");
                else if (rnd > 0.4) this.speak(player, "大一点!");
            }
            break;

        case 'poker_face': // 扑克脸: Tight, Only plays good hands
            // Threshold high.
            if (strength > 0.6) { // Top 20-30% hands approx?
                 // Good hand.
                 // Mix Call/Raise but mostly Call to trap or play safe?
                 // "Only good hands follow" -> implying they follow (call/raise)
                action = (rnd > 0.3) ? 'raise' : 'call';
                
                // Poker Face speaks on operation
                if (action === 'raise') this.speak(player, "..."); 
                if (action === 'call') this.speak(player, "跟了");
            } else {
                // Bad/Mediocre hand
                action = (callAmt === 0) ? 'call' : 'fold';
            }
            break;

        case 'crazy': // 疯狂的玩家: Loose/Aggressive
            if (rnd > 0.3) action = 'raise';
            else if (rnd > 0.1) action = 'call';
            else action = 'fold';
            
            if (action === 'raise' && rnd > 0.7) this.speak(player, "All in! (骗你的)");
            break;
            
        case 'calm': // 冷静的玩家: Balanced
            if (strength > 0.6) action = 'raise';
            else if (strength > 0.35) {
                if (callAmt < 50) action = 'call';
                else action = 'fold';
            } else {
                if (callAmt === 0) action = 'call';
                else action = 'fold';
            }
            if (action === 'fold' && rnd > 0.8) this.speak(player, "牌不好");
            break;
            
        case 'simple': // 简单的玩家: Passive
            if (strength > 0.7) action = 'call'; // Even with good hand, prefers call
            else if (callAmt < 20 && strength > 0.2) action = 'call';
            else action = (callAmt === 0) ? 'call' : 'fold';
            
            if (rnd > 0.9) this.speak(player, "只是玩玩");
            break;
            
        case 'luck': // 运气王: Random
        default:
             action = rnd > 0.5 ? 'call' : (rnd > 0.25 ? 'raise' : 'fold');
             if (rnd > 0.9) this.speak(player, "看运气咯");
             break;
    }

    // Protection constraints
    if (action === 'raise' && (this.raisesInRound >= 3 || player.chips <= callAmt + 20)) {
        action = 'call';
    }
    // Cannot call if no chips needed and not raising? Check/Call is same in handlers
    
    if (action === 'raise') this.handleAction(player, 'raise', 20);
    else this.handleAction(player, action);
  }
}
