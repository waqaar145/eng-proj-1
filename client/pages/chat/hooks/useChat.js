import socketIOClient from "socket.io-client";
import { chatNsps } from "../../../src/socket/nsps/chat/constants";
import { chatActionTypes } from "../../../src/store/chat/chat.actiontype";
import { useDispatch, useSelector } from "react-redux";

// Socket io setup
const ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/${chatNsps.prefix}`;

let socketObj = {};

const useChat = (groupId) => {

  const dispatch = useDispatch();
  const extraChatCount = useSelector(
    (state) => state.Chat.extraChatCount
  );

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
    for (const [key] of Object.entries(socketObj)) {
      let socket = socketObj[key];
      socket.on(chatNsps.wsEvents.ALL_USERS_IN_ROOM, (data) => {
        // console.log(data)
      });
    }
  };

  const addNewMessageSocketEmitter = (data, scrollToBottom) => {
    socketObj[groupId].emit(chatNsps.wsEvents.ADD_NEW_MESSAGE, data, ({ data, process }) => {
      if (process) {
        let chatObj = {
          currentSocketKey: null,
          message: data,
        };
        dispatch({ type: chatActionTypes.ADD_NEW_MESSAGE, data: chatObj });
        scrollToBottom()
      }
    });
  };

  const onNewMessageReceive = () => {
    for (const [key] of Object.entries(socketObj)) {
      socketObj[key].on(chatNsps.wsEvents.SEND_MESSAGE_TO_ROOM, (data) => {
        let chatObj = {
          currentSocketKey: key,
          message: data,
        };
        dispatch({ type: chatActionTypes.ADD_NEW_MESSAGE, data: chatObj });
      });
    }
  };

  return {
    socketObj,
    handleConnectClients,
    handleDisconnectClients,
    addNewMessageSocketEmitter,
    onNewMessageReceive,
    extraChatCount
  };
};

export default useChat;
