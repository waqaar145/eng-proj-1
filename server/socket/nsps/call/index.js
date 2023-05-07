const { isAuthenticated } = require("../../utils/isAuthenticated");
const { callNsps } = require("./constants");
const UserRedis = require("../../redis/Users");
const events = require("./events");
const { getRoomName } = require("../../room/index");

let nsp;

const onConnection = async (socket) => {
  const user = socket.currentConnectedUser;
  const socketId = socket.id;
  const { callId } = socket.handshake.query;

  let roomName = getRoomName(callId, callNsps); // getting room name with discussion prefix
  if (!roomName) return;

  let finalObj = (resObj) => {
    return resObj;
  };

  socket.on(callNsps['wsEvents']['JOINING_ROOM'], async () => {
    try {
      await socket.join(roomName);
      const allUsersInRoom = await UserRedis.getAllUsersInRoom(roomName);
      nsp.to(roomName).emit(callNsps['wsEvents']['ALL_USERS_IN_ROOM'], finalObj({
        allUsersInRoom,
        newUser: user,
      }));
    } catch (error) {
      console.log(`Socket.on Error - ${callNsps["wsEvents"]["JOINING_ROOM"]} namespace `, error);
    }
  });

  socket.on(callNsps['wsEvents']['ROOM_JOINED'], async () => {
    try {
      await UserRedis.addUserToRoom(roomName, socketId , user);
      const allUsersInRoom = await UserRedis.getAllUsersInRoom(roomName);
      nsp.to(roomName).emit(callNsps['wsEvents']['ALL_USERS_IN_ROOM'], finalObj({
        allUsersInRoom,
        newUser: user,
      }));
    } catch (error) {
      console.log(`Socket.on Error - ${callNsps["wsEvents"]["ROOM_JOINED"]} namespace `, error);
    }
  });

  socket.on("disconnect", async () => {
    try {
      await UserRedis.removeUserFromRoom(roomName, socketId);
      let allUsersInRoom = await UserRedis.getAllUsersInRoom(roomName);
      nsp.to(roomName).emit(callNsps['wsEvents']['ALL_USERS_IN_ROOM'], finalObj({
        allUsersInRoom,
        leftUser: user,
      }));
    } catch (error) {
      console.log(`Socket.on Disconnect - callNsps namespace `, error);
    }
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
