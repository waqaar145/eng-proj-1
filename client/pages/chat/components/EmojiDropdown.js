import React from "react";
import BasicDropdown from "./../../../src/components/Dropdown/basicDropdown";
import { chatService } from './../../../src/services';
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";

const EmojiDropdown = ({ show, toggle, messageId }) => {
  console.log(messageId)

  const handleEmoji = async (emoji) => {
    console.log(emoji)
    let emojiObj = {
      emojiId: emoji.id,
      skin: emoji.skin
    }
    try {
      let result = await chatService.addEmojiReaction(messageId, emojiObj)
      console.log(result)
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <BasicDropdown visible={show} toggle={toggle}>
      <Picker 
        onSelect={handleEmoji} 
        autoFocus={true}
        color="#00008b" 
        emojiSize={25} 
        title="Pick to react"
      />
    </BasicDropdown>
  );
};

export default EmojiDropdown;
