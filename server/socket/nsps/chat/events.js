const { chatNsps } = require("./constants");

const addNewMessage = (nsp, roomName) => async (messageObj, callback) => {
  try {
    let data = messageObj;
    nsp.broadcast.to(roomName).emit(chatNsps.wsEvents.SEND_MESSAGE_TO_ROOM, data);
    callback({
      data,
      process: true
    });
  } catch (error) {
    console.log(error);
    callback({
      data,
      process: false
    });
  }
};

const addNewReply = (nsp, roomName) => async (messageObj, callback) => {
  try {
    let data = messageObj;
    nsp.broadcast.to(roomName).emit(chatNsps.wsEvents.SEND_REPLY_TO_ROOM, data);
    callback({
      data,
      process: true
    });
  } catch (error) {
    console.log(error);
    callback({
      data,
      process: false
    });
  }
};

const addEmojiInMessage = (nsp, roomName) => async (emojiObj, callback) => {
  try {
    let data = emojiObj;
    nsp.broadcast.to(roomName).emit(chatNsps.wsEvents.SEND_EMOJI_TO_ROOM, data);
    callback({
      data,
      process: true
    });
  } catch (error) {
    console.log(error);
    callback({
      data,
      process: false
    });
  }
};

const updateMessage = (nsp, roomName) => async (messageObj, callback) => {
  try {
    let data = messageObj;
    nsp.broadcast.to(roomName).emit(chatNsps.wsEvents.SEND_UPDATED_MESSAGE_TO_ROOM, data);
    callback({
      data,
      process: true
    });
  } catch (error) {
    console.log(error);
    callback({
      data,
      process: false
    });
  }
};

const deleteMessage  = (nsp, roomName) => async (messageObj, callback) => {
  try {
    let data = messageObj;
    nsp.broadcast.to(roomName).emit(chatNsps.wsEvents.SEND_DELETED_MESSAGE_TO_ROOM, data);
    callback({
      data,
      process: true
    });
  } catch (error) {
    console.log(error);
    callback({
      data,
      process: false
    });
  }
};

module.exports = {
  addNewMessage,
  addNewReply,
  addEmojiInMessage,
  updateMessage,
  deleteMessage
};