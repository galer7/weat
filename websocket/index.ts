import { Server, Socket } from 'socket.io'
const io = new Server(3001, {
  cors: {
    origin: '*'
  }
});

// TODO: treat reconnect logic

io.on("rx:invite:sent", (socket: Socket, name: string, foodieGroupId: string) => {
  // create room on first group invite sent
  socket.emit("tx:invite:sent", name)
  socket.join(foodieGroupId)
})

io.on("rx:invite:accepted", (socket: Socket, foodieGroupId: string, newUserState: any) => {
  // add socket which accepted the invite to the room
  socket.join(foodieGroupId)
  socket.to(foodieGroupId).emit("tx:invite:accepted", newUserState)
})