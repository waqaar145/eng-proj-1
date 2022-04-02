const { isAuthenticated } = require("./../../utils/isAuthenticated");
const { conferenceNsps } = require('./constants')

let nsp;

const getRoomName = (room) => {
  if (!room) return;
  let nspTitle = conferenceNsps.prefix;
  return `${nspTitle}:${room}`;
};

const onConnection = (socket) => {
  const user = socket.currentConnectedUser;
  const socketId = socket.id;
  const { meetingId } = socket.handshake.query;
  let roomName = getRoomName(meetingId); // getting room name with discussion prefix
  if (!roomName) return;

  let finalObj = (roomName, resObj) => {
    return {
      [roomName]: resObj
    }
  }

  socket.on(conferenceNsps['wsEvents']['JOIN_ROOM'], async () => {
    try {
      await socket.join(roomName);
      
    } catch (error) {
      console.log(error);
    }
  });
  
  socket.on("disconnect", async () => {
    console.log('Socket Disconnected');
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
