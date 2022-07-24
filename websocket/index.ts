import { Server, Socket } from "socket.io";
import superjson from "superjson";
const io = new Server(3001, {
  cors: {
    origin: "*",
  },
});

const m: Map<string, Map<string, any>> = new Map();
// TODO: treat reconnect logic

// io.on("user:first:render", (socket: Socket) => {
//   socket.emit("server:first:render", {
//     state: superjson.stringify(foodieGroupMap),
//   });
// });

io.on("connection", (socket: Socket) => {
  socket.on("user:invite:sent", (from, to, foodieGroupId, fromUserState) => {
    // create room on first group invite sent
    console.log("received user:invite:sent", {
      from,
      to,
      foodieGroupId,
      fromUserState,
    });

    // send to all users ever unfortunately
    io.emit("server:invite:sent", from, to, foodieGroupId);
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
      m.get(foodieGroupId).set(to, {});
    }

    console.log("map after invite sent", m);
  });

  socket.on("user:invite:accepted", (name, foodieGroupId, userState) => {
    // add socket which accepted the invite to the room
    socket.join(foodieGroupId);

    // update group state so that we can render RT updates
    const foodieGroupMap: Map<string, object> | undefined =
      m.get(foodieGroupId);
    if (!foodieGroupMap)
      console.log(`user ${name} does not exist on FG ${foodieGroupId}`);
    foodieGroupMap.set(name, userState);

    foodieGroupMap.forEach((userState, name) => {
      io.to(foodieGroupId).emit(
        "server:state:updated",
        superjson.stringify(userState),
        name
      );
    });
  });

  socket.on("user:state:updated", (name, foodieGroupId, userState) => {
    console.log("received user:state:updated event", {
      name,
      foodieGroupId,
      userState,
    });

    console.log(m);
    // update group state so that we can render RT updates
    if (!m.get(foodieGroupId)) {
      console.log(`user ${name} does not exist on FG ${foodieGroupId}`);
      // TODO: remove this, it should theoretically exist already
      m.set(foodieGroupId, new Map());
    }
    const foodieGroupMap: Map<string, object> | undefined =
      m.get(foodieGroupId);
    foodieGroupMap.set(name, userState);

    console.log(m);

    io.to(foodieGroupId).emit(
      "server:state:updated",
      superjson.stringify(foodieGroupMap.get(name)),
      name
    );
  });
});

console.log("registered all handlers!");
