import React from "react";
import { RichUtils } from "draft-js";
import {
  AiOutlineBold,
  AiOutlineUnderline,
  AiOutlineItalic,
  AiOutlineCode,
  AiOutlineStrikethrough,
  AiOutlineUnorderedList,
  AiOutlineOrderedList
} from 'react-icons/ai';
import styles from './Toolbar.module.scss'

const iconRenderer = (label) => {
  if (label === 'BOLD') {
    return <AiOutlineBold/>
  } else if (label === 'Italic') {
    return <AiOutlineItalic/>
  } else if (label === 'Underline') {
    return <AiOutlineUnderline/>
  } else if (label === 'Code') {
    return <AiOutlineCode/>
  } else if (label === 'Strikethrough') {
    return <AiOutlineStrikethrough/>
  } else if (label === 'Unordered List') {
    return <AiOutlineUnorderedList/>
  } else if (label === 'Ordered List') {
    return <AiOutlineOrderedList/>
  }
  return <AiOutlineBold/>
}


export const inlineStyles = [
  { type: "BOLD", label: "Bold", toolTip: "Bold" },
  { type: "ITALIC", label: "Italic", toolTip: "Italic" },
  { type: "UNDERLINE", label: "Underline", toolTip: "Underline" },
  { type: "CODE", label: "Code", toolTip: "Code Block" },
  { type: "STRIKETHROUGH", label: "Strikethrough", toolTip: "Strikethrough" },
];

export const blockStyles = [
  { type: "unordered-list-item", label: "Unordered List", toolTip: "Unordered List" },
  { type: "ordered-list-item", label: "Ordered List", toolTip: "Ordered List" },
];

const Toolbar = (props) => {
  const { editorState, setEditorState } = props;

  const handleInlineStyle = (event, style) => {
    event.preventDefault();
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  const handleBlockStyle = (event, block) => {
    event.preventDefault();
    setEditorState(RichUtils.toggleBlockType(editorState, block));
  };

  const renderInlineStyleButton = (style, index) => {
    const currentInlineStyle = editorState.getCurrentInlineStyle();
    let className = styles.toolbarButton;
    if (currentInlineStyle.has(style.type)) {
      className = styles.toolbarButtonSelected;
    }

    return (
      <button
        key={index}
        title={style.toolTip}
        onMouseDown={(event) => handleInlineStyle(event, style.type)}
        onClick={(event) => event.preventDefault()}
        className={className}
      >
      {iconRenderer(style.label)}
      </button>
    );
  };

  const renderBlockStyleButton = (block, index) => {
    const currentBlockType = RichUtils.getCurrentBlockType(editorState);
    let className = styles.toolbarButton;
    if (currentBlockType === block.type) {
      className = styles.toolbarButtonSelected;
    }

    return (
      <button
        key={index}
        title={block.toolTip}
        onMouseDown={(event) => handleBlockStyle(event, block.type)}
        onClick={(event) => event.preventDefault()}
        className={className}
      >
        {iconRenderer(block.label)}
      </button>
    );
  };

  return (
    <div id="editor-toolbar">
      {inlineStyles.map((style, index) => {
        return renderInlineStyleButton(style, index);
      })}
      {blockStyles.map((block, index) => {
        return renderBlockStyleButton(block, index);
      })}
    </div>
  );
};

export default Toolbar;