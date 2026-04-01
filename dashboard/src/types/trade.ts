export interface Trade {
  id: string;
  strategy_id: string;
  symbol: string;
  side: "buy" | "sell" | "close";
  qty: number;
  entry_price: number;
  exit_price?: number;
  opened_at: string;
  closed_at?: string;
  pnl?: number;
  fees: number;
}

export interface FillEvent {
  type: "fill";
  strategy_id: string;
  order_id: string;
  signal: "buy" | "sell";
  price: number;
  qty: number;
}

export type WsEvent = FillEvent | { type: string; [key: string]: unknown };
