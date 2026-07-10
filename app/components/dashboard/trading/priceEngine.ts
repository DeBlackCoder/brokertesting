/**
 * Simulated price engine — no external API.
 * Generates realistic-looking OHLC candlestick data using a
 * geometric Brownian motion model with trend drift and volatility clustering.
 */

export interface SimCandle {
  t:    number; // timestamp ms
  o:    number;
  h:    number;
  l:    number;
  c:    number;
  vol:  number;
}

// Starting prices per instrument (realistic reference prices)
const BASE_PRICES: Record<string, number> = {
  BTC:   67500,
  ETH:   3520,
  XRP:   0.585,
  BNB:   605,
  SOL:   178,
  ADA:   0.465,
  DOGE:  0.165,
  DOT:   8.4,
  LTC:   86,
  LINK:  17.8,
  AVAX:  38.5,
  MATIC: 0.725,
};

// Volatility per instrument — higher values = more visible price movement per tick
const VOLATILITY: Record<string, number> = {
  BTC:   0.0055,
  ETH:   0.0065,
  XRP:   0.0090,
  BNB:   0.0075,
  SOL:   0.0100,
  ADA:   0.0095,
  DOGE:  0.0120,
  DOT:   0.0110,
  LTC:   0.0080,
  LINK:  0.0095,
  AVAX:  0.0115,
  MATIC: 0.0125,
};

interface PriceState {
  price:     number;
  trend:     number;   // current drift direction
  vol:       number;   // current volatility multiplier
  lastFlip:  number;   // when trend last changed
}

const states = new Map<string, PriceState>();

function getState(base: string): PriceState {
  if (!states.has(base)) {
    states.set(base, {
      price:    BASE_PRICES[base] ?? 100,
      trend:    (Math.random() - 0.5) * 0.0004,
      vol:      1,
      lastFlip: Date.now(),
    });
  }
  return states.get(base)!;
}

/**
 * Generate the next tick price.
 * Called every 100ms or so — returns an updated price.
 */
export function nextTick(base: string): number {
  const s   = getState(base);
  const vol = VOLATILITY[base] ?? 0.002;
  const now = Date.now();

  // Randomly flip trend every 8–30 seconds for faster market feel
  if (now - s.lastFlip > 8_000 + Math.random() * 22_000) {
    s.trend    = (Math.random() - 0.48) * 0.0018; // stronger directional drift
    s.vol      = 0.8 + Math.random() * 2.2;       // sharper volatility clusters
    s.lastFlip = now;
  }

  // Brownian motion step
  const noise = (Math.random() - 0.5) * 2;       // -1 to 1
  const step  = s.price * (s.trend + noise * vol * s.vol);
  s.price     = Math.max(s.price * 0.5, s.price + step);

  return s.price;
}

/**
 * Generate N historical candles going backward from now.
 * Used to pre-populate the chart on mount.
 */
export function generateHistory(base: string, count: number, candleMs: number): SimCandle[] {
  const basePrice = BASE_PRICES[base] ?? 100;
  const vol       = VOLATILITY[base] ?? 0.002;
  const candles: SimCandle[] = [];

  let price = basePrice * (0.92 + Math.random() * 0.16); // start within ±8%
  let trend = (Math.random() - 0.48) * 0.0004;

  for (let i = 0; i < count; i++) {
    const t   = Date.now() - (count - i) * candleMs;
    const o   = price;
    let   h   = o, l = o;
    const ticks = 12;

    // Simulate ticks within candle
    for (let j = 0; j < ticks; j++) {
      if (Math.random() < 0.06) trend = (Math.random() - 0.48) * 0.0018; // faster trend flips in history
      const noise = (Math.random() - 0.5) * 2;
      price = Math.max(price * 0.5, price + price * (trend + noise * vol));
      if (price > h) h = price;
      if (price < l) l = price;
    }

    const c = price;
    candles.push({ t, o, h, l, c, vol: Math.random() * 1e6 + 1e5 });
  }

  // Sync the running state to end of history so ticks continue from there
  states.set(base, {
    price:    price,
    trend,
    vol:      1,
    lastFlip: Date.now(),
  });

  return candles;
}

/** Current simulated price for a given instrument */
export function currentPrice(base: string): number {
  return getState(base).price;
}
