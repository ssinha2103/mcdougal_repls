import { useEffect, useRef, useCallback } from "react";
import { queryClient } from "@/lib/queryClient";

export interface CrawlEvent {
  type: "crawl_progress" | "snapshot_update" | "run_status" | "section_progress" | "connected";
  runId?: string;
  completed?: number;
  failed?: number;
  total?: number;
  currentDomain?: string;
  snapshotId?: string;
  domainId?: string;
  domain?: string;
  status?: string;
  message?: string;
  sectionName?: string;
  sectionType?: string;
}

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data: CrawlEvent = JSON.parse(event.data);

        switch (data.type) {
          case "crawl_progress":
          case "snapshot_update":
          case "run_status":
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["/api/domains"] });
            queryClient.invalidateQueries({ queryKey: ["/api/runs"] });
            queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
            
            if (data.runId) {
              queryClient.invalidateQueries({ queryKey: ["/api/runs", data.runId] });
            }
            break;

          case "connected":
            console.log("WebSocket connection established");
            break;
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      wsRef.current = null;

      // Attempt to reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log("Attempting to reconnect WebSocket...");
        connect();
      }, 3000);
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { isConnected: wsRef.current?.readyState === WebSocket.OPEN };
}
