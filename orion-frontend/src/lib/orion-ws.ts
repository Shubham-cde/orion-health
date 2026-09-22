// ====== ORION-Health WebSocket Service ======
// Direct connection to FastAPI WebSocket at localhost:8000

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";

type WsListener = (data: { type: string; status?: string; patient?: Record<string, unknown> }) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: WsListener[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  connect() {
    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log("[ORION WS] Connected");
        this.reconnectAttempts = 0;
        this.notifyListeners({ type: "CONNECTION", status: "connected" });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners(data);
        } catch (error) {
          console.error("[ORION WS] Failed to parse message:", error);
        }
      };

      this.ws.onerror = () => {
        this.notifyListeners({ type: "CONNECTION", status: "error" });
      };

      this.ws.onclose = () => {
        console.log("[ORION WS] Disconnected");
        this.notifyListeners({ type: "CONNECTION", status: "disconnected" });
        this.attemptReconnect();
      };
    } catch (error) {
      console.error("[ORION WS] Failed to connect:", error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `[ORION WS] Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );
      setTimeout(() => this.connect(), this.reconnectDelay);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  subscribe(callback: WsListener): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notifyListeners(data: Parameters<WsListener>[0]) {
    this.listeners.forEach((cb) => cb(data));
  }
}

const wsService = new WebSocketService();
export default wsService;
