import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "./../../src/assets/styles/proto/Event.module.scss";
import RunningVideoCall from "./components/RunningVideoCall";
import WaitingForJoinVideoCall from "./components/WaitingForJoinVideoCall";
import socketIOClient from "socket.io-client";
import { callNsps } from "../../src/socket/nsps/call/constants";

let socket = null;
const ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/call`;

const Conversation = () => {
  const router = useRouter();
  const [callJoined, setCallJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [usersInRoom, setUsersInRoom] = useState(false);

  useEffect(() => {
    socket = socketIOClient(ENDPOINT, {
      transports: ["websocket"],
      query: `callId=${router.query.callId}`,
    });

    socket.emit(callNsps.wsEvents.JOINING_ROOM);

    socket.on(callNsps.wsEvents.ALL_USERS_IN_ROOM, ({ allUsersInRoom }) => {
      setUsersInRoom(allUsersInRoom);
    });

    return () => socket.disconnect();
  }, []);

  const joinCall = () => {
    socket.emit(callNsps.wsEvents.ROOM_JOINED);
  };

  const handleJoinCall = () => {
    joinCall();
    setJoining(false);
  };
  return (
    <div className={styles.eventWrapper}>
      {callJoined && <RunningVideoCall handleJoinCall={handleJoinCall} />}
      {!callJoined && (
        <WaitingForJoinVideoCall
          setJoining={setJoining}
          setCallJoined={setCallJoined}
          joining={joining}
          usersInRoom={usersInRoom.length}
        />
      )}
    </div>
  );
};

export default Conversation;
