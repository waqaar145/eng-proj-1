import React from "react";
import BasicDropdown from "./../../../src/components/Dropdown/basicDropdown";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";

const EmojiDropdown = ({ show, toggle }) => {

  const handleEmoji = (e) => {
    console.log(e)
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
