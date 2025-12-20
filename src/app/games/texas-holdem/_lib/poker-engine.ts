

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
  bestHand: Card[];
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

  if (straightFlushCards) return { rank: HandRankType.STRAIGHT_FLUSH, score: calcScore(8, straightFlushCards), winningCards: straightFlushCards, bestHand: straightFlushCards };

  let quadsValStr = Object.keys(rankCounts).find(r => rankCounts[parseInt(r)] === 4);
  if (quadsValStr) {
    let quadsVal = parseInt(quadsValStr);
    let quads = sorted.filter(c => c.value === quadsVal);
    let kicker = sorted.find(c => c.value !== quadsVal);
    let best5 = [...quads, ...(kicker ? [kicker] : [])];
    return { rank: HandRankType.QUADS, score: calcScore(7, best5), winningCards: quads, bestHand: best5 };
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
      return { rank: HandRankType.FULL_HOUSE, score: calcScore(6, best5), winningCards: best5, bestHand: best5 };
    }
  }

  if (flushCards.length >= 5) {
    let best5 = flushCards.slice(0, 5);
    return { rank: HandRankType.FLUSH, score: calcScore(5, best5), winningCards: best5, bestHand: best5 };
  }

  if (straightCards) return { rank: HandRankType.STRAIGHT, score: calcScore(4, straightCards), winningCards: straightCards, bestHand: straightCards };

  if (tripsVals.length > 0) {
    let tVal = tripsVals[0];
    let trips = sorted.filter(c => c.value === tVal);
    let kickers = sorted.filter(c => c.value !== tVal).slice(0, 2);
    let best5 = [...trips, ...kickers];
    return { rank: HandRankType.TRIPS, score: calcScore(3, best5), winningCards: trips, bestHand: best5 };
  }

  if (pairVals.length >= 2) {
    let p1 = pairVals[0], p2 = pairVals[1];
    let pair1 = sorted.filter(c => c.value === p1);
    let pair2 = sorted.filter(c => c.value === p2);
    let kicker = sorted.find(c => c.value !== p1 && c.value !== p2);
    let best5 = [...pair1, ...pair2, ...(kicker ? [kicker] : [])];
    return { rank: HandRankType.TWO_PAIR, score: calcScore(2, best5), winningCards: [...pair1, ...pair2], bestHand: best5 };
  }

  if (pairVals.length === 1) {
    let p1 = pairVals[0];
    let pair = sorted.filter(c => c.value === p1);
    let kickers = sorted.filter(c => c.value !== p1).slice(0, 3);
    let best5 = [...pair, ...kickers];
    return { rank: HandRankType.PAIR, score: calcScore(1, best5), winningCards: pair, bestHand: best5 };
  }

  let best5 = sorted.slice(0, 5);
  return { rank: HandRankType.HIGH_CARD, score: calcScore(0, best5), winningCards: [best5[0]], bestHand: best5 };
}

// ... (previous code unchanged, we only replace the relevant parts)

// Bot Names Pool
const BOT_NAMES = [
  'Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Jamie', 
  'Quinn', 'Avery', 'Parker', 'Reese', 'Blake', 'Charlie', 'Dakota', 'River',
  'Phoenix', 'Sage', 'Sky', 'Sidney', 'Maverick', 'Ace', 'Lucky', 'Chip'
];

export type PersonaType = 'human' | 'bot';

