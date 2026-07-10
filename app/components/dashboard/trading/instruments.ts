export interface Instrument {
  symbol:   string;   // display: "BTC/USD"
  base:     string;   // "BTC"
  name:     string;
  category: "crypto";
  minLot:   number;
  lotStep:  number;
  pipValue: number;   // $ per lot per $1 move
}

export const INSTRUMENTS: Instrument[] = [
  { symbol:"BTC/USD",  base:"BTC",   name:"Bitcoin",        category:"crypto", minLot:0.001, lotStep:0.001, pipValue:0.001  },
  { symbol:"ETH/USD",  base:"ETH",   name:"Ethereum",       category:"crypto", minLot:0.01,  lotStep:0.01,  pipValue:0.01   },
  { symbol:"XRP/USD",  base:"XRP",   name:"Ripple",         category:"crypto", minLot:1,     lotStep:1,     pipValue:1      },
  { symbol:"BNB/USD",  base:"BNB",   name:"BNB",            category:"crypto", minLot:0.01,  lotStep:0.01,  pipValue:0.01   },
  { symbol:"SOL/USD",  base:"SOL",   name:"Solana",         category:"crypto", minLot:0.1,   lotStep:0.1,   pipValue:0.1    },
  { symbol:"ADA/USD",  base:"ADA",   name:"Cardano",        category:"crypto", minLot:10,    lotStep:10,    pipValue:10     },
  { symbol:"DOGE/USD", base:"DOGE",  name:"Dogecoin",       category:"crypto", minLot:100,   lotStep:100,   pipValue:100    },
  { symbol:"DOT/USD",  base:"DOT",   name:"Polkadot",       category:"crypto", minLot:0.1,   lotStep:0.1,   pipValue:0.1    },
  { symbol:"LTC/USD",  base:"LTC",   name:"Litecoin",       category:"crypto", minLot:0.01,  lotStep:0.01,  pipValue:0.01   },
  { symbol:"LINK/USD", base:"LINK",  name:"Chainlink",      category:"crypto", minLot:0.1,   lotStep:0.1,   pipValue:0.1    },
  { symbol:"AVAX/USD", base:"AVAX",  name:"Avalanche",      category:"crypto", minLot:0.1,   lotStep:0.1,   pipValue:0.1    },
  { symbol:"MATIC/USD",base:"MATIC", name:"Polygon",        category:"crypto", minLot:10,    lotStep:10,    pipValue:10     },
];

export function calcPnl(side: "buy"|"sell", entry: number, current: number, lotSize: number): number {
  const diff = side === "buy" ? current - entry : entry - current;
  return diff * lotSize;
}

export function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString("en-US", { minimumFractionDigits:2, maximumFractionDigits:2 });
  if (price >= 1)    return price.toFixed(4);
  return price.toFixed(6);
}
