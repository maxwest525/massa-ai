import { useCallback, useState } from "react";
import { StrategyPanel } from "./components/StrategyPanel";
import { TradeLog } from "./components/TradeLog";
import { useStrategyConfig } from "./hooks/useStrategyConfig";
import { useWebSocket } from "./hooks/useWebSocket";
import type { WsEvent, FillEvent } from "./types/trade";

export default function App() {
  const { strategies, loading, error, updateParam, toggleEnabled } = useStrategyConfig();
  const [fills, setFills] = useState<FillEvent[]>([]);

  const handleWsEvent = useCallback((event: WsEvent) => {
    if (event.type === "fill") {
      setFills((prev) => [...prev.slice(-199), event as FillEvent]);
    }
  }, []);

  const { connected } = useWebSocket(handleWsEvent);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Nav */}
      <header className="border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
        <span className="font-bold tracking-tight">xerox-bot</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${connected ? "bg-green-900 text-green-400" : "bg-zinc-800 text-zinc-500"}`}>
          {connected ? "live" : "disconnected"}
        </span>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Strategies column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-zinc-400 text-xs uppercase tracking-widest">Strategies</h2>

          {loading && <p className="text-zinc-500 text-sm">Loading strategies…</p>}
          {error && (
            <div className="rounded-lg bg-red-950 border border-red-800 px-4 py-3 text-sm text-red-300">
              Engine unreachable: {error}
            </div>
          )}

          {strategies.map((strategy) => (
            <StrategyPanel
              key={strategy.id}
              strategy={strategy}
              onParamChange={(key, value) => updateParam(strategy.id, key, value)}
              onToggleEnabled={(enabled) => toggleEnabled(strategy.id, enabled)}
            />
          ))}

          {!loading && strategies.length === 0 && !error && (
            <p className="text-zinc-500 text-sm">
              No strategies found. Drop a folder in{" "}
              <code className="text-zinc-300">engine/strategies/</code>.
            </p>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <h2 className="text-zinc-400 text-xs uppercase tracking-widest">Activity</h2>
          <TradeLog fills={fills} />
        </div>
      </main>
    </div>
  );
}
