const { isAuthenticated } = require("./../../utils/isAuthenticated");
const { chatNsps } = require("./constants");
const UserRedis = require("./../../redis/Users");
const events = require('./events');
const { getRoomName } = require('./../../room/index')

let nsp;

const onConnection = (socket) => {
  const user = socket.currentConnectedUser;
  const socketId = socket.id;
  const { groupId } = socket.handshake.query;
  let roomName = getRoomName(groupId, chatNsps); // getting room name with discussion prefix
  if (!roomName) return;

  let finalObj = (roomName, resObj) => {
    return {
      [roomName]: resObj
    }
  }

  socket.on(chatNsps['wsEvents']['JOIN_ROOM'], async () => {
    try {
      await socket.join(roomName);
      await UserRedis.addUserToRoom(roomName, socketId , user);
      const allUsersInRoom = await UserRedis.getAllUsersInRoom(roomName);
      nsp.to(roomName).emit(chatNsps['wsEvents']['ALL_USERS_IN_ROOM'], finalObj(roomName, {
        allUsersInRoom,
        newUser: user,
      }));
    } catch (error) {
      console.log(`Socket.on Error - ${chatNsps["wsEvents"]["joinRoom"]} namespace `, error);
    }
  });

  socket.on(chatNsps['wsEvents']['ADD_NEW_MESSAGE'], events.addNewMessage(socket, roomName))
  socket.on(chatNsps['wsEvents']['ADD_NEW_REPLY'], events.addNewReply(socket, roomName))
  socket.on(chatNsps['wsEvents']['ADD_EMOJI_IN_MESSAGES'], events.addEmojiInMessage(socket, roomName))
  socket.on(chatNsps['wsEvents']['UPDATE_MESSAGE'], events.updateMessage(socket, roomName))
  socket.on(chatNsps['wsEvents']['DELETE_MESSAGE'], events.deleteMessage(socket, roomName))
  

  socket.on("disconnect", async () => {
    try {
      await UserRedis.removeUserFromRoom(roomName, socketId);
      let allUsersInRoom = await UserRedis.getAllUsersInRoom(roomName);
      nsp.to(roomName).emit(chatNsps['wsEvents']['ALL_USERS_IN_ROOM'], finalObj(roomName, {
        allUsersInRoom,
        leftUser: user,
      }));
    } catch (error) {
      console.log(`Socket.on Disconnect - ${discussionNsps["wsEvents"]["joinRoom"]} namespace `, error);
    }
  });

  // socket.onAny((event, ...args) => {
  //   console.log(event, args);
  // });
};

exports.chatNamespace = (io) => {
  exports.io = io;
  nsp = io
    .of("/chat")
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
