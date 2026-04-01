import { useEffect, useRef, useCallback, useState } from "react";
import type { WsEvent } from "../types/trade";

const ENGINE_URL = import.meta.env.VITE_ENGINE_URL ?? "http://localhost:8000";
const WS_URL = ENGINE_URL.replace(/^http/, "ws") + "/ws";

export function useWebSocket(onEvent: (event: WsEvent) => void) {
  const ws = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    const socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      setConnected(true);
    };

    socket.onmessage = (msg) => {
      try {
        const event: WsEvent = JSON.parse(msg.data);
        onEvent(event);
      } catch {
        // ignore malformed messages
      }
    };

    socket.onclose = () => {
      setConnected(false);
      // Reconnect after 3s
      setTimeout(connect, 3000);
    };

    socket.onerror = () => {
      socket.close();
    };

    ws.current = socket;
  }, [onEvent]);

  useEffect(() => {
    connect();
    return () => {
      ws.current?.close();
    };
  }, [connect]);

  return { connected };
}
