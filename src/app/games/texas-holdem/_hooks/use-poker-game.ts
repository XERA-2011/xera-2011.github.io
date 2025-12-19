'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { PokerGameEngine } from '../_lib/poker-engine';

export function usePokerGame() {
  const engineRef = useRef<PokerGameEngine | null>(null);
  const [gameState, setGameState] = useState<ReturnType<PokerGameEngine['getSnapshot']> | null>(null);

  useEffect(() => {
    // Initialize engine only once
    const engine = new PokerGameEngine(() => {
        setGameState(engine.getSnapshot());
    });
    engineRef.current = engine;
    
    // Start first round
    setTimeout(() => {
        // Only start if not already started? 
        // Logic: if new game, start.
        engine.startNextRound();
    }, 100);

    return () => {
        // cleanup if needed (e.g. stop timers)
    };
  }, []);

  const humanAction = useCallback((type: 'fold' | 'call' | 'raise') => {
    if (engineRef.current) {
        engineRef.current.humanAction(type);
    }
  }, []);

  const startNextRound = useCallback(() => {
    if (engineRef.current) {
        engineRef.current.startNextRound();
    }
  }, []);

  return {
    gameState,
    humanAction,
    startNextRound
  };
}
