// Small stats helpers: mean, and bootstrap 95% CIs. We only claim a winner
// where condition CIs separate (per the plan's fairness protocol).
export function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

// Deterministic PRNG so CIs are stable across report re-runs (mulberry32).
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function bootstrapCI(xs: number[], iters = 2000, seed = 12345): [number, number] {
  if (xs.length === 0) return [0, 0];
  if (xs.length === 1) return [xs[0], xs[0]];
  const rand = rng(seed);
  const means: number[] = [];
  for (let i = 0; i < iters; i++) {
    let s = 0;
    for (let j = 0; j < xs.length; j++) s += xs[Math.floor(rand() * xs.length)];
    means.push(s / xs.length);
  }
  means.sort((a, b) => a - b);
  return [means[Math.floor(iters * 0.025)], means[Math.floor(iters * 0.975)]];
}

/** Do two bootstrap CIs fail to overlap? (a crude but honest "separated" test) */
export function ciSeparated(a: [number, number], b: [number, number]): boolean {
  return a[1] < b[0] || b[1] < a[0];
}
