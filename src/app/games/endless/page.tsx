"use client";

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePageTitle } from '@/hooks/use-page-title';

interface BattleLog {
  id: number;
  level: number;
  message: string;
  success: boolean;
  enemyName: string;
  description?: string;
}

export default function EndlessPage() {
  usePageTitle('无尽之战');

  const [level, setLevel] = useState(1);
  const [battleLogs, setBattleLogs] = useState<BattleLog[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isBattling, setIsBattling] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const logIdCounter = useRef(0);

  // Start battle
  const startBattle = async () => {
    if (isBattling || isGameOver) return;

    setIsBattling(true);

    try {
      // Get battle scene from server
      const response = await fetch('/api/endless');
      const result = await response.json();

      // Calculate win rate based on current level
      const winRate = getWinRate(level);
      const random = Math.random();
      const success = random < winRate / 100;

      // Build battle message
      const message = success
        ? `${result.successMessage} ${result.enemyName}!`
        : `${result.failMessage} Lost against Lv.${level} ${result.enemyName}`;

      // Add battle log (newest at top)
      const newLog: BattleLog = {
        id: logIdCounter.current++,
        level: level,
        message: message,
        success: success,
        enemyName: result.enemyName,
        description: result.description,
      };

      setBattleLogs(prev => [newLog, ...prev]);

      if (success) {
        // Battle success, level up
        setLevel(prev => Math.min(prev + 1, 100));
      } else {
        // Battle failure, game over
        setIsGameOver(true);
      }
    } catch (error) {
      console.error('Battle request failed:', error);
      setBattleLogs(prev => [
        {
          id: logIdCounter.current++,
          level,
          message: 'Battle system error, please retry',
          success: false,
          enemyName: 'Unknown Enemy',
        },
        ...prev
      ]);
    } finally {
      setIsBattling(false);
    }
  };

  // Reset game
  const resetGame = () => {
    setLevel(1);
    setBattleLogs([]);
    setIsGameOver(false);
    logIdCounter.current = 0;
  };

  // Calculate win rate
  const getWinRate = (lvl: number): number => {
    if (lvl <= 10) return 95;
    if (lvl <= 30) return 85;
    if (lvl <= 50) return 70;
    if (lvl <= 70) return 55;
    if (lvl <= 90) return 35;
    return 15;
  };

  const currentWinRate = getWinRate(level);

  return (
    <div className="relative w-full min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        {/* Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            无尽之战
          </h2>
        </motion.div>

        {/* Game Status Panel */}
        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-white/60 text-sm mb-1">Current Level</div>
              <div className="text-2xl font-bold text-white">
                Lv.{level}
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/60 text-sm mb-1">Win Rate</div>
              <div className="text-2xl font-bold text-yellow-400">
                {currentWinRate}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/60 text-sm mb-1">Battles</div>
              <div className="text-2xl font-bold text-blue-400">
                {battleLogs.length}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-white/60 mb-2">
              <span>Progress</span>
              <span>{level}/100</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${level}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Battle Button */}
        <motion.div
          className="flex justify-center gap-4 mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <button
            onClick={startBattle}
            disabled={isBattling || isGameOver || level >= 100}
            className={`
              px-8 py-3 rounded-xl font-semibold text-lg
              transition-all duration-300 transform
              ${isBattling || isGameOver || level >= 100
                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-red-500/50'
              }
            `}
          >
            {isBattling ? 'Fighting...' : isGameOver ? 'Game Over' : level >= 100 ? 'Max Level' : '⚔️ Start Battle'}
          </button>

          {(isGameOver || level >= 100) && (
            <motion.button
              onClick={resetGame}
              className="px-8 py-3 rounded-xl font-semibold text-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              🔄 Restart
            </motion.button>
          )}
        </motion.div>

        {/* Battle Log */}
        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">Battle Log</h2>

          <div
            ref={logContainerRef}
            className="space-y-2 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
          >
            <AnimatePresence initial={false}>
              {battleLogs.length === 0 ? (
                <div className="text-center text-white/40 py-8">
                  Click &quot;Start Battle&quot; to begin your adventure
                </div>
              ) : (
                battleLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className={`
                      p-3 rounded-lg border
                      ${log.success
                        ? 'bg-green-500/10 border-green-500/30 text-green-300'
                        : 'bg-red-500/10 border-red-500/30 text-red-300'
                      }
                    `}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <div className="text-xs opacity-60 mb-1">
                          Lv.{log.level} - {log.enemyName}
                        </div>
                        {log.description && (
                          <div className="text-xs opacity-50 mb-1 italic">
                            {log.description}
                          </div>
                        )}
                        <div className="text-sm">
                          {log.message}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
