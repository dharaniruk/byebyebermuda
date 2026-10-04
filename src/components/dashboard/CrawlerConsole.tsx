// ============================================================
// LIVE CRAWLER CONSOLE — bottom event log
// ============================================================

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Trash2 } from 'lucide-react';
import { useCrawlerStore } from '../../store/crawlerStore';
import { LogEntry, LogLevel } from '../../engine/types';

const LEVEL_STYLES: Record<LogLevel, { prefix: string; color: string; bg: string }> = {
  info:    { prefix: 'INFO   ', color: 'text-slate-400', bg: '' },
  success: { prefix: 'SUCCESS', color: 'text-green-400', bg: '' },
  warning: { prefix: 'WARN   ', color: 'text-amber-400', bg: '' },
  error:   { prefix: 'ERROR  ', color: 'text-red-400', bg: '' },
  cycle:   { prefix: 'CYCLE  ', color: 'text-red-300', bg: 'bg-red-500/5' },
};

function LogLine({ entry }: { entry: LogEntry }) {
  const style = LEVEL_STYLES[entry.level];
  const time = new Date(entry.timestamp).toLocaleTimeString('en-US', { hour12: false });

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={`flex items-start gap-2 px-2 py-0.5 rounded text-xs font-mono ${style.bg}`}
    >
      <span className="text-slate-600 flex-shrink-0">[{time}]</span>
      <span className={`flex-shrink-0 font-bold ${style.color}`}>{style.prefix}</span>
      <span className={style.color}>{entry.message}</span>
      {entry.detail && (
        <span className="text-slate-600 ml-1">— {entry.detail}</span>
      )}
    </motion.div>
  );
}

export default function CrawlerConsole() {
  const { crawlerState } = useCrawlerStore();
  const { logs } = crawlerState;
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="card flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Live Event Console
          </h3>
          <span className="ml-2 px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-500 font-mono">
            {logs.length} events
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 mr-2">
            {(Object.entries(LEVEL_STYLES) as [LogLevel, typeof LEVEL_STYLES[LogLevel]][]).map(([level, s]) => (
              <div key={level} className="flex items-center gap-1">
                <span className={`text-[9px] font-mono font-bold ${s.color}`}>{level.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Log area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-0.5 min-h-0">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-slate-600 font-mono">Waiting for crawler events...</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {logs.slice(-100).map(entry => (
              <LogLine key={entry.id} entry={entry} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
