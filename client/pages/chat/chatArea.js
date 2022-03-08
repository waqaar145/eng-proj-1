import dynamic from "next/dynamic";
import CurrentUserChattingTo from "./components/CurrentUserChattingTo";
import { useState, useEffect, useRef } from "react";
import SinlgeMessage from "./components/Message";
import { useRouter } from "next/router";
import { chatService } from "../../src/services";
import {shallowEqual, useDispatch, useSelector} from 'react-redux'
import { chatActionTypes } from "../../src/store/chat/chat.actiontype";
import usePagination from "./../../src/hooks/usePagination";
import useEmojiActions from "./hooks/emojiActions";
import EditorArea from "./components/EditorArea";
import {convertMessagesArrayToObjectForm} from './utils/messageFormatter'
import ConfirmModal from "./components/ConfirmModal";
import useDeleteMessage from "./hooks/useDeleteMessage";
import MyEditor from './../../src/components/Editor/editor'
import debounce from 'lodash.debounce';

const EmojiDropdown = dynamic(
  () => import("./components/EmojiDropdown"),
  { ssr: false }
);

let messageIdKey = "message-id-";
let messageActionIdKey = "message-action-id-";

const ChatArea = ({isTabletOrMobile, styles}) => {

  const dispatch = useDispatch()

  const { currentState } = usePagination();

  const [allMessagesLoaded, setAllMessagesLoaded] = useState(false)
  const currentSelectedGroup = useSelector(state => state.Chat.currentSelectedGroup);
  const currentActiveThread = useSelector(state => state.Chat.currenThreadMessageId);
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
    // document.body.style.overflow = 'hidden';
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
  let updatedMessages = convertMessagesArrayToObjectForm(messages);

  // HANDLING EMOJI RELATED EVENTS
  const {
    showEmojiDropdown,
    toggleEmojiDropdown,
    currentEmojiMessageId,
    handleEmojiPicker,
    handleChangeReaction
  } = useEmojiActions();

  // Handle Current Thread
  const handleCurrentActiveThread = (id) => {
    dispatch({type: chatActionTypes.THREAD_MESSAGE_ID, data: id || null})
    getThreadReplies(id)
  }

  const getThreadReplies = async (id) => {
    try {
      let currentPage = 1;
      const paramsObj = {...currentState, pageNo: currentPage, pageSize: 1000}
      let {data: {data}} = await chatService.getThreadReplies({groupId, messageId: id}, paramsObj);
      await dispatch({type: chatActionTypes.THREAD_REPLIES, data: {...data, currentPage, messageId: id}})
    } catch (error) {
      console.log(error)
    }
  }

  // Handling editing message
  const [currentEditingMessage, setCurrentEditingMessage] = useState(null);
  const handleEditMessage = (id) => {
    setCurrentEditingMessage(id)
  }

  // Handling delete message
  const {
    handleConfirmToggle,
    showConfirmModal,
    currentDeleteMessage,
    deleteMessageLoader,
    handleDeleteMessage,
    deleteMessage
  } = useDeleteMessage();

  // setting height content area
  const textAreaRef = useRef(null);
  const [editorState, setEditorState] = useState(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    setHeight(chatContentBodyRef.current.clientHeight)
    chatContentBodyRef.current.style.height = chatContentBodyRef.current.clientHeight - textAreaRef?.current?.clientHeight + 'px';
  }, []);

  const handleStateChange = (data) => {
    setEditorState(data)
    chatContentBodyRef.current.style.height = height - textAreaRef?.current?.clientHeight + 'px';
  }

  const handleTextareWidth = () => {
    textAreaRef.current.style.width = chatContentBodyRef.current.clientWidth + 'px';
  }

  const handleResize = () => {
    handleTextareWidth()
    setHeight(chatContentBodyRef.current.clientHeight)
    chatContentBodyRef.current.style.height = window.innerHeight - 110 - textAreaRef?.current?.clientHeight + 'px'; // 110 -> height of above two divs
  }

  useEffect(() => {
    window.addEventListener('resize', debounce(handleResize, 100));
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    handleTextareWidth()
  }, [currentActiveThread])

  // submit data to DB
  const submit = async (editorData, callback) => {
    try {
      let chatObj = {
        groupId,
        message: editorData,
        parentId: null
      }      
      let {data: {data}} = await chatService.addChat(chatObj);
      dispatch({type: chatActionTypes.ADD_NEW_MESSAGE, data: {[data.id]: data}})
      callback();
    } catch (error) {
      console.log('Error when adding a message')
      console.log(error)
    }
  }

  const handleOnBlur = () => {
    setCurrentEditingMessage(null)
  }

  // edit submit data to DB
  const handleEditSubmit = async (editorData, callback) => {
    try {
      let chatObj = {
        messageId: currentEditingMessage,
        message: editorData
      }      
      let {data: {data}} = await chatService.updateChat(chatObj, currentEditingMessage);
      dispatch({type: chatActionTypes.UPDATE_MESSAGE, data})
      callback();
      handleOnBlur()
    } catch (error) {
      console.log('Error when adding a message')
      console.log(error)
    }
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
                    key={messageId}
                    message={updatedMessages[messageId]}
                    messageIdKey={messageIdKey}
                    messageActionIdKey={messageActionIdKey}
                    loggedInUser={loggedInUser}
                    handleEmojiPicker={handleEmojiPicker}
                    handleChangeReaction={handleChangeReaction}
                    handleCurrentActiveThread={handleCurrentActiveThread}
                    thread={false}

                    handleEditMessage={handleEditMessage}
                    currentEditingMessage={currentEditingMessage}
                    handleDeleteMessage={handleDeleteMessage}
                    handleOnBlur={handleOnBlur}
                    handleEditSubmit={handleEditSubmit}
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
      <div className={styles.chatContentTextArea} ref={textAreaRef}>
        <MyEditor handleStateChange={debounce(handleStateChange, 100)} parentId={null} submit={submit}/>
      </div>
      <EmojiDropdown
        show={showEmojiDropdown}
        toggle={toggleEmojiDropdown}
        messageId={currentEmojiMessageId}
      />
      <ConfirmModal 
        id={currentDeleteMessage}
        titleText="Delete message"
        bodyText="Are you sure? This can't be undone"
        handleDelete={deleteMessage}
        toggle={handleConfirmToggle}
        show={showConfirmModal}
        loading={deleteMessageLoader}
        handleToggle={() => handleConfirmToggle()}
        />
    </>
  );
};

export default ChatArea;
