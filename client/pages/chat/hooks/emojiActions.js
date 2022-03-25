import useDropdown from "../../../src/hooks/useDropdown";
import useReactionChange from "./useReactionChange";
import { useState } from "react";

const useEmojiActions = () => {

    // HANDLING EMOJI RELATED EVENTS
    const { toggle: toggleEmojiDropdown, show: showEmojiDropdown } = useDropdown();
    const [currentEmojiMessageId, setCurrentEmojiMessageId] = useState(null);
  
    const handleEmojiPicker = (messageElId, id) => {
      toggleEmojiDropdown(messageElId)
      setCurrentEmojiMessageId(id)
    }

    const {
      updateReaction
    } = useReactionChange();
  
    const handleChangeReaction = (messageId, emoji) => {
      updateReaction(messageId, emoji)
    }

    return {
      showEmojiDropdown,
      toggleEmojiDropdown,
      currentEmojiMessageId,
      handleEmojiPicker,
      handleChangeReaction
    }
}

export default useEmojiActions;