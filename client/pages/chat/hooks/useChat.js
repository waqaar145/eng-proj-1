import socketIOClient from "socket.io-client";
import { chatNsps } from "../../../src/socket/nsps/chat/constants";

// Socket io setup
const ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/${chatNsps.prefix}`;
let socketObj = {};

const useChat = () => {
  const handleConnectClients = (groups) => {
    for (let group of groups) {
      let { uuid } = group;
      socketObj[uuid] = socketIOClient(ENDPOINT, {
        transports: ["websocket"],
        query: `groupId=${uuid}`,
      });
      socketObj[uuid].emit(chatNsps.wsEvents.JOIN_ROOM);
    }
    getAllUsersInRoom();
  };

  const handleDisconnectClients = () => {
    for (const [key] of Object.entries(socketObj)) {
      socketObj[key].disconnect();
    }
  };

  const getAllUsersInRoom = () => {
    console.log(socketObj)
    for (const [key] of Object.entries(socketObj)) {
      let socket = socketObj[key];
      socket.on(discussionNsps.wsEvents.ALL_USERS_IN_ROOM, (data) => {
        console.log(data)
      });
    }
  }

  return {
    socketObj,
    handleConnectClients,
    handleDisconnectClients
  };
};

export default useChat;
