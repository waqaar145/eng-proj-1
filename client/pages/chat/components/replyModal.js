import {useRef, useState, useEffect} from 'react'
import Modal from "./../../../src/components/Modal/main";
import styles from "./../../../src/assets/styles/chat/ViewReplyModal.module.scss";
import MessageBox from "./MessageBox";
import Editor from "./../../../src/components/Form/InputEditor";
import { shallowEqual, useSelector } from 'react-redux'

const ReplyModal = ({ show, toggle, handleProfileDetailModal, stylesMessageBox, isTabletOrMobile, loggedInUser, editingAMessage, replyingToAMessage, handleDeleteMessage, getReplies }) => {

  const { messageIdForRepliesActive, chats } = useSelector(state => state.Chat, shallowEqual)
  const message = chats[messageIdForRepliesActive]

  const loadMoreChatRef = useRef(null);

  useEffect(() => {
    if (message.replies && Object.keys(message.replies).length > 0) {
      var options = {
        root: null,
        rootMargin: "20px",
        threshold: 0.50,
      };
      const observerGroup = new IntersectionObserver(
        loadMoreChats,
        options
      );
      if (loadMoreChatRef.current) {
        observerGroup.observe(loadMoreChatRef.current);
      }
    }
  }, [message.replies]);

  const loadMoreChats = (entities) => {
    const target = entities[0];
    if (target.isIntersecting) {
      if (message.totalEnteries > Object.keys(message.replies).length) {
        getReplies(message, {pageNo: message.currentPage + 1})
      }
    }
  };

  const [replyValue, setReplyValue] = useState("")

  const handleReplyOnChange = (e) => {
    const {
      name, value
    } = e.target;
    setReplyValue(value)
  }

  const replySuccessfull = () => {
    setReplyValue("")
  }

  const handleReplyMessageKeypress = (e) => {
    if(e.key === 'Enter' && !e.shiftKey){
      if (replyValue.trim()) {
        e.preventDefault();
        const messageReplyObj = {
          id: messageIdForRepliesActive,
          message: replyValue
        }

        replyingToAMessage(messageReplyObj, replySuccessfull)
      }
    }
  }

  if (!message.replies) return <div>nothing</div>;

  return (
    <Modal visible={show} toggle={toggle}>
      <div className={styles.viewReplyModalWrapper}>
        <div className={styles.header}>
          <div className={styles.heading}>All Replies ({message.totalReplies})</div>
        </div>
        <div className={styles.body}>
          <div className={styles.replies}>
            {
              Object.keys(message.replies).length > 0
              &&
              Object.keys(message.replies).length < message.totalEnteries
              &&
              <div className={styles.loadingMore} ref={loadMoreChatRef}>
                <div
                  className="spinner-border spinner-main-color"
                  role="status"
                ></div>
              </div>
            }
            {
              true
              &&
              <>
                {
                  Object.keys(message.replies).map((messageId) => {
                    return (
                      <MessageBox
                        styles={stylesMessageBox} 
                        handleProfileDetailModal={handleProfileDetailModal}
                        key={messageId}
                        message={message.replies[messageId]}
                        isTabletOrMobile={isTabletOrMobile}
                        loggedInUser={loggedInUser}
                        handleDeleteMessage={handleDeleteMessage}
                        editingAMessage={editingAMessage}
                        child={true}
                      />
                    );
                  })
                }
              </>
            }
          </div>
        </div>
        <div className={styles.footer}>
          <Editor 
            name="replyMessage"
            id={`reply`}
            value={replyValue}
            onChange={handleReplyOnChange} 
            onKeyPress={handleReplyMessageKeypress}/>
        </div>
      </div>
    </Modal>
  )
}

export default ReplyModal;