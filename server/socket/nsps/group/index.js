let nsp;

const onConnection = (socket) => {
  const socketId = socket.id;
  console.log('socketId', socketId);

  socket.emit("connection-success", {
    socketId,
  });
};

exports.groupNamespace = (io) => {
  exports.io = io;
  nsp = io
    .of("/mediasoup")
    .use(async (socket, next) => {
      // let checkUser = await isAuthenticated(socket);
      // if (checkUser) {
      //   next();
      // } else {
      //   next(new Error("Authentication error"));
      // }
      next();
    })
    .on("connection", onConnection);
};
