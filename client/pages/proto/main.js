import { useState } from "react";
import styles from "./../../src/assets/styles/proto/Event.module.scss";
import RunningVideoCall from "./components/RunningVideoCall";
import WaitingForJoinVideoCall from "./components/WaitingForJoinVideoCall";

const Conversation = () => {
  const [callJoined, setCallJoined] = useState(false)
  return (
    <div className={styles.eventWrapper}>
      {callJoined && <RunningVideoCall />}
      {!callJoined && <WaitingForJoinVideoCall setCallJoined={setCallJoined}/>}
    </div>
  );
};

export default Conversation;
