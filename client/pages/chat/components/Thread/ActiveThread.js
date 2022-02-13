import {useSelector} from 'react-redux'
import styles from "./../../../../src/assets/styles/chat/Thread.module.scss";
import { convertMessagesArrayToObjectForm } from '../../utils/messageFormatter';
import { chatActionTypes } from '../../../../src/store/chat/chat.actiontype';
import SinlgeMessage from '../Message';
import EditorArea from './../EditorArea';
import { useDispatch } from 'react-redux';
import useEmojiActions from './../../hooks/emojiActions'
import EmojiDropdown from './../EmojiDropdown'

let parentMessageIdKey = "parent-thread-message-id-";
let parentMessageActionIdKey = "parent-thread-message-action-id-";
let messageIdKey = "thread-message-id-";
let messageActionIdKey = "thread-message-action-id-";

const ActiveThread = ({ currentActiveThread }) => {

  const currentSelectedGroup = useSelector(state => state.Chat.currentSelectedGroup);
  const { chats: messages } = useSelector(state => state.Chat);
  let message = messages[currentActiveThread];
  let parentMessage = convertMessagesArrayToObjectForm({[message.id]: message});
  let threadReplies = parentMessage[message.id].replies;

  console.log(threadReplies)

  let updatedMessages = {}
  if (threadReplies) {
    // CONVERTING MESSAGES OBJECT TO DATE WISE MESSAGES OBJECT
    updatedMessages = convertMessagesArrayToObjectForm(threadReplies);
  }

  if (!parentMessage) return <div></div>;

  const dispatch = useDispatch();

  const closeThread = () => {
    dispatch({type: chatActionTypes.THREAD_MESSAGE_ID, data: null})
  }

  // HANDLING EMOJI RELATED EVENTS
  const {
    showEmojiDropdown,
    toggleEmojiDropdown,
    currentEmojiMessageId,
    handleEmojiPicker,
    handleChangeReaction
  } = useEmojiActions();

  return (
    <div className={styles.threadWrapper}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.heading}>Thread</span>
          <span className={styles.group}>(#{currentSelectedGroup.groupName})</span>
        </div>
        <div className={styles.action} onClick={() => closeThread()}>
          close
        </div>
      </div>
      <div className={styles.container}>
        <div className={styles.parentMessage}>
          {Object.keys(parentMessage).map((messageId) => {
            return (
              <SinlgeMessage
                key={messageId}
                message={parentMessage[messageId]}
                messageIdKey={parentMessageIdKey}
                messageActionIdKey={parentMessageActionIdKey}
                loggedInUser={true}
                handleEmojiPicker={handleEmojiPicker}
                handleChangeReaction={handleChangeReaction}
                handleCurrentActiveThread={() => {}}
                thread={true}
              />
            );
          })}
        </div>
        <div className={styles.separator}>
          Total Replies ({threadReplies ? Object.keys(threadReplies).length : null}) 
        </div>
        <div className={styles.replies}>
          {updatedMessages && Object.keys(updatedMessages).map((messageId) => {
            return (
              <SinlgeMessage
                key={messageId}
                message={updatedMessages[messageId]}
                messageIdKey={messageIdKey}
                messageActionIdKey={messageActionIdKey}
                loggedInUser={true}
                handleEmojiPicker={handleEmojiPicker}
                handleChangeReaction={handleChangeReaction}
                handleCurrentActiveThread={() => {}}
                thread={true}
              />
            );
          })}
        </div>
      </div>
      <div className={styles.threadTextArea}>
        <EditorArea parentId={currentActiveThread}/>
      </div>
      <EmojiDropdown
        show={showEmojiDropdown}
        toggle={toggleEmojiDropdown}
        messageId={currentEmojiMessageId}
      />
    </div>
  );
};

export default ActiveThread;
