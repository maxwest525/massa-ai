import type { FillEvent } from "../types/trade";

interface Props {
  fills: FillEvent[];
}

export function TradeLog({ fills }: Props) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-2">
      <h3 className="text-white font-semibold text-sm">Live Fills</h3>
      {fills.length === 0 && (
        <p className="text-zinc-500 text-xs">No fills yet</p>
      )}
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {[...fills].reverse().map((fill) => (
          <div
            key={fill.order_id}
            className="flex justify-between items-center text-xs font-mono bg-zinc-800 rounded px-2 py-1"
          >
            <span
              className={fill.signal === "buy" ? "text-green-400" : "text-red-400"}
            >
              {fill.signal.toUpperCase()}
            </span>
            <span className="text-zinc-300">{fill.strategy_id}</span>
            <span className="text-zinc-400">{fill.price.toFixed(2)}</span>
            <span className="text-zinc-500">qty {fill.qty.toFixed(4)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
