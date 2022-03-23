import React from "react";
import BasicDropdown from "./../../../src/components/Dropdown/basicDropdown";
import { Picker } from "emoji-mart";
import useReactionChage from "../hooks/useReactionChange";

import "emoji-mart/css/emoji-mart.css";

const EmojiDropdown = ({ show, toggle, messageId }) => {
  const { updateReaction } = useReactionChage();

  const hideEmojiDropdown = () => {
    toggle();
  };

  const handleEmoji = async (emoji) => {
    updateReaction(messageId, emoji, hideEmojiDropdown);
  };

  return (
    <BasicDropdown visible={show} toggle={toggle}>
      <Picker
        onSelect={handleEmoji}
        color="#00008b"
        emojiSize={25}
        title="Pick to react"
      />
    </BasicDropdown>
  );
};

export default EmojiDropdown;
