"use client";

import { useState, useEffect, useRef } from "react";
import { nextTick, currentPrice, generateHistory } from "./priceEngine";
import { INSTRUMENTS } from "./instruments";

export interface PriceData {
  symbol:    string;
  price:     number;
  change24h: number;
  volume24h: number;
  bid:       number;
  ask:       number;
  open24h:   number;
}

const SPREAD_PCT = 0.0003;

function makeData(base: string, price: number, open24h: number): PriceData {
  const spread  = price * SPREAD_PCT;
  const change  = ((price - open24h) / open24h) * 100;
  return {
    symbol:    `${base}/USD`,
    price,
    change24h: change,
    volume24h: price * (1e6 + Math.random() * 1e6),
    bid:       +(price - spread).toFixed(8),
    ask:       +(price + spread).toFixed(8),
    open24h,
  };
}

/** Live price hook — fully simulated, no external API */
export function useLivePrice(base: string, intervalMs = 800): PriceData | null {
  const [data, setData]       = useState<PriceData | null>(null);
  const open24hRef            = useRef<number>(0);
  const prevBase              = useRef<string>("");

  useEffect(() => {
    if (!base) return;

    // Initialise open price on mount / instrument change
    if (prevBase.current !== base) {
      prevBase.current = base;
      const p = currentPrice(base);
      open24hRef.current = p * (0.97 + Math.random() * 0.06); // synthetic 24h open
    }

    const tick = () => {
      const price = nextTick(base);
      setData(makeData(base, price, open24hRef.current));
    };

    tick(); // immediate first tick
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [base, intervalMs]);

  return data;
}

/** Prices for all instruments — for the watchlist */
export function useWatchlist(bases: string[], intervalMs = 1500) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const opens = useRef<Record<string, number>>({});

  useEffect(() => {
    // Initialise synthetic 24h opens
    bases.forEach(b => {
      if (!opens.current[b]) {
        const p = currentPrice(b);
        opens.current[b] = p * (0.97 + Math.random() * 0.06);
      }
    });

    const tick = () => {
      const next: Record<string, PriceData> = {};
      bases.forEach(b => {
        const price = nextTick(b);
        next[b] = makeData(b, price, opens.current[b]);
      });
      setPrices(next);
    };

    tick();
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bases.join(","), intervalMs]);

  return prices;
}
