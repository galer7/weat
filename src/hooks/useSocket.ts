import { useEffect } from "react";
import { io } from "socket.io-client";

const makeEventHandlers = (foodieGroupState: any, setFoodieGroupState: any): Record<string, (...args: any) => void> => {
  return {
    "tx:invite:sent": (name, foodieGroupId) => {
      return // TODO
    },
    "tx:invite:accepted": (name, foodieGroupId) => {
      return // TODO
    },
  }
}

const socket = io("ws://localhost:3001");

export default function useSocket(foodieGroupState: any, setFoodieGroupState: any) {
  const eventHandlers = makeEventHandlers(foodieGroupState, setFoodieGroupState);
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
