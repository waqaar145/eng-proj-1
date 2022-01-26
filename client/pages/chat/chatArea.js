import dynamic from "next/dynamic";
import CurrentUserChattingTo from "./components/CurrentUserChattingTo";
import Editor from "./../../src/components/Form/InputEditor";
import { useState, useMemo, useEffect, useRef } from "react";
import MessageBox from "./components/MessageBox1";
import { useRouter } from "next/router";
import { chatService } from "../../src/services";
import {shallowEqual, useDispatch, useSelector} from 'react-redux'
import { chatActionTypes } from "../../src/store/chat/chat.actiontype";
import usePagination from "./../../src/hooks/usePagination";
import useModal from "./../../src/hooks/useModal";
import ConfirmModal from './components/ConfirmModal'
import useReply from "./hooks/useReply";
import { DateWihtoutTime } from './../../src/utils/date'
import useDropdown from "../../src/hooks/useDropdown";

const ReplyModal = dynamic(
  () => import("./components/replyModal"),
  { ssr: false }
);
const EmojiDropdown = dynamic(
  () => import("./components/EmojiDropdown"),
  { ssr: false }
);

const ChatArea = ({handleProfileDetailModal, isTabletOrMobile, styles}) => {

  const dispatch = useDispatch()

  const { currentState } = usePagination();

  const [allMessagesLoaded, setAllMessagesLoaded] = useState(false)
  const currentSelectedGroup = useSelector(state => state.Chat.currentSelectedGroup);
  const {loggedInUser, loggedInStatus} = useSelector(state => state.Auth, shallowEqual);
  const {chats: messages, currentPage, totalEnteries} = useSelector(state => state.Chat, shallowEqual);

  const router = useRouter();
  const {
    groupId
  } = router.query;

  const { getReplies, editingAMessage, replyingToAMessage } = useReply(groupId)

  const [currentViewReplyCommentObj, setCurrentViewReplyCommentObj] = useState(
    {}
  );

  const chatContentBodyRef = useRef(null)
  const loadMoreChatRef = useRef(null)
  const [value, setValue] = useState("")

  useEffect(() => {
    if (groupId) {
      getChats(groupId, {pageNo: 1});
    }
  }, [groupId]);

  useEffect(() => {
    if (Object.keys(messages).length > 0) {
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
  }, [messages]);

  const loadMoreChats = (entities) => {
    const target = entities[0];
    if (target.isIntersecting) {
      if (totalEnteries > Object.keys(messages).length) {
        getChats(groupId, {pageNo: currentPage + 1})
      }
    }
  };

  const scrollToBottom = () => {
    let el = chatContentBodyRef;
    el.current.scrollTop = el.current.scrollHeight;
  }

  const getChats = async (id, pageNoObj) => {
    const paramsObj = {...currentState, ...pageNoObj}
    try {
      let {data: {data}} = await chatService.getChats(id, paramsObj);
      if (pageNoObj.pageNo === 1) {
        dispatch({type: chatActionTypes.CURRENT_SELECTED_GROUP, data: data})
      }
      dispatch({type: chatActionTypes.CURRENT_CHAT_DATA, data: {...data, currentPage: pageNoObj.pageNo}})
      if (pageNoObj.pageNo === 1) {
        scrollToBottom()
      }
      if (data.chats.length === 0) {
        setAllMessagesLoaded(true)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleOnChange = (e) => {
    const {
      name, value
    } = e.target;
    setValue(value)
  }

  const handleKeypress = async (e) => { 
    if(e.key === 'Enter' && !e.shiftKey){
      if (value.trim()) {
        e.preventDefault();
        try {
          let chatObj = {
            groupId,
            message: value,
            parentId: null
          }
          let {data: {data}} = await chatService.addChat(chatObj);
          dispatch({type: chatActionTypes.ADD_NEW_MESSAGE, data: {[data.id]: data}})
        } catch (error) {
          console.log(error)
        }
      }
      setValue("")
    }
  }

  const { toggle: handleReplyToggle, show: showReplyModal } = useModal();
  const { toggle: handleConfirmToggle, show: showConfirmModal } = useModal();
  const [deleteMessageLoader, setDeleteMessageLoader] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(false);

  const handleReply = (data) => {
    dispatch({type: chatActionTypes.CURRENT_MESSAGE_ID_ACTIVE_FOR_REPLIES_IN_MOBILE, data: data.id})
    setCurrentViewReplyCommentObj(data);
    handleReplyToggle();
  };

  const handleDeleteMessage = (data) => {
    setMessageToDelete(data)
    handleConfirmToggle()
  }

  const handleDelete = async (id) => {
    try {
      setDeleteMessageLoader(true)
      let {data: {data}} = await chatService.deleteChat(id);
      dispatch({type: chatActionTypes.DELETE_MESSAGE, data})
      setDeleteMessageLoader(false)
      handleConfirmToggle()
    } catch (error) {
      console.log(error)
    }
  }

  const handleReaction = async (message) => {
    const messageObj = {
      messageId: message.id,
      value: 1
    }
    try {
      let {data: {data}} = await chatService.addReaction(messageObj);
      dispatch({type: chatActionTypes.UPDATE_REACTION, data})
    } catch (error) {
      console.log(error)
    }
  }

  // CONVERTING MESSAGES OBJECT TO DATE WISE MESSAGES OBJECT
  let updatedMessages = {};
  let prevMessage = null;
  for (const [key, value] of Object.entries(messages)) {
    if (!prevMessage) {
      updatedMessages = {...updatedMessages, [key]: value};
      prevMessage = value;
    } else {
      if (
        prevMessage.userId === value.userId 
        &&
        DateWihtoutTime(prevMessage.createdAt) === DateWihtoutTime(value.createdAt)
      ) {
        updatedMessages = {
          ...updatedMessages, 
          [prevMessage.id]: {
            ...updatedMessages[prevMessage.id],
            groupedMessages: 'groupedMessages' in updatedMessages[prevMessage.id] ? {...updatedMessages[prevMessage.id].groupedMessages, [value.id]: value} : {[value.id]: value}
          }
        }
      } else {
        updatedMessages = {...updatedMessages, [key]: value};
        prevMessage = value
      }
    }
  }

  // HANDLING EMOJI RELATED EVENTS

  const { toggle: toggleEmojiDropdown, show: showEmojiDropdown } = useDropdown();

  const handleEmojiPicker = (id) => {
    console.log(id)
    toggleEmojiDropdown(id)
  }

  return (
    <>
      <div className={styles.chatContentHeader}>
        <CurrentUserChattingTo styles={styles} currentSelectedGroup={currentSelectedGroup}/>
      </div>
      <div className={styles.chatContentBody} ref={chatContentBodyRef}>
        <div className={styles.messageWrapperContainer}>
          {
            Object.keys(messages).length > 0
            &&
            Object.keys(messages).length < totalEnteries
            &&
            !allMessagesLoaded
            &&
            <div className={styles.loadingMore} ref={loadMoreChatRef}>
              <div
                className="spinner-border spinner-main-color"
                role="status"
              ></div>
            </div>
          }
          {
            Object.keys(messages).length > 0
            ?
            <>
              {Object.keys(updatedMessages).map((messageId) => {
                return (
                  <MessageBox
                    styles={styles}
                    handleProfileDetailModal={handleProfileDetailModal}
                    key={messageId}
                    message={updatedMessages[messageId]}
                    handleReply={handleReply}
                    isTabletOrMobile={isTabletOrMobile}
                    handleDeleteMessage={handleDeleteMessage}
                    loggedInUser={loggedInUser}
                    editingAMessage={editingAMessage}
                    replyingToAMessage={replyingToAMessage}
                    getReplies={getReplies}
                    handleReaction={handleReaction}


                    handleEmojiPicker={handleEmojiPicker}
                  />
                );
              })}
            </>
            :
            <div className={styles.noMessageFound}>
              This is very beginning of the conversation
            </div>
          }
        </div>
      </div>
      <div className={styles.chatContentTextArea}>
        <Editor 
          value={value}
          onChange={handleOnChange} 
          onKeyPress={handleKeypress}
        />
      </div>
      {showReplyModal && (
        <ReplyModal
          show={showReplyModal}
          toggle={handleReplyToggle}
          stylesMessageBox={styles}
          isTabletOrMobile={isTabletOrMobile}
          loggedInUser={loggedInUser}
          handleProfileDetailModal={handleProfileDetailModal}
          editingAMessage={editingAMessage}
          replyingToAMessage={replyingToAMessage}
          handleDeleteMessage={handleDeleteMessage}
          getReplies={getReplies}
        />
      )}
      {showConfirmModal && (
        <ConfirmModal
          id={messageToDelete.id}
          titleText="Delete message"
          bodyText="Are you sure? This can't be undone"
          handleDelete={handleDelete}
          toggle={handleConfirmToggle}
          show={showConfirmModal}
          loading={deleteMessageLoader}
          handleToggle={() => handleConfirmToggle()}
        />
      )}
      {/* {showEmojiDropdown && ( */}
        <EmojiDropdown
          show={showEmojiDropdown}
          toggle={toggleEmojiDropdown}
        />
      {/* )} */}
    </>
  );
};

export default ChatArea;
