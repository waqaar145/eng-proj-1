import { useDispatch } from 'react-redux'
import { chatService } from '../../../src/services';
import { chatActionTypes } from "../../../src/store/chat/chat.actiontype";
import { useRouter } from "next/router";
import useChat from './useChat';

const useReactionChage = () => {

  const router = useRouter();
  const { groupId, addUsers } = router.query;

  const {
    addEmojiInMessageSocketEmitter
  } = useChat(groupId);

  const dispatch = useDispatch();

  const updateReaction = async (messageId, emoji, callback) => {
    let emojiObj = {
      emojiId: emoji.id,
      skin: emoji.skin
    }
    try {
      let {data: {data}} = await chatService.addEmojiReaction(messageId, emojiObj, callback)
      addEmojiInMessageSocketEmitter(data)
      if (callback) callback();
    } catch (error) {
      console.log(error);
    }
  }

  return {
    updateReaction
  }
}

export default useReactionChage;