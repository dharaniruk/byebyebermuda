// ============================================================
// BLOOM FILTER SIMULATION
// ============================================================

import { BloomFilterState } from './types';

/**
 * Simple but realistic Bloom Filter implementation.
 * Uses multiple hash functions to set bits in a bit array.
 */

const BLOOM_SIZE = 128;
const HASH_COUNT = 3;

/**
 * Create a fresh Bloom Filter state
 */
export function createBloomFilter(): BloomFilterState {
  return {
    bits: new Array(BLOOM_SIZE).fill(0),
    size: BLOOM_SIZE,
    hashCount: HASH_COUNT,
    lastCheckedUrl: null,
    lastHashPositions: [],
    lastResult: null,
  };
}

/**
 * Multiple hash functions for the Bloom Filter.
 * Returns HASH_COUNT positions in [0, size).
 */
function hashUrl(url: string, seed: number, size: number): number {
  let h = seed * 2654435761;
  for (let i = 0; i < url.length; i++) {
    h = Math.imul(h ^ url.charCodeAt(i), 2246822519);
    h ^= h >>> 13;
    h = Math.imul(h, 3266489917);
    h ^= h >>> 16;
  }
  return Math.abs(h) % size;
}

export function getBloomPositions(url: string, size: number = BLOOM_SIZE): number[] {
  const seeds = [0xdeadbeef, 0xbeefdead, 0x12345678];
  return seeds.slice(0, HASH_COUNT).map(seed => hashUrl(url, seed, size));
}

/**
 * Add a URL to the Bloom Filter. Returns updated state.
 */
export function bloomAdd(state: BloomFilterState, url: string): BloomFilterState {
  const positions = getBloomPositions(url, state.size);
  const bits = [...state.bits];
  positions.forEach(p => { bits[p] = 1; });
  return {
    ...state,
    bits,
    lastCheckedUrl: url,
    lastHashPositions: positions,
    lastResult: 'possibly_seen',
  };
}

/**
 * Check if a URL might be in the Bloom Filter.
 * Returns 'possibly_seen' or 'definitely_new'.
 * NOTE: false positives are possible — 'possibly_seen' does NOT guarantee the URL was actually added.
 */
export function bloomCheck(state: BloomFilterState, url: string): {
  result: 'possibly_seen' | 'definitely_new';
  positions: number[];
  updatedState: BloomFilterState;
} {
  const positions = getBloomPositions(url, state.size);
  const allSet = positions.every(p => state.bits[p] === 1);
  const result = allSet ? 'possibly_seen' : 'definitely_new';

  return {
    result,
    positions,
    updatedState: {
      ...state,
      lastCheckedUrl: url,
      lastHashPositions: positions,
      lastResult: result,
    },
  };
}

/**
 * Demonstrate a false positive scenario.
 * Returns a URL that triggers all bits but was never added.
 */
export function demonstrateFalsePositive(state: BloomFilterState): string | null {
  // Try a few candidate URLs to find one that would be a false positive
  const candidates = [
    'https://demo.local/never-added',
    'https://demo.local/false-hit',
    'https://example.com/nothere',
  ];
  for (const c of candidates) {
    const positions = getBloomPositions(c, state.size);
    if (positions.every(p => state.bits[p] === 1)) return c;
  }
  return null;
}

/**
 * Calculate the approximate false positive probability for a given state.
 */
export function falsePositiveProbability(setBits: number, size: number, hashCount: number): number {
  const ratio = setBits / size;
  return Math.pow(ratio, hashCount);
}
