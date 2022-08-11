import { ClientToServerEvents, ServerToClientEvents } from "@/utils/types";
import { createContext, useContext, ReactNode } from "react";
import { io, Socket } from "socket.io-client";

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  process.env.NEXT_PUBLIC_WS_URL as string,
  {
    transports: ["websocket", "polling"],
  }
);

const SocketContext = createContext(socket);

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: ReactNode }) {
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
