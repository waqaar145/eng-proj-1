const chatNsps = {
  prefix: "chat",
  wsEvents: {
    JOIN_ROOM: "JOIN_ROOM",
    ALL_USERS_IN_ROOM: "ALL_USERS_IN_ROOM",
    ADD_NEW_MESSAGE: "ADD_NEW_MESSAGE",
    SEND_MESSAGE_TO_ROOM: "SEND_MESSAGE_TO_ROOM",
    ADD_NEW_REPLY: "ADD_NEW_REPLY",
    SEND_REPLY_TO_ROOM: "SEND_REPLY_TO_ROOM"
  },
};

module.exports = {
  chatNsps
}