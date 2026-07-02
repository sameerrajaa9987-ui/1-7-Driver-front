import { io, Socket } from "socket.io-client";
import { environment } from "@config/env";
import { useAuthStore } from "../store/useAuthStore";

/**
 * Single shared Socket.IO connection for live tracking + notifications. The
 * server places the client in its user/org/role rooms from the JWT (see backend
 * config/socket.js). Reconnects with the current token whenever auth changes.
 */
let socket: Socket | null = null;

export function getSocket(): Socket {
  const token = useAuthStore.getState().token;
  if (socket && socket.connected) return socket;
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  socket = io(environment.socketUrl, {
    transports: ["websocket"],
    query: token ? { token } : undefined,
    auth: token ? { token } : undefined,
    autoConnect: true,
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/** Subscribe to an event; returns an unsubscribe fn. */
export function onSocket<T = unknown>(
  event: string,
  handler: (payload: T) => void,
): () => void {
  const s = getSocket();
  s.on(event, handler as (p: unknown) => void);
  return () => s.off(event, handler as (p: unknown) => void);
}

export function emitSocket(event: string, payload?: unknown) {
  getSocket().emit(event, payload);
}
