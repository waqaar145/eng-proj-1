import { useState } from "react";
import useModal from "../../../src/hooks/useModal";
import {useDispatch} from 'react-redux'
import { chatService } from './../../../src/services' 
import { chatActionTypes } from "../../../src/store/chat/chat.actiontype";
import { useRouter } from "next/router";
import useChat from './useChat';

const useDeleteMessage = (currentActiveThread) => {

  const dispatch = useDispatch();
  const router = useRouter();
  const { groupId } = router.query;

  const {
    deleteMessageSocketEmitter
  } = useChat(groupId);

  const { toggle: handleConfirmToggle, show: showConfirmModal } = useModal();
  const [currentDeleteMessage, setCurrentDeleteMessage] = useState(null);
  const [deleteMessageLoader, setDeleteMessageLoader] = useState(false);

  const handleDeleteMessage = (id) => {
    setCurrentDeleteMessage(id)
    handleConfirmToggle()
  }

  const deleteMessage = async () => {
    try {
      setDeleteMessageLoader(true)
      let {data: {data}} = await chatService.deleteChat(currentDeleteMessage);
      if (currentActiveThread && currentActiveThread === currentDeleteMessage) {
        dispatch({type: chatActionTypes.THREAD_MESSAGE_ID, data: null})
        setTimeout(() => { // Memory leak warning
          deleteMessageSocketEmitter(data)
          handleConfirmToggle()
        })
      } else {
        deleteMessageSocketEmitter(data)
        handleConfirmToggle()
      }
      setDeleteMessageLoader(false)
    } catch (error) {
      console.log(error);
      setDeleteMessageLoader(false)
    }
  }

  return {
    handleConfirmToggle,
    showConfirmModal,
    currentDeleteMessage,
    deleteMessageLoader,
    handleDeleteMessage,
    deleteMessage
  }
}

export default useDeleteMessage;