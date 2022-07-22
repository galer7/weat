import { Server, Socket } from "socket.io";
import superjson from "superjson";
const io = new Server(3001, {
  cors: {
    origin: "*",
  },
});

const m = new Map();
// TODO: treat reconnect logic

// io.on("user:first:render", (socket: Socket) => {
//   socket.emit("server:first:render", {
//     state: superjson.stringify(foodieGroupMap),
//   });
// });

io.on(
  "user:invite:sent",
  (
    socket: Socket,
    {
      from,
      to,
      foodieGroupId,
      fromUserState,
    }: {
      from: string;
      to: string;
      foodieGroupId: string;
      fromUserState: object;
    }
  ) => {
    // create room on first group invite sent
    socket.emit("server:invite:sent", { from, to, foodieGroupId });
    socket.join(foodieGroupId);

    // if it is the first invite, the sender sends its user state also
    if (!m.has(foodieGroupId)) {
      m.set(
        foodieGroupId,
        new Map([
          [from, fromUserState],
          [to, {}],
        ])
      );
    } else {
      m.set(foodieGroupId, new Map([[to, {}]]));
    }
  }
);

io.on(
  "user:invite:accepted",
  (
    socket: Socket,
    {
      name,
      foodieGroupId,
      userState,
    }: { name: string; foodieGroupId: string; userState: any }
  ) => {
    // add socket which accepted the invite to the room
    socket.join(foodieGroupId);

    // update group state so that we can render RT updates
    const foodieGroupMap: Map<string, object> | undefined =
      m.get(foodieGroupId);
    if (!foodieGroupMap)
      console.log(`user ${name} does not exist on FG ${foodieGroupId}`);
    foodieGroupMap.set(name, userState);

    socket.to(foodieGroupId).emit("server:state:updated", {
      state: superjson.stringify(foodieGroupMap.get(name)),
      name,
    });
  }
);

io.on(
  "user:state:updated",
  (socket: Socket, { name, foodieGroupId, userState }) => {
    // update group state so that we can render RT updates
    const foodieGroupMap: Map<string, object> | undefined =
      m.get(foodieGroupId);
    if (!foodieGroupMap)
      console.log(`user ${name} does not exist on FG ${foodieGroupId}`);
    foodieGroupMap.set(name, userState);

    socket.to(foodieGroupId).emit("server:state:updated", {
      state: superjson.stringify(foodieGroupMap.get(name)),
      name,
    });
  }
);

console.log("registered all handlers!");
