const { isAuthenticated } = require("./../../utils/isAuthenticated");
const { conferenceNsps } = require('./constants');
const { getRoomName } = require('./../../room/index');
const UserRedis = require("./../../redis/Users");

let nsp;

const onConnection = (socket) => {
  const user = socket.currentConnectedUser;
  const socketId = socket.id;
  const { meetingId } = socket.handshake.query;
  let roomName = getRoomName(meetingId, conferenceNsps); // getting room name with discussion prefix
  if (!roomName) return;

  let finalObj = (roomName, resObj) => {
    return {
      [roomName]: resObj
    }
  }

  socket.on(conferenceNsps['wsEvents']['JOIN_ROOM'], async () => {
    try {
      await socket.join(roomName);
      await UserRedis.addUserToRoom(roomName, socketId , user);
      const allUsersInRoom = await UserRedis.getAllUsersInRoom(roomName);
      nsp.to(roomName).emit(conferenceNsps['wsEvents']['ALL_USERS_IN_ROOM'], finalObj(roomName, {
        allUsersInRoom,
        newUser: user,
      }));
    } catch (error) {
      console.log(`Socket.on Error - ${conferenceNsps["wsEvents"]["joinRoom"]} namespace `, error);
    }
  });
  
  socket.on("disconnect", async () => {
    try {
      await UserRedis.removeUserFromRoom(roomName, socketId);
      let allUsersInRoom = await UserRedis.getAllUsersInRoom(roomName);
      nsp.to(roomName).emit(conferenceNsps['wsEvents']['ALL_USERS_IN_ROOM'], finalObj(roomName, {
        allUsersInRoom,
        leftUser: user,
      }));
    } catch (error) {
      console.log(`Socket.on Disconnect - ${discussionNsps["wsEvents"]["joinRoom"]} namespace `, error);
    }
  });

  socket.onAny((event, ...args) => {
    console.log(event, args);
  });
};

exports.conferenceNamespace = (io) => {
  exports.io = io;
  nsp = io
    .of("/conference")
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
