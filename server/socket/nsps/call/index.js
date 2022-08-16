const { isAuthenticated } = require("./../../utils/isAuthenticated");
const { callNsps } = require("./constants");
const UserRedis = require("./../../redis/Users");
const events = require("./events");
const { getRoomName } = require("./../../room/index");

const onConnection = async (socket) => {
  const user = socket.currentConnectedUser;
  const socketId = socket.id;
  const { callId } = socket.handshake.query;

  let roomName = getRoomName(callId, callNsps); // getting room name with discussion prefix
  console.log(roomName)
  if (!roomName) return;

  let finalObj = (roomName, resObj) => {
    return {
      [roomName]: resObj,
    };
  };

  console.log("FinalObj - ", finalObj(roomName, ));

  socket.emit("connection-success", {
    socketId: socket.id,
  });
};

exports.callNamespace = (io) => {
  exports.io = io;
  nsp = io
    .of("/call")
    .use(async (socket, next) => {
      let checkUser = await isAuthenticated(socket);
      if (checkUser) {
        next();
      } else {
        next(new Error("Authentication error"));
      }
    })
    .on("connection", onConnection);
};
