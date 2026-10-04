// ============================================================
// EXPORT UTILITIES
// ============================================================

import { CrawlNode, CrawlerState } from '../engine/types';

export function exportJson(state: CrawlerState) {
  const report = {
    byebyebermuda: {
      version: '1.0.0',
      generated: new Date().toISOString(),
      mode: 'SIMULATION',
    },
    configuration: {
      startUrl: state.config.startUrl,
      strategy: state.config.strategy,
      maxPages: state.config.maxPages,
      maxDepth: state.config.maxDepth,
      demoMode: state.config.demoMode,
      demoScenario: state.config.demoScenario,
    },
    statistics: state.stats,
    crawlOrder: state.nodes
      .filter(n => n.visitedAt !== null)
      .sort((a, b) => (a.visitedAt ?? 0) - (b.visitedAt ?? 0))
      .map(n => ({
        url: n.url,
        canonicalUrl: n.canonicalUrl,
        depth: n.depth,
        status: n.status,
        httpStatus: n.httpStatus,
        responseTime: n.responseTime,
        cycleInvolved: n.cycleInvolved,
      })),
    cyclesDetected: state.detectedCycles,
    visitedUrls: Array.from(state.visitedSet),
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `byebyebermuda-report-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCsv(nodes: CrawlNode[]) {
  const headers = [
    'URL', 'Canonical URL', 'Depth', 'Status', 'HTTP Status',
    'Response Time (ms)', 'Page Title', 'Cycle Involved', 'Visited At',
  ];

  const rows = nodes.map(n => [
    `"${n.url}"`,
    `"${n.canonicalUrl}"`,
    n.depth,
    n.status,
    n.httpStatus ?? '',
    n.responseTime ?? '',
    `"${n.pageTitle}"`,
    n.cycleInvolved ? 'YES' : 'NO',
    n.visitedAt ? new Date(n.visitedAt).toISOString() : '',
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `byebyebermuda-urls-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
