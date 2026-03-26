import { io, Socket } from 'socket.io-client';

const API_URL = 'https://redalert.orielhaim.com';
const API_KEY =
  'pr_lWIlcPmNGSpucLeynXRRzgQqJaYyJQDsAreQdydMrHaRjBdhkTvoHbyzkXRAJvEQ';

export interface RedAlert {
  type: string;
  title: string;
  cities: string[];
  instructions: string;
}

export interface DisplayAlert extends RedAlert {
  id: string;
  timestamp: number;
  isEnd: boolean;
}

type AlertCallback = (alerts: DisplayAlert[]) => void;
type EndAlertCallback = (alert: DisplayAlert) => void;
type ConnectionCallback = (connected: boolean) => void;

let socket: Socket | null = null;
let alertCallbacks: AlertCallback[] = [];
let endAlertCallbacks: EndAlertCallback[] = [];
let connectionCallbacks: ConnectionCallback[] = [];
let alertCounter = 0;

function generateId(): string {
  alertCounter += 1;
  return `alert_${Date.now()}_${alertCounter}`;
}

export function connectSocket(): void {
  if (socket?.connected) return;

  socket = io(API_URL, {
    auth: { apiKey: API_KEY },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on('connect', () => {
    console.log('Socket connected');
    connectionCallbacks.forEach((cb) => cb(true));
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
    connectionCallbacks.forEach((cb) => cb(false));
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
    connectionCallbacks.forEach((cb) => cb(false));
  });

  socket.on('alert', (data: RedAlert[]) => {
    const displayAlerts: DisplayAlert[] = data.map((a) => ({
      ...a,
      id: generateId(),
      timestamp: Date.now(),
      isEnd: false,
    }));
    alertCallbacks.forEach((cb) => cb(displayAlerts));
  });

  socket.on('endAlert', (data: RedAlert) => {
    const displayAlert: DisplayAlert = {
      ...data,
      id: generateId(),
      timestamp: Date.now(),
      isEnd: true,
    };
    endAlertCallbacks.forEach((cb) => cb(displayAlert));
  });
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function isConnected(): boolean {
  return socket?.connected ?? false;
}

export function onAlert(callback: AlertCallback): () => void {
  alertCallbacks.push(callback);
  return () => {
    alertCallbacks = alertCallbacks.filter((cb) => cb !== callback);
  };
}

export function onEndAlert(callback: EndAlertCallback): () => void {
  endAlertCallbacks.push(callback);
  return () => {
    endAlertCallbacks = endAlertCallbacks.filter((cb) => cb !== callback);
  };
}

export function onConnectionChange(callback: ConnectionCallback): () => void {
  connectionCallbacks.push(callback);
  return () => {
    connectionCallbacks = connectionCallbacks.filter((cb) => cb !== callback);
  };
}
