
import { PokerGameEngine } from './poker-engine';

// Stress Test Configuration
const TEST_ROUNDS = 100;
const MAX_ACTIONS_PER_ROUND = 200; // Prevent infinite loops

function runStressTest() {
    console.log(`Starting Texas Hold'em Stress Test (${TEST_ROUNDS} rounds)...`);
    
    let roundsCompleted = 0;
    let errorsFound = 0;
    let roundActions = 0;
    
    const engine = new PokerGameEngine((snapshot) => {
        // We can inspect snapshot if needed, but main logic is driven below
    });
    
    engine.testMode = true; // Enable zero-delay mode
    engine.startNextRound(); // Start first round
    
    // Main Loop
    // Since the engine is event-driven (via timeouts even if 0ms), 
    // we need to keep the process alive and react to state changes.
    // However, with 0ms timeouts, we can try to drive it in a tight loop 
    // by hooking into the state changes or just polling.
    // Given JS single-threaded nature, 0ms timeout puts tasks on the next tick.
    // We need to wait for the event loop.
    
    const maxTime = Date.now() + 60000; // 60s timeout for whole test
    
    function checkState() {
        if (Date.now() > maxTime) {
            console.error("Test Timed Out!");
            process.exit(1);
        }

        // Check for round completion
        if (engine.stage === 'showdown') {
            roundsCompleted++;
            console.log(`[Round ${roundsCompleted}] Completed. Winner(s): ${engine.winners.join(', ')}`);
            
            // Assertions
            if (engine.winners.length === 0) {
                 console.error(`[ERROR] Round ${roundsCompleted} finished efficiently but NO WINNERS!`);
                 errorsFound++;
            }
            
            // Basic Pot Integrity (approximate, since we don't track rake/chips perfectly here)
            // Just ensure no negative chips
            engine.players.forEach(p => {
                if (p.chips < 0 || isNaN(p.chips)) {
                    console.error(`[ERROR] Player ${p.name} has invalid chips: ${p.chips}`);
                    errorsFound++;
                }
            });

            if (roundsCompleted >= TEST_ROUNDS) {
                console.log(`\n=== Test Summary ===`);
                console.log(`Rounds Completed: ${roundsCompleted}`);
                console.log(`Errors Found: ${errorsFound}`);
                process.exit(errorsFound > 0 ? 1 : 0);
            }
            
            // Start Next Round or Reset if Game Over
            roundActions = 0;
            const survivors = engine.players.filter(p => !p.isEliminated).length;
            
            setTimeout(() => {
                if (survivors <= 1) {
                    console.log(`[Game Over] Winner: ${engine.players.find(p => !p.isEliminated)?.name}. Restarting Game...`);
                    engine.resetGame();
                    // engine.startNextRound(); // resetGame does NOT auto start, so we must start it
                    engine.startNextRound();
                } else {
                    engine.startNextRound();
                }
                checkState();
            }, 0);
            return;
        }
        
        // Handle Human Turn (Auto-Play)
        const currentPlayer = engine.players[engine.currentTurnIdx];
        if ((engine.stage as string) !== 'showdown' && currentPlayer && currentPlayer.isHuman && currentPlayer.status === 'active') {
             // Random Action Logic
             roundActions++;
             if (roundActions > MAX_ACTIONS_PER_ROUND) {
                  console.error(`[ERROR] Round stuck? Too many actions.`);
                  // Force end round or restart
                  engine.startNextRound();
                  return;
             }
             
             const availableActions = ['fold', 'call', 'raise', 'allin'];
             // Bias towards calling/checking to let game proceed
             const rnd = Math.random();
             let action: 'fold' | 'call' | 'raise' | 'allin' = 'call';
             
             if (rnd < 0.1) action = 'fold';
             else if (rnd < 0.7) action = 'call';
             else if (rnd < 0.9) action = 'raise';
             else action = 'allin';

             // Validate raise
             if (action === 'raise') {
                const callAmt = engine.highestBet - currentPlayer.currentBet;
                if (currentPlayer.chips <= callAmt + 20) action = 'allin'; // Not enough to raise
             }
             
            //  console.log(`[Round ${roundsCompleted + 1}] Human ${action}`);
             try {
                engine.humanAction(action);
             } catch (e) {
                 console.error("Error executing human action", e);
             }
        }
        
        // Loop
        setTimeout(checkState, 5); // Fast poll
    }
    
    checkState();
}

runStressTest();
