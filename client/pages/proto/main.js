import styles from "./../../src/assets/styles/proto/Event.module.scss";
import RunningVideoCall from "./components/RunningVideoCall";
import WaitingForJoinCall from "./components/WaitingForJoinCall";

const Conversation = () => {
  return (
    <div className={styles.eventWrapper}>
      {false && <RunningVideoCall />}
      <WaitingForJoinCall />
    </div>
  );
};

export default Conversation;
