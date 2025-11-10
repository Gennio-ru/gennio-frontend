import io, { Socket } from "socket.io-client";

const baseUrl = import.meta.env.DEV
  ? import.meta.env.VITE_API_WS_URL || "http://localhost:3000"
  : "/";

export const socket: typeof Socket = io(baseUrl, {
  transports: ["websocket"],
  reconnection: true,
});
