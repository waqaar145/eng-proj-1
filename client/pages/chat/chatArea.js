import dynamic from "next/dynamic";
import CurrentUserChattingTo from "./components/CurrentUserChattingTo";
import Editor from "./../../src/components/Form/InputEditor";
import { useState, useEffect, useRef } from "react";
import MessageBox from "./components/MessageBox1";
import { useRouter } from "next/router";
import { chatService } from "../../src/services";
import {shallowEqual, useDispatch, useSelector} from 'react-redux'
import { chatActionTypes } from "../../src/store/chat/chat.actiontype";
import usePagination from "./../../src/hooks/usePagination";
import { DateWihtoutTime } from './../../src/utils/date'
import useDropdown from "../../src/hooks/useDropdown";
import useReactionChage from "./hook/useReactionChange";

const EmojiDropdown = dynamic(
  () => import("./components/EmojiDropdown"),
  { ssr: false }
);

const ChatArea = ({handleProfileDetailModal, isTabletOrMobile, styles}) => {

  const dispatch = useDispatch()

  const { currentState } = usePagination();

  const [allMessagesLoaded, setAllMessagesLoaded] = useState(false)
  const currentSelectedGroup = useSelector(state => state.Chat.currentSelectedGroup);
  const {loggedInUser} = useSelector(state => state.Auth, shallowEqual);
  const {chats: messages, currentPage, totalEnteries} = useSelector(state => state.Chat, shallowEqual);

  const router = useRouter();
  const {
    groupId
  } = router.query;

  const chatContentBodyRef = useRef(null)
  const loadMoreChatRef = useRef(null)
  const [value, setValue] = useState("")

  useEffect(() => {
    if (groupId) {
      getChats(groupId, {pageNo: 1});
    }
    document.body.style.overflow = 'hidden';
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
  const [currentEmojiMessageId, setCurrentEmojiMessageId] = useState(null);

  const handleEmojiPicker = (messageElId, id) => {
    toggleEmojiDropdown(messageElId)
    setCurrentEmojiMessageId(id)
  }

  const {
    updateReaction
  } = useReactionChage();

  const handleChangeReaction = (messageId, emoji) => {
    updateReaction(messageId, emoji)
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
                    isTabletOrMobile={isTabletOrMobile}
                    loggedInUser={loggedInUser}
                    handleEmojiPicker={handleEmojiPicker}
                    handleChangeReaction={handleChangeReaction}
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
      {/* {showEmojiDropdown && ( */}
        <EmojiDropdown
          show={showEmojiDropdown}
          toggle={toggleEmojiDropdown}
          messageId={currentEmojiMessageId}
        />
      {/* )} */}
    </>
  );
};

export default ChatArea;
