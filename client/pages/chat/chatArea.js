import dynamic from "next/dynamic";
import CurrentUserChattingTo from "./components/CurrentUserChattingTo";
import { useState, useEffect, useRef } from "react";
import SinlgeMessage from "./components/Message";
import { useRouter } from "next/router";
import { chatService } from "../../src/services";
import {shallowEqual, useDispatch, useSelector} from 'react-redux'
import { chatActionTypes } from "../../src/store/chat/chat.actiontype";
import usePagination from "./../../src/hooks/usePagination";
import { DateWihtoutTime } from './../../src/utils/date'
import useDropdown from "../../src/hooks/useDropdown";
import useReactionChage from "./hooks/useReactionChange";
import EditorArea from "./components/EditorArea";

const EmojiDropdown = dynamic(
  () => import("./components/EmojiDropdown"),
  { ssr: false }
);

const ChatArea = ({isTabletOrMobile, styles, handleCurrentActiveThread}) => {

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

  useEffect(() => {
    if (groupId) {
      getChats(groupId, {pageNo: 1});
    }
    document.body.style.overflow = 'hidden';
  }, [groupId]);

  const handleProfileDetailModal = () => {}

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
                  <SinlgeMessage
                    styles={styles}
                    handleProfileDetailModal={handleProfileDetailModal}
                    key={messageId}
                    message={updatedMessages[messageId]}
                    isTabletOrMobile={isTabletOrMobile}
                    loggedInUser={loggedInUser}
                    handleEmojiPicker={handleEmojiPicker}
                    handleChangeReaction={handleChangeReaction}
                    handleCurrentActiveThread={handleCurrentActiveThread}
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
        <EditorArea groupId={groupId}/>
      </div>
      <EmojiDropdown
        show={showEmojiDropdown}
        toggle={toggleEmojiDropdown}
        messageId={currentEmojiMessageId}
      />
    </>
  );
};

export default ChatArea;
