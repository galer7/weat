import { ClientToServerEvents, ServerToClientEvents } from "@/utils/types";
import {
  createContext,
  useContext,
  ReactNode,
  useReducer,
  Dispatch,
} from "react";
import { io, Socket } from "socket.io-client";

const makeSocket = (
  token?: string
): Socket<ServerToClientEvents, ClientToServerEvents> =>
  io(process.env.NEXT_PUBLIC_WS_URL as string, {
    transports: ["websocket", "polling"],
    ...(token && { auth: { token } }),
  });

const socket = makeSocket();

const SocketContext = createContext<{
  socket: typeof socket;
  dispatch: Dispatch<SocketReducerAction>;
}>({ socket, dispatch: () => {} });

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, dispatch] = useReducer(socketReducer, makeSocket());

  return (
    <SocketContext.Provider value={{ socket, dispatch }}>
      {children}
    </SocketContext.Provider>
  );
}

type SocketReducerAction = { type: "set-session-token"; token: string };

function socketReducer(_: typeof socket, action: SocketReducerAction) {
  switch (action.type) {
    case "set-session-token": {
      return makeSocket(action.token);
    }
  }
}
