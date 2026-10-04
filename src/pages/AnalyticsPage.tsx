// ============================================================
// ANALYTICS PAGE — charts and metrics
// ============================================================

import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useCrawlerStore } from '../store/crawlerStore';
import Footer from '../components/layout/Footer';
import StatsCards from '../components/dashboard/StatsCards';

const COLORS = ['#22d3ee', '#a78bfa', '#22c55e', '#f59e0b', '#ef4444'];

// Illustrative pipeline data
const PIPELINE_DATA = [
  { stage: 'Raw URLs', count: 100000 },
  { stage: 'Post-Canon.', count: 82000 },
  { stage: 'Bloom Candidates', count: 82000 },
  { stage: 'Exact Accepted', count: 76000 },
];

// Memory comparison data
const MEMORY_DATA = [
  { name: 'Hash Set', value: 100 },
  { name: 'Bloom Filter', value: 18 },
];

const PIE_COLORS = ['#22d3ee', '#a78bfa'];

export default function AnalyticsPage() {
  const { crawlerState } = useCrawlerStore();
  const { stats, nodes, logs } = crawlerState;

  // Build crawl-over-time data from logs
  const timelineData = (() => {
    const data: { step: number; visited: number; discovered: number; cycles: number }[] = [];
    let visited = 0, discovered = 1, cycles = 0;
    let step = 0;
    for (const log of logs) {
      if (log.level === 'success' && log.message.startsWith('PAGE ACCEPTED')) {
        visited++;
        step++;
        data.push({ step, visited, discovered, cycles });
      } else if (log.message.startsWith('QUEUED')) {
        discovered++;
      } else if (log.level === 'cycle') {
        cycles++;
      }
    }
    return data.slice(-30); // last 30 points
  })();

  // Node status breakdown
  const statusData = (() => {
    const counts: Record<string, number> = {};
    nodes.forEach(n => {
      counts[n.status] = (counts[n.status] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace('_', ' ').toUpperCase(), value }));
  })();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs">
        <p className="text-slate-400 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#030712] pt-14">
      <div className="max-w-screen-xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-black text-white mb-2">ANALYTICS</h1>
          <p className="text-slate-500 text-sm">Real-time metrics and crawl analysis</p>
        </motion.div>

        {/* Stats */}
        <div className="mb-8">
          <StatsCards stats={stats} />
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Crawl Progress Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">Crawl Progress</h3>
            {timelineData.length > 1 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="step" tick={{ fill: '#475569', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#475569', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                  <Line type="monotone" dataKey="visited" stroke="#22d3ee" strokeWidth={2} dot={false} name="Visited" />
                  <Line type="monotone" dataKey="discovered" stroke="#a78bfa" strokeWidth={2} dot={false} name="Discovered" />
                  <Line type="monotone" dataKey="cycles" stroke="#ef4444" strokeWidth={1.5} dot={false} name="Cycles" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-slate-600 text-sm">
                Run a crawl to see progress data
              </div>
            )}
          </motion.div>

          {/* Node Status Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card p-6"
          >
            <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">Node Status Breakdown</h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 9 }} />
                  <YAxis tick={{ fill: '#475569', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Nodes" fill="#22d3ee" radius={[4, 4, 0, 0]}>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-slate-600 text-sm">
                Run a crawl to see node status data
              </div>
            )}
          </motion.div>

          {/* Illustrative Pipeline Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">URL Processing Pipeline</h3>
              <span className="text-[10px] px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400">
                Illustrative Simulation
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={PIPELINE_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" tick={{ fill: '#475569', fontSize: 10 }} />
                <YAxis type="category" dataKey="stage" tick={{ fill: '#94a3b8', fontSize: 10 }} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="URLs" fill="#22d3ee" radius={[0, 4, 4, 0]}>
                  {PIPELINE_DATA.map((_, i) => (
                    <Cell key={i} fill={['#22d3ee', '#a78bfa', '#f59e0b', '#22c55e'][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Memory Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Memory Efficiency</h3>
              <span className="text-[10px] px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400">
                Illustrative Relative Use
              </span>
            </div>
            <div className="flex items-center gap-8">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={MEMORY_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {MEMORY_DATA.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-4">
                {MEMORY_DATA.map((d, i) => (
                  <div key={d.name}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-xs text-slate-300 font-medium">{d.name}</span>
                    </div>
                    <div className="text-2xl font-bold font-mono" style={{ color: PIE_COLORS[i] }}>
                      {d.value}%
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {i === 0 ? 'Exact, no false positives' : 'Compact, probabilistic'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
