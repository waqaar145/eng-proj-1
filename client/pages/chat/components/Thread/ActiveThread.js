import {useSelector} from 'react-redux'
import styles from "./../../../../src/assets/styles/chat/Thread.module.scss";
import { convertMessagesArrayToObjectForm } from '../../utils/messageFormatter';
import SinlgeMessage from '../Message';

const ActiveThread = ({ currentActiveThread }) => {

  const currentSelectedGroup = useSelector(state => state.Chat.currentSelectedGroup);
  const { chats: messages } = useSelector(state => state.Chat);
  let message = messages[currentActiveThread];
  let updatedMessages = convertMessagesArrayToObjectForm({[message.id]: message});

  return (
    <div className={styles.threadWrapper}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.heading}>Thread</span>
          <span className={styles.group}>(#{currentSelectedGroup.groupName})</span>
        </div>
        <div className={styles.action}>
          close
        </div>
      </div>
      <div className={styles.container}>
        {Object.keys(updatedMessages).map((messageId) => {
          return (
            <SinlgeMessage
              key={messageId}
              message={updatedMessages[messageId]}
              loggedInUser={true}
              handleEmojiPicker={() => {}}
              handleChangeReaction={() => {}}
              handleCurrentActiveThread={() => {}}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ActiveThread;
