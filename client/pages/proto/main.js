import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "./../../src/assets/styles/proto/Event.module.scss";
import RunningVideoCall from "./components/RunningVideoCall";
import WaitingForJoinVideoCall from "./components/WaitingForJoinVideoCall";
import socketIOClient from "socket.io-client";
import { Device } from "mediasoup-client";

let socket = null;
const ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/call`;

const Conversation = () => {
  const router = useRouter();
  const [callJoined, setCallJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  useEffect(() => {
    socket = socketIOClient(ENDPOINT, {
      transports: ["websocket"],
      query: `callId=${router.query.callId}`,
    });

    socket.on("connection-success", ({ socketId }) => {
      console.log("connection-success", socketId);
    });
  }, []);

  const handleJoinCall = () => {
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
        />
      )}
    </div>
  );
};

export default Conversation;