export const SPEECH_LINES: Record<'bot', {
  raise: string[];
  call: string[];
  fold: string[];
  check: string[];
  allin: string[];
  bluff_act: string[];
  bluff_win: string[];
  bluff_fail: string[];
}> = {
  bot: {
     raise: [
       "加注!", "这就怕了?", "再来点刺激的!", "这才刚开始!", "这点钱不够看!", 
       "我看你有多少筹码!", "全压了! 哈哈!", "这就对了!", "Show hand!", 
       "必须加!", "来啊互相伤害啊!", "我就是钱多!", "这牌值得加注.", 
       "目前的赔率不错.", "稍微加一点.", "不得不加.", "根据概率...", 
       "今天运气不错!", "感觉来了!", "幸运女神眷顾我!", "这把稳了!", "一定是好牌!"
     ],
     call: [
       "看看你的底牌.", "别想偷鸡.", "跟!", "我也来.", "这点钱我跟得起.", 
       "陪你玩玩.", "我也来凑热闹!", "这把我有预感!", "谁怕谁啊!", "跟跟跟!", 
       "好像有好牌!", "我看一看.", "这注跟得起.", "保持跟进.", "还在很多范围内.", 
       "合理.", "那就跟吧.", "多少钱?", "我也玩玩.", "别太贵就行.", "跟你看一看.", 
       "拼一把运气!", "听天由命吧!", "试试手气.", "希望能中!", "保佑我!"
     ],
     fold: [
       "算你运气好.", "这把放过你.", "暂避锋芒.", "不跟了.", "好汉不吃眼前亏.", 
       "没意思.", "这牌有鬼.", "晦气!", "不玩了.", "把把烂牌!", "与其冒险不如放弃.", 
       "这局胜率不高.", "我退出.", "冷静...", "等待时机.", "太大了不跟.", 
       "我不行了.", "这牌太烂了.", "算了.", "有点怕.", "运气不好.", 
       "风水不对.", "下把再来.", "今天不宜赌博.", "没感觉."
     ],
     check: [
       "这把我不加.", "过.", "看看下面什么牌.", "你先请.", "快点快点!", 
       "过过过!", "别墨迹!", "快出牌!", "先看看.", "过牌.", "暂且不动.", 
       "观察一下.", "不用给钱? 那我过.", "怎么玩来着? 哦过.", "那我看一眼.", 
       "看看运气.", "转运!", "天灵灵地灵灵.", "发张A给我!"
     ],
     allin: [
       "Show hand!", "全压了!", "这就让你回家!", "要么赢，要么回家!", 
       "梭哈!", "赢了会所嫩模!", "输了下海干活!", "这把定生死!", 
       "经过计算，全压是最佳策略.", "胜率很高.", "这是最合理的选择.", 
       "All in 是什么意思?", "全都给你!", "不管了!", "反正也是虚拟币.", 
       "赌神附体!", "一波肥!", "单车变摩托!", "就在这一把!"
     ],
     bluff_act: [
       "看这次谁怕谁!", "感觉到了恐惧吗?", "你真的敢跟吗?", "不加注怎么赢?", 
       "这把底牌绝了!", "猜猜我有什么牌?", "别犹豫了，弃牌吧."
     ],
     bluff_win: [ // Won with bluff (by fold) or showdown
       "哈哈，被我骗到了吧!", "其实我什么都没有!", "全靠演技!", "偷鸡成功!", 
       "承让承让.", "有时候运气也是实力.", "下次别这么胆小."
     ],
     bluff_fail: [ // Lost with bluff
       "这就很尴尬了.", "被看穿了?", "也是拼了.", "哎呀，演砸了.", 
       "你是怎么知道的?", "好抓!", "不该偷鸡的."
     ]
  }
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
  totalHandBet: number;
  hasActed: boolean;
  isBluffing?: boolean; // Track if current strategy is bluffing
  handDescription?: string; // e.g. "Two Pair" for display in Showdown
}

export interface GameLog {
  id: string;
  message: string;
  type: 'normal' | 'phase' | 'win' | 'action' | 'showdown';
}

export class PokerGameEngine {
  onChange: (snapshot: ReturnType<PokerGameEngine['getSnapshot']>) => void;
  players: Player[];
  logs: GameLog[];
  deck!: Deck;
  communityCards!: Card[];
  pot!: number;
  dealerIdx!: number;
  highestBet!: number;
  stage!: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  actorsLeft!: number;
  raisesInRound!: number;
  currentTurnIdx!: number;
  isFastForwarding: boolean = false;
  winners: number[] = [];
  winningCards: Card[] = [];
  lastRaiseAmount: number = 0;
  bigBlind: number = 10;

