import styles from "./../../../src/assets/styles/proto/Chat.module.scss";

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

const Chat = () => {
  return (
    <div className={styles.messageContainer}>
      <div className={styles.messageBody}>
        <ul>
          {Array.from(Array(10), (e, i) => {
            let number = Math.ceil(getRandomArbitrary(1, 100));
            return (
              <li key={i} className={Number(number) % 2 === 0 ? styles.sender : styles.reply}>
                <p>hey man testing this function</p>
                <span className={styles.time}>10:32 AM</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Chat;
