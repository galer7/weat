const { Server } = require('socket.io')
const io = new Server(3001, {
  cors: {
    origin: '*'
  }
});

io.on("connection", (socket: any) => {
  // send a message to the client
  socket.emit("hello from server", 1, "2", { 3: Buffer.from([4]) });

  // receive a message from the client
  socket.on("hello from client", (...args: any) => {
    console.log(args)
  });
});

export { }