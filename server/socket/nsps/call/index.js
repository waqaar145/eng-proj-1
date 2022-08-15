const mediasoup = require("mediasoup");

const onConnection = async (socket) => {
  socket.emit("connection-success", {
    socketId: socket.id,
  });
}

exports.callNamespace = (io) => {
  exports.io = io;
  nsp = io
    .of("/call")
    .use(async (socket, next) => {
      next();
    })
    .on("connection", onConnection);
};
