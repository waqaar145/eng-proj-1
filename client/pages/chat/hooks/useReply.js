import {useDispatch} from 'react-redux'
import usePagination from "./../../../src/hooks/usePagination";
import { chatService } from './../../../src/services' 
import { chatActionTypes } from "../../../src/store/chat/chat.actiontype";

const useReply = (groupId) => {

  const { currentState } = usePagination();
  const dispatch = useDispatch();

  const getReplies = async (message, pageNoObj) => {
    let params = {...currentState, ...pageNoObj}
    try {
      let {data: {data}} = await chatService.getReplies({groupId, messageId: message.id }, params)
      dispatch({type: chatActionTypes.GET_REPLIES, data: {...data, currentPage: pageNoObj.pageNo, messageId: message.id}})
    } catch (error) {
      console.log(error)
    }
  }

  const editingAMessage = async (obj, callback) => {
    try {
      let {data: {data: {parentId, messageId, message, updatedAt}}} = await chatService.editingAMessage(obj, obj.id)
      dispatch({type: chatActionTypes.UPDATE_MESSAGE, data: {parentId, messageId, message, updatedAt}})
      callback()
    } catch (error) {
      console.log(error)
    }
  }

  const replyingToAMessage = async ({id, message}, callback) => {
    try {
      let chatObj = {
        groupId,
        message: message,
        parentId: id
      }
      let {data: {data}} = await chatService.addChat(chatObj)
      dispatch({type: chatActionTypes.REPLY_MESSAGE, data})
      callback()
    } catch (error) {
      console.log(error)
    }
  } 

  return {
    getReplies,
    editingAMessage,
    replyingToAMessage
  }
}

export default useReply;