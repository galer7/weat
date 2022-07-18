import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("ws://localhost:3001");
const EVENT_NAME = "hello from server";
const CB = (...args: any[]) => console.log(args)

export default function useSocket() {
  useEffect(() => {
    // send a message to the server
    socket.emit("hello from client", 5, "6", { 7: Uint8Array.from([8]) });

    // receive a message from the server
    socket.on(EVENT_NAME, CB);

    return function useSocketCleanup() {
      socket.off(EVENT_NAME, CB);
    };
  }, []);

  return socket;
}
