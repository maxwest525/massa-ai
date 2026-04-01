import { useState, useEffect, useCallback, useRef } from "react";
import type { Strategy } from "../types/strategy";

const ENGINE_URL = import.meta.env.VITE_ENGINE_URL ?? "http://localhost:8000";

export function useStrategyConfig() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStrategies = useCallback(async () => {
    try {
      const res = await fetch(`${ENGINE_URL}/api/strategies`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Strategy[] = await res.json();
      setStrategies(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch strategies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStrategies();
  }, [fetchStrategies]);

  // Debounced param update
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const updateParam = useCallback(
    (strategyId: string, key: string, value: number | boolean | string) => {
      // Optimistic local update
      setStrategies((prev) =>
        prev.map((s) =>
          s.id === strategyId
            ? { ...s, current_params: { ...s.current_params, [key]: value } }
            : s
        )
      );

      const timerKey = `${strategyId}:${key}`;
      clearTimeout(debounceTimers.current[timerKey]);
      debounceTimers.current[timerKey] = setTimeout(async () => {
        try {
          await fetch(`${ENGINE_URL}/api/strategies/${strategyId}/params`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ params: { [key]: value } }),
          });
        } catch (err) {
          console.error("Failed to update param:", err);
          fetchStrategies(); // revert on error
        }
      }, 300);
    },
    [fetchStrategies]
  );

  const toggleEnabled = useCallback(
    async (strategyId: string, enabled: boolean) => {
      const endpoint = enabled ? "enable" : "disable";
      await fetch(`${ENGINE_URL}/api/strategies/${strategyId}/${endpoint}`, {
        method: "POST",
      });
      setStrategies((prev) =>
        prev.map((s) => (s.id === strategyId ? { ...s, enabled } : s))
      );
    },
    []
  );

  return { strategies, loading, error, updateParam, toggleEnabled, refetch: fetchStrategies };
}
