// ============================================================
// STATS CARDS — live metrics
// ============================================================

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import {
  Globe, CheckCircle, AlertTriangle, Copy, XCircle, ArrowDown, Zap, Clock,
} from 'lucide-react';
import { CrawlerStats } from '../../engine/types';

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    if (value === prev.current) return;
    const start = prev.current;
    const end = value;
    const duration = 400;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.round(start + (end - start) * progress);
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    prev.current = value;
  }, [value]);

  return <span>{display}</span>;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  suffix?: string;
  decimal?: boolean;
}

function StatCard({ icon, label, value, color, suffix = '', decimal = false }: StatCardProps) {
  return (
    <motion.div
      layout
      className="card p-4 flex flex-col gap-2"
      whileHover={{ borderColor: 'rgba(34,211,238,0.3)', y: -1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</span>
        <div className={`p-1.5 rounded-lg ${color}`}>{icon}</div>
      </div>
      <div className="text-2xl font-bold text-slate-100 font-mono">
        {decimal ? value.toFixed(2) : <AnimatedNumber value={value} />}
        {suffix && <span className="text-sm text-slate-400 ml-1">{suffix}</span>}
      </div>
    </motion.div>
  );
}

interface StatsCardsProps {
  stats: CrawlerStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards: StatCardProps[] = [
    {
      icon: <Globe className="w-4 h-4 text-blue-400" />,
      label: 'Pages Discovered',
      value: stats.pagesDiscovered,
      color: 'bg-blue-500/10',
    },
    {
      icon: <CheckCircle className="w-4 h-4 text-green-400" />,
      label: 'Pages Visited',
      value: stats.pagesVisited,
      color: 'bg-green-500/10',
    },
    {
      icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
      label: 'Cycles Detected',
      value: stats.cyclesDetected,
      color: 'bg-red-500/10',
    },
    {
      icon: <Copy className="w-4 h-4 text-amber-400" />,
      label: 'Duplicates Skipped',
      value: stats.duplicatesSkipped,
      color: 'bg-amber-500/10',
    },
    {
      icon: <XCircle className="w-4 h-4 text-orange-400" />,
      label: 'Broken Links',
      value: stats.brokenLinks,
      color: 'bg-orange-500/10',
    },
    {
      icon: <ArrowDown className="w-4 h-4 text-violet-400" />,
      label: 'Max Depth',
      value: stats.maxDepthReached,
      color: 'bg-violet-500/10',
    },
    {
      icon: <Zap className="w-4 h-4 text-cyan-400" />,
      label: 'Requests Saved',
      value: stats.requestsSaved,
      color: 'bg-cyan-500/10',
    },
    {
      icon: <Clock className="w-4 h-4 text-slate-400" />,
      label: 'Crawl Time',
      value: stats.crawlTime,
      color: 'bg-slate-700/50',
      suffix: 's',
      decimal: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map(card => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
