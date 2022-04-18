import socketIOClient from "socket.io-client";
import { conferenceNsps } from "../../../src/socket/nsps/conference/constants";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";

// Socket io setup
const ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/${conferenceNsps.prefix}`;

let socketObj = null;

const useChat = (meetingId) => {

  const [joined, setJoined] = useState(false);
  const [usersInRoom, setUsersInRoom] = useState([]);
  const dispatch = useDispatch();

  const loggedInUser = useSelector(
    (state) => state.Auth.loggedInUser
  );

  const handleConnectClient = () => {
    socketObj = socketIOClient(ENDPOINT, {
      transports: ["websocket"],
      query: `meetingId=${meetingId}`,
    });
    socketObj.emit(conferenceNsps.wsEvents.JOIN_ROOM);
    getAllUsersInRoom();
  };

  const handleDisconnectClient = () => {
    socketObj.disconnect();
  };

  const getAllUsersInRoom = () => {
    socketObj.on(conferenceNsps.wsEvents.ALL_USERS_IN_ROOM, (users) => {
      const nspMeetingId = users[`${conferenceNsps.prefix}:${meetingId}`];
      const usersInRoom = nspMeetingId.allUsersInRoom.map(user => {
        if (user.socketId === socketObj.socketId) {
          return {
            ...user,
            me: true
          }
        } else {
          return {
            ...user,
            me: false
          }
        }
      })
      setUsersInRoom(usersInRoom);
    });
  };

  return {
    socketObj,
    handleConnectClient,
    joined,
    setJoined,
    usersInRoom,
    handleDisconnectClient
  };
};

export default useChat;
