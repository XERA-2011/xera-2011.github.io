import { useEffect, useRef } from 'react';
import { GameLog as GameLogType } from '../_lib/poker-engine';

interface LogProps {
  logs: GameLogType[];
}

export function GameLog({ logs }: LogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopy = () => {
    if (!logs.length) return;

    // Convert logs to plain text
    const text = logs.map(log => {
      // Simple HTML strip
      const cleanMessage = log.message.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
      return `[${log.type}] ${cleanMessage}`;
    }).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      alert('Game log copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy log:', err);
    });
  };

  return (
    <div className="w-full flex flex-col bg-black/40 border border-white/10 rounded-lg backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-white/10 bg-white/5">
        <span className="text-xs font-bold text-gray-400">Game Log</span>
        <button
          onClick={handleCopy}
          className="text-[10px] bg-white/10 hover:bg-white/20 text-gray-300 px-2 py-0.5 rounded transition-colors"
          title="Copy log to clipboard"
        >
          Copy
        </button>
      </div>

      {/* Log Content */}
      <div
        ref={scrollRef}
        className="h-24 sm:h-36 overflow-y-auto p-2 font-mono text-xs text-gray-300 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
      >
        {logs.length === 0 && <div className="text-center text-gray-500 italic">Game log...</div>}
        {logs.map((log) => (
          <div key={log.id} className="mb-0.5 leading-tight">
            {log.type === 'phase' && (
              <div className="text-yellow-400 font-bold border-t border-white/10 mt-1 pt-1" dangerouslySetInnerHTML={{ __html: log.message }} />
            )}
            {log.type === 'win' && (
              <div className="text-emerald-400 font-bold" dangerouslySetInnerHTML={{ __html: log.message }} />
            )}
            {log.type === 'action' && (
              <div className="text-gray-400" dangerouslySetInnerHTML={{ __html: log.message }} />
            )}
            {log.type === 'normal' && (
              <div className="text-gray-300" dangerouslySetInnerHTML={{ __html: log.message }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
