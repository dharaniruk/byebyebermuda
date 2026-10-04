// ============================================================
// URL CANONICALIZATION ENGINE
// ============================================================

export interface CanonicalizationResult {
  raw: string;
  canonical: string;
  steps: CanonicalizationStep[];
}

export interface CanonicalizationStep {
  rule: string;
  before: string;
  after: string;
  changed: boolean;
}

/**
 * Canonicalize a URL by applying a series of normalization rules.
 * Returns the canonical form and a step-by-step trace.
 */
export function canonicalizeUrl(rawUrl: string): CanonicalizationResult {
  const steps: CanonicalizationStep[] = [];
  let url = rawUrl.trim();

  // Step 1: Lowercase scheme and host
  let next = url.toLowerCase();
  if (next !== url) {
    // Only lowercase the scheme+host portion
    try {
      const parsed = new URL(url);
      const lowered = `${parsed.protocol.toLowerCase()}//${parsed.hostname.toLowerCase()}${parsed.port ? ':' + parsed.port : ''}${parsed.pathname}${parsed.search}${parsed.hash}`;
      steps.push({ rule: 'Lowercase scheme and host', before: url, after: lowered, changed: lowered !== url });
      url = lowered;
    } catch {
      steps.push({ rule: 'Lowercase scheme and host', before: url, after: next, changed: next !== url });
      url = next;
    }
  } else {
    steps.push({ rule: 'Lowercase scheme and host', before: url, after: url, changed: false });
  }

  // Step 2: Remove fragment (#)
  try {
    const parsed = new URL(url);
    if (parsed.hash) {
      parsed.hash = '';
      const noFrag = parsed.toString().replace(/#$/, '');
      steps.push({ rule: 'Remove fragment (#)', before: url, after: noFrag, changed: noFrag !== url });
      url = noFrag;
    } else {
      steps.push({ rule: 'Remove fragment (#)', before: url, after: url, changed: false });
    }
  } catch {
    const noFrag = url.split('#')[0];
    steps.push({ rule: 'Remove fragment (#)', before: url, after: noFrag, changed: noFrag !== url });
    url = noFrag;
  }

  // Step 3: Remove tracking query params (utm_*, ref, etc.)
  try {
    const parsed = new URL(url);
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'fbclid', 'gclid', 'source'];
    let changed = false;
    trackingParams.forEach(p => {
      if (parsed.searchParams.has(p)) {
        parsed.searchParams.delete(p);
        changed = true;
      }
    });
    const cleaned = parsed.toString();
    steps.push({ rule: 'Remove tracking parameters', before: url, after: cleaned, changed });
    url = cleaned;
  } catch {
    steps.push({ rule: 'Remove tracking parameters', before: url, after: url, changed: false });
  }

  // Step 4: Remove trailing slash from path (unless it's the root)
  try {
    const parsed = new URL(url);
    if (parsed.pathname !== '/' && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
      const noSlash = parsed.toString();
      steps.push({ rule: 'Remove trailing slash', before: url, after: noSlash, changed: noSlash !== url });
      url = noSlash;
    } else {
      steps.push({ rule: 'Remove trailing slash', before: url, after: url, changed: false });
    }
  } catch {
    steps.push({ rule: 'Remove trailing slash', before: url, after: url, changed: false });
  }

  // Step 5: Sort query parameters
  try {
    const parsed = new URL(url);
    const params = Array.from(parsed.searchParams.entries()).sort(([a], [b]) => a.localeCompare(b));
    parsed.search = '';
    params.forEach(([k, v]) => parsed.searchParams.append(k, v));
    const sorted = parsed.toString();
    steps.push({ rule: 'Sort query parameters', before: url, after: sorted, changed: sorted !== url });
    url = sorted;
  } catch {
    steps.push({ rule: 'Sort query parameters', before: url, after: url, changed: false });
  }

  return {
    raw: rawUrl,
    canonical: url,
    steps,
  };
}

/**
 * Resolve a relative URL against a base URL.
 */
export function resolveUrl(href: string, base: string): string | null {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

/**
 * Extract the domain from a URL.
 */
export function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

/**
 * Get a short display label from a URL (last path segment).
 */
export function getUrlLabel(url: string): string {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length === 0) return parsed.hostname;
    return parts[parts.length - 1].toUpperCase() || parsed.hostname.toUpperCase();
  } catch {
    return url.substring(0, 20).toUpperCase();
  }
}
