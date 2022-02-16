import styles from "./../../../src/assets/styles/chat/Message.module.scss";
import emojiStyles from "./../../../src/assets/styles/components/Emoji/emoji.module.scss"
import Moment from "react-moment";
import {
  MdOutlineEmojiEmotions,
  MdDeleteOutline,
  MdModeEditOutline,
  MdReply,
} from "react-icons/md";
import { Emoji } from 'emoji-mart';
import EditorArea from "./EditorArea";

const convertToCode = (key) => {
  let emojiObj = key.split('-');
  let emoji = {
    id: emojiObj.slice(0, emojiObj.length - 1).join('-'),
    skin: +emojiObj[emojiObj.length - 1] === 0 ? null : +emojiObj[emojiObj.length - 1] 
  }
  const {id, skin} = emoji;
  if (skin) {
    return `:${id}::skin-tone-${skin}:`
  } else {
    return `:${id}:`
  }
}

const ShowMessage = ({ loggedInUser, message, handleEmojiPicker, handleChangeReaction, handleCurrentActiveThread, thread, messageActionIdKey, handleEditMessage }) => {
  return (
    <div className={styles.messageTextWrapper}>
      <div dangerouslySetInnerHTML={{__html: message.message}} />
      <div className={emojiStyles.emojiContainer}>
        {
          message.reactions && Object.keys(message.reactions).length > 0
          &&
          Object.keys(message.reactions).map((reaction, index) => {
            return (
              <div className={`${emojiStyles.emojiWrapper} ${message.reactions[reaction].me ? emojiStyles.reacted : ""}`}  key={message.id +'-' + reaction + '-' + index}>
                <div className={emojiStyles.emoji}>
                  <Emoji emoji={convertToCode(reaction)} size={18} onClick={(data) => handleChangeReaction(message.id, data)}/>
                </div>
                <div className={emojiStyles.count}>
                  {message.reactions[reaction].count}
                </div>
              </div>
            )
          })
        }
      </div>
      <div className={styles.quickActions} id={`${messageActionIdKey}${message.id}`}>
        <div className={styles.actionsContainer}>
          <div className={styles.icon} onClick={() => handleEmojiPicker(`${messageActionIdKey}${message.id}`, message.id)}>
            <MdOutlineEmojiEmotions />
          </div>
          {
            !thread
            &&
            <div className={styles.icon} onClick={() => handleCurrentActiveThread(message.id)}>
              <MdReply />
            </div>
          }
          {
            loggedInUser.id === message.userId
            &&
            <>
              <div className={styles.icon} onClick={() => handleEditMessage(message.id)}>
                <MdModeEditOutline />
              </div>
              <div className={styles.icon}>
                <MdDeleteOutline />
              </div>
            </>
          }
        </div>
      </div>
      {
        !thread && message.totalReplies > 0
        &&
        <div className={styles.viewThread} onClick={() => handleCurrentActiveThread(message.id)}>
          <div className={styles.userImages}>
            {
              Array.isArray(message.profileReplies)
              &&
              message.profileReplies.map((profile) => {
                return <img key={profile.id} src={profile.dp} alt={profile.name}/>
              })
            }
          </div>
          <div>
            View Thread ({message.totalReplies})
          </div>
        </div>
      }
    </div>
  );
};

const MessageBox = ({ loggedInUser, message, handleEmojiPicker, handleChangeReaction, handleCurrentActiveThread, thread, messageIdKey, messageActionIdKey, handleEditMessage, currentEditingMessage}) => {


  return (
    <div className={`${styles.messageBoxWrapper}`}>
      <div className={`${styles.profileWrapper} ${styles.messagePos}`} id={`${messageIdKey}${message.id}`}>
        <div className={styles.profileImage}>
          <img src={message.dp} />
        </div>
        <div className={styles.profileDetailWrapper}>
          {
            currentEditingMessage === message.id
            ?
            <div>
              <EditorArea editing={true} message={message} onBlur={() => handleEditMessage(null)}/>
            </div>
            :
            <>
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
                  loggedInUser={loggedInUser}
                  message={message} 
                  messageActionIdKey={messageActionIdKey}
                  firstMessageInGroup={true} 
                  handleEmojiPicker={handleEmojiPicker}
                  handleChangeReaction={handleChangeReaction}
                  handleCurrentActiveThread={handleCurrentActiveThread}
                  thread={thread}

                  handleEditMessage={handleEditMessage}
                />
              </div>
            </>
          }
        </div>
      </div>
      {"groupedMessages" in message &&
        Object.keys(message.groupedMessages).map((messageId) => {
          return (
            <div className={`${styles.profileWrapper} ${styles.messagePosChild}`} key={messageId} id={`${messageIdKey}${messageId}`}>
              <div className={`${styles.profileImage} ${styles.profileImageWrapper}`}>
                <div className={styles.messageOnInHHMM}>
                  <Moment format="h:mm A">{message.groupedMessages[messageId].updatedAt}</Moment>
                </div>
              </div>
              <div className={styles.profileDetailWrapper}>
                {
                  currentEditingMessage === +messageId
                  ?
                  <div>
                    <EditorArea editing={true} message={message.groupedMessages[messageId]} onBlur={() => handleEditMessage(null)}/>
                  </div>
                  :
                  <div className={styles.messageTextWrapper}>
                    <ShowMessage
                      loggedInUser={loggedInUser}
                      message={message.groupedMessages[messageId]}
                      key={messageId}
                      messageActionIdKey={messageActionIdKey}
                      firstMessageInGroup={false}
                      handleEmojiPicker={handleEmojiPicker}
                      handleChangeReaction={handleChangeReaction}
                      handleCurrentActiveThread={handleCurrentActiveThread}
                      thread={thread}

                      handleEditMessage={handleEditMessage}
                    />
                  </div>
                }
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default MessageBox;
