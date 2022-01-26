import styles from "./../../../src/assets/styles/chat/MessageBox1.module.scss";
import emojiStyles from "./../../../src/assets/styles/components/Emoji/emoji.module.scss"
import Moment from "react-moment";
import {
  MdOutlineEmojiEmotions,
  MdDeleteOutline,
  MdModeEditOutline,
  MdReply,
} from "react-icons/md";
import { Emoji } from 'emoji-mart'

let testEmojiObj = {
  1: ':santa::skin-tone-3:',
  2: ':grinning:',
  3: ':sweat_smile:',
  4: ':innocent:',
  5: ':triumph:',
  6: ':man-man-girl-boy:',
  7: ':man-man-girl-boy:',
  8: ':tangerine:',
  9: ':spades:',
  10: ':flag-in:',
}

const ShowMessage = ({ message, handleEmojiPicker }) => {
  return (
    <div className={styles.messageTextWrapper}>
      {message.message}
      <div className={emojiStyles.emojiContainer}>
        {
          Math.floor(Math.random() * (10) + 1) % 2 === 0
          &&
          Array.from(Array(Math.floor(Math.random() * (10) + 1)), (i, e) => {
            return (
              <div className={`${emojiStyles.emojiWrapper} ${Math.floor(Math.random() * (10) + 1) % 2 === 0 ? emojiStyles.reacted : ''}`} key={i+''+Math.floor(Math.random() * (10) + 1)}>
                <div className={emojiStyles.emoji}>
                  <Emoji emoji={testEmojiObj[Math.floor(Math.random() * (10) + 1)]} size={16} />
                </div>
                <div className={emojiStyles.count}>
                  {Math.floor(Math.random() * (53) + 1)}
                </div>
              </div>
            )
          })
        }
      </div>
      <div className={styles.quickActions} id={`message-id-${message.id}`}>
        <div className={styles.actionsContainer}>
          <div className={styles.icon} onClick={() => handleEmojiPicker(`message-id-${message.id}`)}>
            <MdOutlineEmojiEmotions />
          </div>
          <div className={styles.icon}>
            <MdReply />
          </div>
          <div className={styles.icon}>
            <MdDeleteOutline />
          </div>
          <div className={styles.icon}>
            <MdModeEditOutline />
          </div>
        </div>
      </div>
    </div>
  );
};

const MessageBox = ({ message, handleEmojiPicker }) => {
  return (
    <div className={`${styles.messageBoxWrapper}`}>
      <div className={`${styles.profileWrapper} ${styles.messagePos}`}>
        <div className={styles.profileImage}>
          <img src={message.dp} />
        </div>
        <div className={styles.profileDetailWrapper}>
          <div className={styles.profileDetail}>
            <span className={styles.name}>
              {message.firstName} {message.lastName}
            </span>
            <span className={styles.messagedOn}>
              <Moment format="MMMM Do YYYY, h:mm A">{message.updatedAt}</Moment>
            </span>
          </div>
          <div className={styles.messageTextWrapper}>
            <ShowMessage 
              message={message} 
              firstMessageInGroup={true} 
              handleEmojiPicker={handleEmojiPicker}
            />
          </div>
        </div>
      </div>
      {"groupedMessages" in message &&
        Object.keys(message.groupedMessages).map((messageId) => {
          return (
            <div className={`${styles.profileWrapper} ${styles.messagePosChild}`} key={messageId}>
              <div className={`${styles.profileImage} ${styles.profileImageWrapper}`}>
                <div className={styles.messageOnInHHMM}>
                  <Moment format="h:mm A">{message.groupedMessages[messageId].updatedAt}</Moment>
                </div>
              </div>
              <div className={styles.profileDetailWrapper}>
                <div className={styles.messageTextWrapper}>
                  <ShowMessage
                    message={message.groupedMessages[messageId]}
                    key={messageId}
                    firstMessageInGroup={false}
                    handleEmojiPicker={handleEmojiPicker}
                  />
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default MessageBox;
