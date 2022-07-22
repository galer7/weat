import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

const makeEventHandlers = (currentName: string, state: any, setState: any, socket: Socket): Record<string, (...args: any) => void> => {
  return {
    "tx:invite:sent": async (name, foodieGroupId) => {
      if (name === currentName) {
        
      }
    },
    "tx:invite:accepted": (name, foodieGroupId, newUserState) => {
      return // TODO
    },
    "tx:food:updated": (name, foodieGroupId, statePatch) => {
      return;
    }
  }
}

const socket = io("ws://localhost:3001");

export default function useSocket(currentName: string, state: any, setState: any) {
  const eventHandlers = makeEventHandlers(currentName, state, setState, socket);
  useEffect(() => {
    Object.entries(eventHandlers).forEach(([event, cb]) => {
      socket.on(event, cb)
    })

    return function useSocketCleanup() {
      Object.entries(eventHandlers).forEach(([event, cb]) => {
        socket.off(event, cb)
      })
    };
  }, [eventHandlers]);

  return socket;
}
