// ============================================================
// NAVBAR — Primary Application Navigation
// ============================================================

import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Triangle, Settings, Menu, X, Play, Sparkles, HelpCircle,
  History, ShieldAlert, BarChart3, ChevronDown, Cpu, BookOpen,
  LayoutGrid, Info, CheckCircle2, Zap
} from 'lucide-react';
import { useCrawlerStore } from '../../store/crawlerStore';

interface NavbarProps {
  onSettingsOpen?: () => void;
  onPresentationOpen?: () => void;
  onVivaOpen?: () => void;
}

export default function Navbar({ onSettingsOpen, onPresentationOpen, onVivaOpen }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { crawlerState, startCrawl } = useCrawlerStore();
  const { status, detectedCycles } = crawlerState;

  const [menuOpen, setMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { href: '/', label: 'Crawl', icon: Play },
    { href: '/history', label: 'History', icon: History },
    {
      href: '/cycles',
      label: 'Cycles',
      icon: ShieldAlert,
      badge: detectedCycles.length > 0 ? detectedCycles.length : undefined,
    },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const moreLinks = [
    { href: '/visualizer', label: 'Algorithm Visualizer', desc: '128-bit Bloom Filter & Normalizer lab', icon: LayoutGrid },
    { href: '/technical-details', label: 'Technical Details', desc: 'Complexity, data structures & lore', icon: BookOpen },
    { href: '/architecture', label: 'Architecture', desc: 'End-to-end data pipeline diagram', icon: Cpu },
    { href: '/about', label: 'About BYEBYEBERMUDA', desc: 'Project specs & engineering overview', icon: Info },
  ];

  const isCrawling = status === 'crawling';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* ── Brand Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center">
              <Triangle
                className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors"
                fill="none"
                strokeWidth={1.8}
              />
              <div className="absolute w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-wider text-white">
                BYEBYE<span className="text-cyan-400">BERMUDA</span>
              </span>
              <span className="text-[9px] text-slate-500 font-mono tracking-tight hidden sm:block">
                Cycle-Safe Web Crawler
              </span>
            </div>
          </Link>

          {/* ── Main Nav Links (Desktop) ── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'text-cyan-400 bg-cyan-500/15 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{link.label}</span>
                  {link.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.2 bg-red-500/20 border border-red-500/40 text-red-400 rounded-full text-[9px] font-mono font-bold animate-pulse">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* "More" Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  moreLinks.some(m => m.href === location.pathname)
                    ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {moreDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-1.5 w-64 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50"
                  >
                    <div className="text-[10px] font-mono text-slate-500 px-3 py-1 uppercase tracking-wider border-b border-slate-800 mb-1">
                      Technical & Lore
                    </div>
                    {moreLinks.map((item) => {
                      const ItemIcon = item.icon;
                      const isItemActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setMoreDropdownOpen(false)}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl transition-colors ${
                            isItemActive ? 'bg-cyan-500/15 text-cyan-300' : 'hover:bg-slate-800/80 text-slate-300'
                          }`}
                        >
                          <ItemIcon className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-xs font-bold">{item.label}</div>
                            <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{item.desc}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Header Right: Actions & Status ── */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Simulation mode pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-mono">
              <div className={`w-2 h-2 rounded-full ${isCrawling ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span className="text-slate-400">Simulation Mode</span>
            </div>

            {/* Viva & Presentation trigger shortcuts */}
            {onVivaOpen && (
              <button
                onClick={onVivaOpen}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-medium transition-colors"
                title="Explain current algorithm step"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden lg:inline">Explain Step</span>
              </button>
            )}

            {onPresentationOpen && (
              <button
                onClick={onPresentationOpen}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-medium transition-colors"
                title="Open Presentation Mode"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden lg:inline">Presentation</span>
              </button>
            )}

            {/* Settings */}
            <button
              onClick={onSettingsOpen}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
              title="Crawl Configuration Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* ── Mobile menu button ── */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* ── Mobile menu drawer ── */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-800 py-3 space-y-1"
            >
              {[...navLinks, ...moreLinks].map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                    location.pathname === link.href
                      ? 'text-cyan-400 bg-cyan-500/10 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <link.icon className="w-4 h-4 text-cyan-400" />
                  <span>{link.label}</span>
                </Link>
              ))}

              <div className="pt-2 flex gap-2 border-t border-slate-800">
                {onVivaOpen && (
                  <button
                    onClick={() => { setMenuOpen(false); onVivaOpen(); }}
                    className="flex-1 py-2 bg-amber-500/10 text-amber-300 rounded-lg text-xs font-medium text-center"
                  >
                    Explain Step
                  </button>
                )}
                {onPresentationOpen && (
                  <button
                    onClick={() => { setMenuOpen(false); onPresentationOpen(); }}
                    className="flex-1 py-2 bg-cyan-500/10 text-cyan-300 rounded-lg text-xs font-medium text-center"
                  >
                    Presentation Mode
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
