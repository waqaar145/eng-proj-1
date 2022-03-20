import { useRef, useState, useEffect } from "react";
import styles from "./../../../../src/assets/styles/chat/Thread.module.scss";
import { convertMessagesArrayToObjectForm } from '../../utils/messageFormatter';
import { chatActionTypes } from '../../../../src/store/chat/chat.actiontype';
import SinlgeMessage from '../Message';
import { useRouter } from "next/router";
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import useEmojiActions from './../../hooks/emojiActions'
import EmojiDropdown from './../EmojiDropdown'
import CloseIcon from './../../../../src/components/Extra/CloseIcon'
import useDeleteMessage from './../../hooks/useDeleteMessage'
import ConfirmModal from './../ConfirmModal'
import MyEditor from './../../../../src/components/Editor/editor'
import { chatService } from "../../../../src/services";
import debounce from 'lodash.debounce';
import usePagination from "./../../../../src/hooks/usePagination";

let parentMessageIdKey = "parent-thread-message-id-";
let parentMessageActionIdKey = "parent-thread-message-action-id-";
let messageIdKey = "thread-message-id-";
let messageActionIdKey = "thread-message-action-id-";

const ActiveThread = ({ currentActiveThread }) => {

  const { currentState } = usePagination();

  const router = useRouter();
  const {
    groupId
  } = router.query;

  const currentSelectedGroup = useSelector(state => state.Chat.currentSelectedGroup);
  const { chats: messages } = useSelector(state => state.Chat);
  const {loggedInUser} = useSelector(state => state.Auth, shallowEqual);
  let message = messages[currentActiveThread];
  let parentMessage = convertMessagesArrayToObjectForm({[message.id]: message});
  let threadReplies = parentMessage[message.id].replies;

  let updatedMessages = {}
  if (threadReplies) {
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
  } = useDeleteMessage(currentActiveThread);


  // setting height content area

  const chatContentBodyRef = useRef(null)

  const textAreaRef = useRef(null);
  const [editorState, setEditorState] = useState(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    setHeight(chatContentBodyRef.current.clientHeight)
    chatContentBodyRef.current.style.height = window.innerHeight - 110 - textAreaRef?.current?.clientHeight + 'px';
  }, []);

  const handleStateChange = (data) => {
    setEditorState(data)
    chatContentBodyRef.current.style.height = height - textAreaRef?.current?.clientHeight + 'px';
  }

  const handleTextareWidth = () => {
    if (currentActiveThread && textAreaRef && textAreaRef.current){
      textAreaRef.current.style.width = chatContentBodyRef.current.clientWidth + 'px';
    }
  }

  const handleResizeThread = () => {
    handleTextareWidth()
    if (chatContentBodyRef && chatContentBodyRef.current) {
      setHeight(chatContentBodyRef.current.clientHeight)
      chatContentBodyRef.current.style.height = window.innerHeight - 110 - textAreaRef?.current?.clientHeight + 'px'; // 110 -> height of above two divs
    }
  }

  useEffect(() => {
    window.addEventListener('resize', debounce(handleResizeThread, 100));
    return () => window.removeEventListener('resize', debounce(handleResizeThread, 100))
  }, [])

  useEffect(() => {
    if (currentActiveThread) {
      handleTextareWidth()
      getThreadReplies(currentActiveThread)
    }
  }, [currentActiveThread])

  const scrollToBottom = () => {
    let el = chatContentBodyRef;
    el.current.scrollTop = el.current.scrollHeight;
  }

  const getThreadReplies = async (id) => {
    try {
      let currentPage = 1;
      const paramsObj = {...currentState, pageNo: currentPage, pageSize: 1000}
      let {data: {data}} = await chatService.getThreadReplies({groupId, messageId: id}, paramsObj);
      await dispatch({type: chatActionTypes.THREAD_REPLIES, data: {...data, currentPage, messageId: id}})
      scrollToBottom()
    } catch (error) {
      console.log(error)
    }
  }


  // submit data to DB
  const submit = async (editorData, callback) => {
    try {
      let chatObj = {
        groupId,
        message: editorData,
        parentId: currentActiveThread
      }      
      let {data: {data}} = await chatService.addChat(chatObj);
      await dispatch({type: chatActionTypes.REPLY_MESSAGE, data})
      callback();
      scrollToBottom()
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
    <div className={styles.threadWrapper}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.heading}>Thread</span>
          {
            currentSelectedGroup.groupType !== 'private'
            &&
            <span className={styles.group}>(#{currentSelectedGroup.groupName})</span>
          }
        </div>
        <div>
          <CloseIcon onClick={() => closeThread()}/>
        </div>
      </div>
      <div className={styles.container} ref={chatContentBodyRef}>
        <div className={styles.parentMessage}>
          {Object.keys(parentMessage).map((messageId) => {
            return (
              <SinlgeMessage
                key={messageId}
                message={parentMessage[messageId]}
                messageIdKey={parentMessageIdKey}
                messageActionIdKey={parentMessageActionIdKey}
                loggedInUser={loggedInUser}
                handleEmojiPicker={handleEmojiPicker}
                handleChangeReaction={handleChangeReaction}
                handleCurrentActiveThread={() => {}}
                thread={true}

                handleEditMessage={handleEditMessage}
                currentEditingMessage={currentEditingMessage}
                handleDeleteMessage={handleDeleteMessage}
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
                loggedInUser={loggedInUser}
                handleEmojiPicker={handleEmojiPicker}
                handleChangeReaction={handleChangeReaction}
                handleCurrentActiveThread={() => {}}
                thread={true}

                handleEditMessage={handleEditMessage}
                currentEditingMessage={currentEditingMessage}
                handleDeleteMessage={handleDeleteMessage}
                handleEditSubmit={handleEditSubmit}
              />
            );
          })}
        </div>
      </div>
      <div className={styles.threadTextArea} ref={textAreaRef}>
        <MyEditor 
          handleStateChange={handleStateChange} 
          submit={submit} 
          emojiElementId="main-chat-thread-editor"
          placeholder={`Reply in Thread ${currentSelectedGroup.groupType !== 'private' ? `of #${currentSelectedGroup.groupName}` : ""}`}
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

export default ActiveThread;
