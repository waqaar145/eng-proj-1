import styles from "./../../../src/assets/styles/proto/Event.module.scss";

const WaitingForJoinCall = () => {
  return (
    <div className={styles.joinRoom}>
      <div className={styles.video}>
        <div className={styles.header}>Title of this call</div>
        <div className={styles.body}>
          <video autoPlay></video>
        </div>
        <div className={styles.footer}>Footer</div>
      </div>
    </div>
  );
};

export default WaitingForJoinCall;
