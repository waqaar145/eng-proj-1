import { useDispatch } from 'react-redux'
import { chatService } from '../../../src/services';
import { chatActionTypes } from "../../../src/store/chat/chat.actiontype";

const useReactionChage = () => {

  const dispatch = useDispatch();

  const updateReaction = async (messageId, emoji, callback) => {
    let emojiObj = {
      emojiId: emoji.id,
      skin: emoji.skin
    }
    try {
      let {data: {data}} = await chatService.addEmojiReaction(messageId, emojiObj, callback)
      console.log(data);
      dispatch({type: chatActionTypes.UPDATE_EMOJI_IN_MESSAGES, data})
      if (callback) callback()
    } catch (error) {
      console.log(error);
    }
  }

  return {
    updateReaction
  }
}

export default useReactionChage;