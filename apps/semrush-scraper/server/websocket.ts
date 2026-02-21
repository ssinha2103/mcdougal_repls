import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";

export interface CrawlProgressEvent {
  type: "crawl_progress";
  runId: string;
  completed: number;
  failed: number;
  total: number;
  currentDomain?: string;
}

export interface SnapshotUpdateEvent {
  type: "snapshot_update";
  runId: string;
  snapshotId: string;
  domainId: string;
  domain: string;
  status: string;
}

export interface RunStatusEvent {
  type: "run_status";
  runId: string;
  status: string;
}

export interface SectionProgressEvent {
  type: "section_progress";
  runId: string;
  domain: string;
  sectionName: string;
  sectionType: string;
  status: "capturing" | "captured" | "failed";
}

export type CrawlEvent = CrawlProgressEvent | SnapshotUpdateEvent | RunStatusEvent | SectionProgressEvent;

class CrawlEventBroadcaster {
  private wss: WebSocketServer | null = null;

  initialize(server: Server) {
    this.wss = new WebSocketServer({ server, path: "/ws" });

    this.wss.on("connection", (ws: WebSocket) => {
      console.log("WebSocket client connected");

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
      });

      ws.on("close", () => {
        console.log("WebSocket client disconnected");
      });

      // Send initial connection message
      ws.send(
        JSON.stringify({
          type: "connected",
          message: "WebSocket connection established",
        })
      );
    });
  }

  broadcast(event: CrawlEvent) {
    if (!this.wss) return;

    const message = JSON.stringify(event);

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  broadcastProgress(runId: string, completed: number, failed: number, total: number, currentDomain?: string) {
    this.broadcast({
      type: "crawl_progress",
      runId,
      completed,
      failed,
      total,
      currentDomain,
    });
  }

  broadcastSnapshotUpdate(
    runId: string,
    snapshotId: string,
    domainId: string,
    domain: string,
    status: string
  ) {
    this.broadcast({
      type: "snapshot_update",
      runId,
      snapshotId,
      domainId,
      domain,
      status,
    });
  }

  broadcastRunStatus(runId: string, status: string) {
    this.broadcast({
      type: "run_status",
      runId,
      status,
    });
  }

  broadcastSectionProgress(
    runId: string,
    domain: string,
    sectionName: string,
    sectionType: string,
    status: "capturing" | "captured" | "failed"
  ) {
    this.broadcast({
      type: "section_progress",
      runId,
      domain,
      sectionName,
      sectionType,
      status,
    });
  }
}

export const crawlEventBroadcaster = new CrawlEventBroadcaster();
