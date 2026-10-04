// ============================================================
// FOOTER
// ============================================================

import { Link } from 'react-router-dom';
import { Triangle, GitBranch, BookOpen, Cpu, Info, History, ShieldAlert, BarChart3 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#030712] mt-auto">
      <div className="max-w-screen-2xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Triangle className="w-5 h-5 text-cyan-400" fill="none" strokeWidth={1.8} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                </div>
              </div>
              <span className="font-extrabold text-sm tracking-wider text-white">
                BYEBYE<span className="text-cyan-400">BERMUDA</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 italic">"Break the Loop. Crawl Smarter."</p>
            <p className="text-xs text-slate-500 max-w-md">
              A high-precision prototype for Cycle-Safe Web Crawling featuring RFC 3986 URL Canonicalization, 128-Bit Probabilistic Bloom Filtering, and Exact Hash Set visited verification.
            </p>
            <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl inline-block max-w-lg">
              <p className="text-[11px] text-amber-400/80 font-mono">
                Prototype / Educational Demonstration — Respect robots.txt, rate limits, and site policies when building production crawlers.
              </p>
            </div>
          </div>

          {/* Core Crawler Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Crawler Tool</h4>
            <ul className="space-y-2 text-xs">
              {[
                { to: '/', label: 'Live Crawler Workspace' },
                { to: '/history', label: 'Crawl History & Logs' },
                { to: '/cycles', label: 'Cycle Interception Report' },
                { to: '/analytics', label: 'Analytics & Telemetry' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-slate-400 hover:text-cyan-300 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Technical & Lore */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Technical & Lore</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/visualizer" className="text-slate-400 hover:text-cyan-300 transition-colors">
                  Algorithm Visualizer
                </Link>
              </li>
              <li>
                <Link to="/technical-details" className="text-slate-400 hover:text-cyan-300 transition-colors">
                  Technical Details & Complexity
                </Link>
              </li>
              <li>
                <Link to="/architecture" className="text-slate-400 hover:text-cyan-300 transition-colors">
                  System Architecture
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-cyan-300 transition-colors">
                  About BYEBYEBERMUDA
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
          <p>© 2026 BYEBYEBERMUDA — Cycle-Safe Web Crawler System</p>
          <p>Asymptotic Complexity: O(V + E) Traversal Guarantee</p>
        </div>
      </div>
    </footer>
  );
}