  constructor(onChange: (snapshot: ReturnType<PokerGameEngine['getSnapshot']>) => void) {
    this.onChange = onChange;
    this.players = [];
    this.logs = [];

    this.resetGame();
  }

  resetGame() {
    this.players = [];
    this.logs = [];
    
    // Initialize Random Expert Players
    const shuffledNames = [...BOT_NAMES].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < 7; i++) {
        let isHuman = i === 0;
        this.players.push({
            id: i, 
            persona: isHuman ? 'human' : 'bot',
            name: isHuman ? 'You' : shuffledNames[i - 1],
            isHuman: isHuman, 
            chips: 1000, 
            hand: [],
            status: 'active', 
            currentBet: 0, 
            isEliminated: false,
            totalHandBet: 0,
            hasActed: false
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
    this.winners = [];
    this.winningCards = [];
    
    this.notify();
    this.startNextRound();
  }

  startNextRound() {
    this.stage = 'preflop';
    this.communityCards = [];
    this.pot = 0;
    this.highestBet = 0;
    this.raisesInRound = 0;
    this.lastRaiseAmount = this.bigBlind; // Base raise delta is BB
    this.winners = [];
    this.logs = []; // Clear logs for new round
    this.winningCards = [];

    // Eliminate players with no chips
    this.players.forEach(p => {
      if (p.chips <= 0) {
        p.isEliminated = true;
        p.status = 'eliminated'; 
        p.chips = 0; // Ensure no negative
      }
    });

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
      p.currentBet = 0;
      p.totalHandBet = 0;
      p.hasActed = false;
      p.currentSpeech = undefined;
      p.speechTs = undefined;
      p.isBluffing = false;
      p.handDescription = undefined;
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
    
    // Heads-Up Rule Fix: In 2-player games, Dealer is Small Blind
    const activePlayers = this.players.filter(p => !p.isEliminated);
    if (activePlayers.length === 2) {
        sbIdx = this.dealerIdx;
    }

    let bbIdx = this.getNextActive(sbIdx);

    this.bet(this.players[sbIdx], 5);
    this.bet(this.players[bbIdx], 10);

    this.log(`庄家 ${this.players[this.dealerIdx].name}, 盲注 $5/$10`, 'phase');
    
    this.prepareBettingRound(this.getNextActive(bbIdx));
    this.notify();
  }

  showdown() {
    this.log('摊牌!', 'phase');
    let activePlayers = this.players.filter(p => !p.isEliminated && p.status !== 'folded');
    let foldedPlayers = this.players.filter(p => !p.isEliminated && p.status === 'folded');

    // If only one player stands (others folded)
    // Note: This block is usually handled before calling showdown in 'prepareBettingRound', 
    // but as a fallback:
    if (activePlayers.length === 1) {
       let winner = activePlayers[0];
       
       // Evaluate hand to show description (Gold Text) even if won by fold
       try {
           let result = evaluateHand([...winner.hand, ...this.communityCards]);
           let info = this.getRankName(result.rank);
           winner.handDescription = info;
           this.winningCards = result.winningCards;
       } catch (e) {
           // Fallback if evaluation fails (e.g. too few cards??)
           console.error("Eval Error in Fold Win", e);
       }

       // Winner takes entire pot
       winner.chips += this.pot;
       this.log(`${winner.name} 赢得了 $${this.pot} (其他玩家弃牌)`, 'win');
       this.winners = [winner.id];
       this.pot = 0;
       this.notify();
       return;
    }

    // Evaluate Hands
    let results = activePlayers.map(p => ({
      player: p,
      result: evaluateHand([...p.hand, ...this.communityCards])
    }));

    // Show cards & Set Description
    results.forEach(({ player, result }) => {
         let info = this.getRankName(result.rank);
         player.handDescription = info;
         this.log(`${player.name} 亮牌: ${this.formatCards(player.hand)} (${info})`, 'showdown');
    });

    // --- Side Pot & Split Pot Logic ---
    
    // 1. Calculate Contributions
    // We consider all players who put money in (active + folded)
    let allContributors = [...activePlayers, ...foldedPlayers];
    let contributions = allContributors.map(p => ({ id: p.id, amount: p.totalHandBet }));
    
    // 2. Identify unique bet levels (sorted asc)
    let betLevels = Array.from(new Set(contributions.map(c => c.amount).filter(a => a > 0))).sort((a, b) => a - b);
    
    let currentPotIdx = 0;
    this.winners = [];
    this.winningCards = [];
    
    let processedBet = 0;

    for (let level of betLevels) {
        let step = level - processedBet;
        if (step <= 0) continue;
        
        // Calculate pot at this level
        // Everyone who bet at least 'level' contributes 'step'
        let contributorsAtLevel = contributions.filter(c => c.amount >= level);
        let potAmount = contributorsAtLevel.length * step;
        
        // Eligible winners: Active players who bet at least 'level'
        let eligiblePlayerIds = activePlayers
            .filter(p => p.totalHandBet >= level)
            .map(p => p.id);

        if (eligiblePlayerIds.length > 0) {
             // Find winner(s) among eligible
             let eligibleResults = results.filter(r => eligiblePlayerIds.includes(r.player.id));
             
             // Sort to find best score
             eligibleResults.sort((a, b) => {
                if (a.result.rank !== b.result.rank) return b.result.rank - a.result.rank;
                return b.result.score - a.result.score;
             });
             
             let bestRes = eligibleResults[0];
             let winners = eligibleResults.filter(r => 
                 r.result.rank === bestRes.result.rank && 
                 Math.abs(r.result.score - bestRes.result.score) < 0.001
             );
             
             // Split pot
             let share = Math.floor(potAmount / winners.length);
             let remainder = potAmount % winners.length;
             
             winners.forEach((w, idx) => {
                 let winAmt = share + (idx < remainder ? 1 : 0);
                 w.player.chips += winAmt;
                 
                 // Track main winners for UI (purely visual: use the highest pot winners)
                 // Or just accumulate all?
                  if (!this.winners.includes(w.player.id)) {
                      // Only mark as winner if it was a contested pot OR if everyone else folded
                      // If eligiblePlayerIds.length === 1 && activePlayers.length > 1, it implies this player 
                      // is just getting their unmatched Money back (surplus), while losing/not-competing in main pot.
                      const isUncontestedRefund = eligiblePlayerIds.length === 1 && activePlayers.length > 1;
                      if (!isUncontestedRefund) {
                         this.winners.push(w.player.id);
                      }
                  }
                 // Track winning cards of the BEST hand found so far (usually main pot)
                 if (this.winningCards.length === 0) {
                     this.winningCards = w.result.winningCards;
                 }
                 
                 this.log(`${w.player.name} 赢得 ${winAmt} (Pot Lv ${currentPotIdx+1})`, 'win');
                 
                 // Bluff Succcess Speech
                 if (w.player.isBluffing && w.player.totalHandBet > 100 && !w.player.isHuman) {
                     this.speakRandom(w.player, 'bluff_win');
                 }
                 // If not bluffing but won a big pot? Maybe normal happy speech? (Already generic)
             });
             
             // Bluff Fail Speech for active losers
             eligiblePlayerIds.forEach(pid => {
                 const pl = this.players.find(p => p.id === pid);
                 if (pl && !winners.some(w => w.player.id === pid)) {
                     // Loser
                     if (pl.isBluffing && !pl.isHuman) {
                         this.speakRandom(pl, 'bluff_fail');
                     }
                 }
             });
        } else {
            // No eligible active players? (Should not happen if pots are correct)
            // Money goes to... house? Or returned to last contributor?
            // If everyone folded, we wouldn't be here.
            // If active players are All-in for LESS than this level?
            // Meaning Side Pot is created by 2 folds??
            // Actually, if active players bet less than this level, they are not eligible.
            // But 'contributorsAtLevel' has folks.
            // Example: A bets 1000 (Fold), B bets 100 (Allin).
            // Level 100: A and B contrib. Eligible: B. B wins.
            // Level 1000: A contribs (900 more). Eligible: None.
            // This 900 should be returned to A? But A folded.
            // Standard rule: If you fold, you forfeit.
            // If NO active player is eligible for this side pot?
            // It goes to the active player who lasted longest? 
            // Or technically, if checks folded, the pot should have been awarded already.
            // In Showdown, at least 2 active players OR 1 active + side pots?
            // Actually, `activePlayers` only includes non-folded.
            // If I bet 1000 and everyone else folds, I win immediately.
            // If I bet 1000, B call 100 (AI). 
            // Pot 1: 200. Eligible A, B.
            // Pot 2: 900. Eligible A.
            // A wins Pot 2 automatically.
             
             // So if eligiblePlayerIds includes A (active), A wins.
             // So this block handles it.
        }
        
        processedBet = level;
        currentPotIdx++;
    }

    this.pot = 0; // Cleared
    this.notify();
  }

  handleAction(player: Player, action: 'fold' | 'call' | 'raise' | 'allin', raiseAmount: number = 0) {
    if (player.status === 'folded' || player.isEliminated || player.status === 'allin') return;

    let callAmount = this.highestBet - player.currentBet;

    switch (action) {
      case 'fold':
        player.status = 'folded';
        this.log(`${player.name} 弃牌`, 'action');
        break;
      case 'call':
        if (callAmount === 0) { // Check
          this.log(`${player.name} 让牌/过牌`, 'action');
          player.hasActed = true;
        } else {
          // Check if call puts player all-in
          let chipsToBet = Math.min(callAmount, player.chips);
          this.bet(player, chipsToBet);
          
          if (player.chips === 0) {
             this.log(`${player.name} All In (跟注) $${chipsToBet}`, 'action');
          } else {
             this.log(`${player.name} 跟注 $${chipsToBet}`, 'action');
          }
          player.hasActed = true;
        }
        break;
      case 'raise':
        // RULE FIX: Minimum raise must be at least the size of the previous raise (or BB)
        // Ensure raiseAmount is valid.
        // User UI sends fixed 20 sometimes, but we should validate.
        const minRaise = Math.max(this.bigBlind, this.lastRaiseAmount);
        
        // If player tries to raise less than min (but has chips), force min? 
        // Or if UI sends just "Raise", we default to Min Raise?
        if (raiseAmount < minRaise) raiseAmount = minRaise;

        let totalBet = callAmount + raiseAmount;
        
        if (totalBet >= player.chips) { // Treat as All-in
          this.handleAction(player, 'allin'); 
          return;
        }

        this.bet(player, totalBet);

        // Update Raise Delta
        // New Highest = player.currentBet.
        // Delta = New Highest - Old Highest.
        // Wait, raising *by* raiseAmount means `currentBet` increases by `callAmount + raiseAmount`.
        // So `currentBet` becomes `highestBet + raiseAmount`.
        // The *increase* in `highestBet` is `raiseAmount`.
        this.lastRaiseAmount = raiseAmount; 
        
        this.highestBet = player.currentBet;
        this.raisesInRound++;
        this.log(`${player.name} 加注到 $${player.currentBet}`, 'action');
        player.hasActed = true;
        break;
      case 'allin':
        let allInAmt = player.chips;
        this.bet(player, allInAmt);
        
        // If this raise increases the highest bet
        if (player.currentBet > this.highestBet) {
             this.highestBet = player.currentBet;
             this.raisesInRound++;
             this.log(`${player.name} All In! ($${player.currentBet})`, 'action');
        } else {
             // Short stack all-in (less than current raise)
             // This does NOT reopen betting for others usually, but simplified here.
             this.log(`${player.name} All In (短码) $${player.currentBet}`, 'action');
        }
        player.hasActed = true;
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
      logs: this.logs,
      winners: this.winners,
      winningCards: this.winningCards
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
    this.onChange(this.getSnapshot());
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
    player.totalHandBet += amount;
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

  humanAction(type: 'fold' | 'call' | 'raise' | 'allin') {
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
      // All active players must have bet equal to highestBet OR be all-in
      // AND everyone must have acted in this round.
      return active.every(p => {
          if (p.status === 'allin') return true; 
          return p.currentBet === amount && p.hasActed;
      });  
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
          // this.pot += p.currentBet; // Already added in bet()
          p.currentBet = 0;
          p.hasActed = false;
      });
      this.highestBet = 0;
      this.raisesInRound = 0;
      this.lastRaiseAmount = this.bigBlind; // Reset min raise for new street

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

  _getHandStrength(player: Player): number {
      // 0.0 to 1.0 (Approximate equity)
      const hole = player.hand;
      if (hole.length < 2) return 0;
      
      const community = this.communityCards;
      const fullHand = [...hole, ...community];
      
      // Pre-flop Heuristics
      if (community.length === 0) {
          const v1 = hole[0].value;
          const v2 = hole[1].value;
          const suited = hole[0].suit === hole[1].suit;
          const pair = v1 === v2;
          const highVal = Math.max(v1, v2);
          const lowVal = Math.min(v1, v2);
          const gap = highVal - lowVal;
          
          let score = 0;
          if (pair) score = highVal * 2.5; // Pairs are strong
          else score = highVal + (lowVal / 2); // High cards
          
          if (suited) score += 4;
          if (gap === 1) score += 2; // Connectors
          else if (gap === 2) score += 1;
          
          // Max score approx 35 (AA) -> 1.0
          // Min score approx 3 (72o) -> 0.1
          // Normalize roughly
          return Math.min(score / 30, 1.0);
      }
      
      // Post-flop: Hand Rank + Outs approximation
      const res = evaluateHand(fullHand);
      let strength = 0;
      
      // Base strength on Rank
      // Rank 0 (High) -> 0.1
      // Rank 1 (Pair) -> 0.3 - 0.5
      // Rank 2 (TwoPair) -> 0.6
      // Rank 3 (Trips) -> 0.75
      // Rank 4+ (Str/Flush) -> 0.9+
      
      switch(res.rank) {
          case HandRankType.HIGH_CARD: strength = 0.1; break;
          case HandRankType.PAIR: strength = 0.35 + (res.score % 15 / 100); break; // Higher pair better
          case HandRankType.TWO_PAIR: strength = 0.6; break;
          case HandRankType.TRIPS: strength = 0.75; break;
          case HandRankType.STRAIGHT: strength = 0.85; break;
          case HandRankType.FLUSH: strength = 0.9; break;
          case HandRankType.FULL_HOUSE: strength = 0.95; break;
          case HandRankType.QUADS: strength = 0.99; break;
          case HandRankType.STRAIGHT_FLUSH: strength = 1.0; break;
      }
      
      return strength;
  }

  _aiActionLogic(player: Player) {
    let callAmt = this.highestBet - player.currentBet;
    let strength = this._getHandStrength(player);
    let potOdds = callAmt > 0 ? callAmt / (this.pot + callAmt) : 0;
    
    // Position/Strategy Factors
    let action: 'fold' | 'call' | 'raise' | 'allin' = 'fold';
    let rnd = Math.random();
    
    // Expert Logic
    // Fear Factor: If raises are high, be more conservative unless holding nuts
    if (this.raisesInRound >= 3 && strength < 0.8) {
        strength -= 0.15; // Penalty for fear
    }
    
    // Adjust Strength Threshold based on Round
    let foldThresh = 0.2;
    let raiseThresh = 0.7;
    let allInThresh = 0.92; // Very high threshold for value All-in
    
    if (this.stage === 'preflop') {
        foldThresh = 0.35; // Tighter preflop
        if (callAmt <= 20) foldThresh = 0.2; // Limp if cheap
        allInThresh = 0.96; // Only AA/KK typically
    }
    
    // --- 1. Decision Logic ---
    
    const bluffChance = 0.15; 
    const isBluff = (rnd < bluffChance && strength < 0.4 && this.raisesInRound < 2); 
    
    if (isBluff) {
         player.isBluffing = true;
         // Bluff Strategy
         // 10% of bluffs are All-In bluffs (Steal)
         if (rnd < 0.015) { // 1.5% total chance (10% of 15%)
             action = 'allin';
         } else {
             action = 'raise';
         }
    } else {
        // Value / Standard Logic
        player.isBluffing = false;
        
        // Check for All-In Strength
        if (strength > allInThresh) {
            // Monster hand.
            // 40% chance to shove immediately, 60% chance to raise/trap
            if (rnd < 0.4) action = 'allin';
            else action = 'raise';
        } else if (strength > raiseThresh) {
            // Strong hand -> Value Bet / Raise
            if (rnd > 0.2) action = 'raise'; // 80% raise
            else action = 'call'; // 20% trap
        } else if (strength > foldThresh) {
            // Marginal/Decent
            if (callAmt === 0) {
                 action = (rnd > 0.7) ? 'raise' : 'call'; 
            } else {
                 // Facing a bet
                 // If facing All-In (large bet relative to stack)
                 const isLifeOrDeath = callAmt > player.chips * 0.6;
                 
                 if (isLifeOrDeath) {
                     // Only call if decent strength or great odds
                     if (strength > 0.6 || strength > potOdds + 0.1) action = 'call';
                     else action = 'fold';
                 } else {
                     // Standard call logic
                     if (strength > potOdds + 0.05) action = 'call';
                     else if (rnd > 0.9) action = 'raise'; // Occasional semi-bluff
                     else action = 'fold';
                 }
            }
        } else {
            // Weak Hand
            if (callAmt === 0) action = (rnd > 0.8) ? 'raise' : 'call'; 
            else action = 'fold';
        }
    }

    // --- 2. Sanity Checks & Overrides ---

    // Don't raise if already capped or facing huge aggression with weak hand
    if (action === 'raise') {
         if (this.raisesInRound >= 4 || player.chips <= callAmt + 20) {
            // If basically no chips left to raise, just call or all-in?
            // If we really like the hand, All in.
            if (strength > 0.8) action = 'allin';
            else action = 'call';
         }
    }
    
    // If we decided to 'call' but we don't have enough chips, it becomes a forced All-In (Call)
    if (action === 'call' && callAmt >= player.chips) {
        // Valid, handled by handleAction('call') which bets max chips
    }

    // Execute Action
    let isCheck = (action === 'call' && callAmt === 0);
    
    if (action === 'raise') this.handleAction(player, 'raise', 20); 
    else this.handleAction(player, action);
    
    // --- 3. Speech ---
    const speakChance = 0.5; 
    
    // Determine speech type
    let speechType: keyof typeof SPEECH_LINES['bot'] = 'call';
    if (action === 'allin') speechType = 'allin';
    else if (player.status === 'folded') speechType = 'fold';
    else if (action === 'raise') speechType = 'raise';
    else if (isCheck) speechType = 'check';

    // Priority Speech
    if (player.isBluffing && (action === 'raise' || action === 'allin')) {
        this.speakRandom(player, 'bluff_act');
    } else if (action === 'allin') {
        this.speakRandom(player, 'allin'); // Always speak on All In
    } else if (Math.random() < speakChance) {
        this.speakRandom(player, speechType);
    }
  }
  
  // Helper for random speech
  speakRandom(player: Player, type: keyof typeof SPEECH_LINES['bot']) {
      const lines = SPEECH_LINES['bot'][type];
        if (lines && lines.length > 0) {
            const text = lines[Math.floor(Math.random() * lines.length)];
            this.speak(player, text);
        }
  }
}
