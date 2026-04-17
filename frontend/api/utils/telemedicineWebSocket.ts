import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'sonner';

export interface WebSocketMessage {
  type: string;
  appointmentId: string;
  userId?: string;
  roomName?: string;
  status?: string;
}

export class TelemedicineWebSocketService {
  private client: Client | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, (message: WebSocketMessage) => void> = new Map();

  constructor(private baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080') {}

  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.client && this.isConnected) {
        resolve();
        return;
      }

      const socketUrl = `${this.baseUrl}/ws`;
      const socket = new SockJS(socketUrl);

      this.client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        debug: (str) => {
          console.log('WebSocket Debug:', str);
        },
        reconnectDelay: this.reconnectDelay,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = (frame) => {
        console.log('Connected to WebSocket:', frame);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        resolve();
      };

      this.client.onStompError = (frame) => {
        console.error('STOMP error:', frame.headers['message']);
        console.error('Details:', frame.body);
        this.isConnected = false;
        reject(new Error(frame.headers['message'] || 'STOMP connection error'));
      };

      this.client.onWebSocketClose = () => {
        console.log('WebSocket connection closed');
        this.isConnected = false;
        this.attemptReconnect(token);
      };

      this.client.onWebSocketError = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected = false;
        reject(error);
      };

      this.client.activate();
    });
  }

  private attemptReconnect(token?: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      toast.error('Lost connection to server. Please refresh the page.');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      this.connect(token).catch((error) => {
        console.error('Reconnection failed:', error);
      });
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  subscribeToSession(appointmentId: string, callback: (message: WebSocketMessage) => void) {
    if (!this.client || !this.isConnected) {
      console.warn('WebSocket not connected. Cannot subscribe to session.');
      return;
    }

    const subscription = this.client.subscribe(`/topic/telemedicine/session/${appointmentId}`, (message) => {
      try {
        const data: WebSocketMessage = JSON.parse(message.body);
        console.log('Received WebSocket message:', data);
        callback(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    });

    console.log(`Subscribed to session: ${appointmentId}`);
    return subscription;
  }

  joinSession(appointmentId: string, userId: string) {
    if (!this.client || !this.isConnected) {
      console.warn('WebSocket not connected. Cannot join session.');
      return;
    }

    this.client.publish({
      destination: `/app/telemedicine/session/${appointmentId}/join`,
      body: userId,
    });

    console.log(`Joined session: ${appointmentId} as user: ${userId}`);
  }

  leaveSession(appointmentId: string, userId: string) {
    if (!this.client || !this.isConnected) {
      console.warn('WebSocket not connected. Cannot leave session.');
      return;
    }

    this.client.publish({
      destination: `/app/telemedicine/session/${appointmentId}/leave`,
      body: userId,
    });

    console.log(`Left session: ${appointmentId} as user: ${userId}`);
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
      console.log('WebSocket disconnected');
    }
  }

  // Handle network disconnections and reconnections
  handleNetworkReconnection(token?: string) {
    if (!this.isConnected && this.reconnectAttempts < this.maxReconnectAttempts) {
      console.log('Attempting to reconnect WebSocket due to network recovery...');
      this.connect(token).catch((error) => {
        console.error('Network reconnection failed:', error);
      });
    }
  }

  // Check connection health and attempt recovery
  checkConnectionHealth() {
    if (!this.isConnected) {
      console.warn('WebSocket connection is unhealthy');
      // Attempt recovery
      const token = localStorage.getItem('token');
      this.handleNetworkReconnection(token || undefined);
    }
  }

  // Session recovery - rejoin active sessions after reconnection
  recoverSessions(activeSessions: string[], userId: string) {
    if (this.isConnected && activeSessions.length > 0) {
      console.log('Recovering sessions after reconnection:', activeSessions);
      activeSessions.forEach(appointmentId => {
        this.subscribeToSession(appointmentId, (message) => {
          // Handle recovered session messages
          console.log('Recovered session message:', message);
        });
        this.joinSession(appointmentId, userId);
      });
    }
  }

  // Start periodic health checks
  startHealthChecks(intervalMs: number = 30000) {
    setInterval(() => {
      this.checkConnectionHealth();
    }, intervalMs);
  }

  isWebSocketConnected(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
export const telemedicineWebSocket = new TelemedicineWebSocketService();