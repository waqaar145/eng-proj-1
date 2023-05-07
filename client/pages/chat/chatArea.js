import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import SinlgeMessage from "./components/Message";
import { chatService } from "../../src/services";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { chatActionTypes } from "../../src/store/chat/chat.actiontype";
import usePagination from "./../../src/hooks/usePagination";
import useEmojiActions from "./hooks/emojiActions";
import { convertMessagesArrayToObjectForm } from "./utils/messageFormatter";
import ConfirmModal from "./components/ConfirmModal";
import useDeleteMessage from "./hooks/useDeleteMessage";
import MyEditor from "./../../src/components/Editor/editor";
import debounce from "lodash.debounce";
import CurrentUserChattingTo from "./components/CurrentUserChattingTo";

const EmojiDropdown = dynamic(() => import("./components/EmojiDropdown"), {
  ssr: false,
});

let messageIdKey = "message-id-";
let messageActionIdKey = "message-action-id-";

const ChatArea = ({
  groupId,
  isTabletOrMobile,
  styles,
  showMembers,
  addNewMessageSocketEmitter,
  updateMessageSocketEmitter
}) => {
  const dispatch = useDispatch();

  const { currentState } = usePagination();

  const [allMessagesLoaded, setAllMessagesLoaded] = useState(false);
  const currentSelectedGroup = useSelector(
    (state) => state.Chat.currentSelectedGroup
  );
  const currentActiveThread = useSelector(
    (state) => state.Chat.currenThreadMessageId
  );
  const { loggedInUser } = useSelector((state) => state.Auth, shallowEqual);
  const {
    chats: messages,
    currentPage,
    totalEnteries,
  } = useSelector((state) => state.Chat, shallowEqual);

  const chatRef = useRef(null);
  const chatContentBodyRef = useRef(null);
  const loadMoreChatRef = useRef(null);

  useEffect(() => {
    if (groupId) {
      getChats(groupId, { pageNo: 1 });
    }
    // document.body.style.overflow = 'hidden';
  }, [groupId]);

  const handleProfileDetailModal = () => {};

  useEffect(() => {
    if (Object.keys(messages).length > 0) {
      var options = {
        root: null,
        rootMargin: "20px",
        threshold: 0.5,
      };
      const observerGroup = new IntersectionObserver(loadMoreChats, options);
      if (loadMoreChatRef.current) {
        observerGroup.observe(loadMoreChatRef.current);
      }
    }
  }, [messages]);

  const loadMoreChats = (entities) => {
    const target = entities[0];
    if (target.isIntersecting) {
      if (totalEnteries > Object.keys(messages).length) {
        getChats(groupId, { pageNo: currentPage + 1 });
      }
    }
  };

  const scrollToBottom = () => {
    let el = chatContentBodyRef;
    if (el && el.current) {
      el.current.scrollTop = el.current.scrollHeight;
    }
  };

  const getChats = async (id, pageNoObj) => {
    const paramsObj = { ...currentState, ...pageNoObj };
    try {
      let {
        data: { data },
      } = await chatService.getChats(id, paramsObj);
      if (pageNoObj.pageNo === 1) {
        dispatch({ type: chatActionTypes.CURRENT_SELECTED_GROUP, data: data });
      }
      dispatch({
        type: chatActionTypes.CURRENT_CHAT_DATA,
        data: { ...data, currentPage: pageNoObj.pageNo },
      });
      if (pageNoObj.pageNo === 1) {
        scrollToBottom();
      }
      if (data.chats.length === 0) {
        setAllMessagesLoaded(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // CONVERTING MESSAGES OBJECT TO DATE WISE MESSAGES OBJECT
  let updatedMessages = convertMessagesArrayToObjectForm(messages);

  // HANDLING EMOJI RELATED EVENTS
  const {
    showEmojiDropdown,
    toggleEmojiDropdown,
    currentEmojiMessageId,
    handleEmojiPicker,
    handleChangeReaction,
  } = useEmojiActions();

  // Handle Current Thread
  const handleCurrentActiveThread = (id) => {
    dispatch({ type: chatActionTypes.THREAD_MESSAGE_ID, data: id || null });
  };

  // Handling editing message
  const [currentEditingMessage, setCurrentEditingMessage] = useState(null);
  const handleEditMessage = (id) => {
    setCurrentEditingMessage(id);
  };

  // Handling delete message
  const {
    handleConfirmToggle,
    showConfirmModal,
    currentDeleteMessage,
    deleteMessageLoader,
    handleDeleteMessage,
    deleteMessage,
  } = useDeleteMessage();

  // setting height content area
  const textAreaRef = useRef(null);
  const [editorState, setEditorState] = useState(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    setHeight(chatContentBodyRef.current.clientHeight);
    chatContentBodyRef.current.style.height =
    window.innerHeight - 110 - textAreaRef?.current?.clientHeight + "px";
  }, []);

  const handleStateChange = (data) => {
    setEditorState(data);
    if (chatContentBodyRef && chatContentBodyRef.current) {
      chatContentBodyRef.current.style.height =
      window.innerHeight - 110 - textAreaRef?.current?.clientHeight + "px";
    }
  };

  const handleTextareWidth = () => {
    if (textAreaRef && textAreaRef.current) {
      textAreaRef.current.style.width =
        chatContentBodyRef.current.clientWidth + "px";
    }
  };

  const handleResize = () => {
    handleTextareWidth();
    if (chatContentBodyRef && chatContentBodyRef.current) {
      setHeight(chatContentBodyRef.current.clientHeight);
      chatContentBodyRef.current.style.height =
        window.innerHeight - 110 - textAreaRef?.current?.clientHeight + "px"; // 110 -> height of above two divs
    }
  };

  useEffect(() => {
    window.addEventListener("resize", debounce(handleResize, 100));
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    handleTextareWidth();
  }, [currentActiveThread]);

  // submit data to DB
  const submit = async (editorData, callback) => {
    try {
      let chatObj = {
        groupId,
        message: editorData,
        parentId: null,
      };
      let {
        data: { data },
      } = await chatService.addChat(chatObj);
      addNewMessageSocketEmitter(data, scrollToBottom);
      callback();
    } catch (error) {
      console.log("Error when adding a message");
      console.log(error);
    }
  };

  const handleOnBlur = () => {
    setCurrentEditingMessage(null);
  };

  // edit submit data to DB
  const handleEditSubmit = async (editorData, callback) => {
    try {
      let chatObj = {
        messageId: currentEditingMessage,
        message: editorData,
      };
      let {
        data: { data },
      } = await chatService.updateChat(chatObj, currentEditingMessage);
      updateMessageSocketEmitter(data);
      callback();
      handleOnBlur();
    } catch (error) {
      console.log("Error when adding a message");
      console.log(error);
    }
  };

  return (
    <div ref={chatRef}>
      <div className={styles.chatContentHeader}>
        <CurrentUserChattingTo
          styles={styles}
          currentSelectedGroup={currentSelectedGroup}
          showMembers={showMembers}
        />
      </div>
      <div className={styles.chatContentBody} ref={chatContentBodyRef}>
        <div className={styles.messageWrapperContainer}>
          {Object.keys(messages).length > 0 &&
            Object.keys(messages).length < totalEnteries &&
            !allMessagesLoaded && (
              <div className={styles.loadingMore} ref={loadMoreChatRef}>
                <div
                  className="spinner-border spinner-main-color"
                  role="status"
                ></div>
              </div>
            )}
          {Object.keys(messages).length > 0 ? (
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
          ) : (
            <div className={styles.noMessageFound}>
              This is very beginning of the conversation
            </div>
          )}
        </div>
      </div>
      <div className={styles.chatContentTextArea} ref={textAreaRef}>
        <MyEditor
          handleStateChange={debounce(handleStateChange, 1000)}
          parentId={null}
          submit={submit}
          emojiElementId="main-chat-editor"
          placeholder={`Message ${
            currentSelectedGroup.groupType !== "private"
              ? `#${currentSelectedGroup.groupName}`
              : `${
                  currentSelectedGroup.currentUser
                    ? `${currentSelectedGroup.currentUser.firstName} ${currentSelectedGroup.currentUser.lastName}`
                    : ""
                }`
          }`}
        />
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
    </div>
  );
};

export default ChatArea;
