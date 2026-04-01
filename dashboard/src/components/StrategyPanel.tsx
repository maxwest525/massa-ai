/**
 * StrategyPanel — auto-renders parameter controls from the YAML schema.
 *
 * integer / float  → range slider + number input
 * boolean          → toggle switch
 * enum             → select dropdown
 * string           → text input
 */

import type { Strategy, ParamSchema } from "../types/strategy";

interface Props {
  strategy: Strategy;
  onParamChange: (key: string, value: number | boolean | string) => void;
  onToggleEnabled: (enabled: boolean) => void;
}

export function StrategyPanel({ strategy, onParamChange, onToggleEnabled }: Props) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold text-sm">{strategy.name}</h3>
          <p className="text-zinc-500 text-xs mt-0.5">{strategy.symbol}</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={strategy.enabled}
            onChange={(e) => onToggleEnabled(e.target.checked)}
          />
          <div className="w-10 h-5 bg-zinc-700 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
        </label>
      </div>

      {strategy.description && (
        <p className="text-zinc-400 text-xs">{strategy.description}</p>
      )}

      {/* Parameters */}
      <div className="space-y-4 pt-1">
        {Object.entries(strategy.parameters).map(([key, schema]) => (
          <ParamControl
            key={key}
            paramKey={key}
            schema={schema}
            value={strategy.current_params[key]}
            onChange={(v) => onParamChange(key, v)}
          />
        ))}
      </div>

      {/* Risk limits summary */}
      <div className="pt-2 border-t border-zinc-800 grid grid-cols-3 gap-2 text-xs text-zinc-500">
        <span>Max pos: {strategy.risk_limits.max_position_pct}%</span>
        <span>Daily loss: {strategy.risk_limits.daily_loss_limit}%</span>
        <span>Max trades: {strategy.risk_limits.max_open_trades}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Individual param control
// ---------------------------------------------------------------------------

interface ControlProps {
  paramKey: string;
  schema: ParamSchema;
  value: number | boolean | string;
  onChange: (v: number | boolean | string) => void;
}

function ParamControl({ paramKey, schema, value, onChange }: ControlProps) {
  const { label, type } = schema;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="text-xs text-zinc-400">{label}</label>
        {(type === "integer" || type === "float") && (
          <span className="text-xs text-zinc-300 font-mono">{String(value)}</span>
        )}
      </div>

      {(type === "integer" || type === "float") && (
        <input
          type="range"
          min={schema.min}
          max={schema.max}
          step={schema.step}
          value={Number(value)}
          onChange={(e) =>
            onChange(type === "integer" ? parseInt(e.target.value) : parseFloat(e.target.value))
          }
          className="w-full h-1.5 bg-zinc-700 rounded appearance-none cursor-pointer accent-blue-500"
        />
      )}

      {type === "boolean" && (
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="accent-blue-500"
          />
          <span className="text-xs text-zinc-300">{Boolean(value) ? "On" : "Off"}</span>
        </label>
      )}

      {type === "enum" && (
        <select
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-zinc-800 text-zinc-200 text-xs rounded px-2 py-1 border border-zinc-700"
        >
          {schema.options?.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}

      {type === "string" && (
        <input
          type="text"
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-zinc-800 text-zinc-200 text-xs rounded px-2 py-1 border border-zinc-700"
        />
      )}
    </div>
  );
}
