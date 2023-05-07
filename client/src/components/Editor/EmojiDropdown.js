import React from "react";
import BasicDropdown from "./../../../src/components/Dropdown/basicDropdown";
import { Picker } from "emoji-mart";

import "emoji-mart/css/emoji-mart.css";

const EmojiDropdown = ({ show, toggle, handleSelectedEmoji, messageId, onBlur }) => {

  const hideEmojiDropdown = () => {
    toggle()
  }

  const handleEmoji = async (emoji) => {
    handleSelectedEmoji(emoji)
    hideEmojiDropdown()
  }

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
