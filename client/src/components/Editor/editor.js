import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Toolbar from './Toolbar';
import useNormalDropdown from '../../../src/hooks/useNormalDropdown';
import styles from './../../../src/assets/styles/components/Editor.module.scss'
import isSoftNewlineEvent from 'draft-js/lib/isSoftNewlineEvent';
const Draft = require('draft-js');


import {
  MdAddCircle,
  MdOutlineEmojiEmotions
} from 'react-icons/md';
const EmojiDropdown = dynamic(
  () => import("./EmojiDropdown"),
  { ssr: false }
);

import 'draft-js/dist/Draft.css';

const emptyContentState = Draft.convertFromRaw({
  entityMap: {},
  blocks: [
    {
      text: '',
      key: 'foo',
      type: 'unstyled',
      entityRanges: [],
    },
  ],
});

const { Editor, EditorState, RichUtils, Modifier, SelectionState, getDefaultKeyBinding, convertFromRaw, convertToRaw, ContentState } = Draft;

const SimpleEditor = ({handleStateChange, submit, initValue, handleOnBlur}) => {

  const draftRef = useRef(null);
  const [editorState, setEditorState] = React.useState(EditorState.createWithContent(emptyContentState));

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  }

  const handleKeyBinding = (e) => {
    if (e.keyCode === 13 && e.shiftKey) {
      console.log('pppp')
      let ff = RichUtils.getCurrentBlockType(editorState)
      let inlineStyle = editorState.getCurrentInlineStyle()
      console.log(ff)
      console.log(inlineStyle)

      const isBold = inlineStyle.has("BOLD");
      console.log(isBold)
      const newEditorState = RichUtils.insertSoftNewline(editorState);
      setEditorState(newEditorState);
      return 'handled';
    } else if (e.keyCode === 13) {
      handleSubmit()
      return 'enter-only';
    }
    return getDefaultKeyBinding(e);
  }

  useEffect(() => {
    draftRef.current.focus()
  }, []);

  useEffect(() => {
    if (initValue) {
      let currentData = EditorState.createWithContent(convertFromRaw(initValue))
      const newEditorState = EditorState.moveFocusToEnd(currentData);
      setEditorState(newEditorState)
    }
  }, [initValue])

  useEffect(() => {
    handleStateChange(editorState)
  }, [editorState])

  let className = 'RichEditor-editor';
  var contentState = editorState.getCurrentContent();
  if (!contentState.hasText()) {
    if (contentState.getBlockMap().first().getType() !== 'unstyled') {
      className += ' RichEditor-hidePlaceholder';
    }
  }

  const {
    show: showEmojiDropdown,
    toggle: toggleEmojiDropdown
  } = useNormalDropdown();

  const handleEmojiPicker = (id) => {
    toggleEmojiDropdown(id);
  }

  const handleSelectedEmoji = (emoji) => {
    console.log(emoji)
    const {native} = emoji;
    addAndFocusAtTheEnd(native);
  }

  const addAndFocusAtTheEnd = (native) => {
    const currentContent = editorState.getCurrentContent();

    const blockMap = currentContent.getBlockMap();
    const key = blockMap.last().getKey();
    const length = blockMap.last().getLength();
    const selection = new SelectionState({
      anchorKey: key,
      anchorOffset: length,
      focusKey: key,
      focusOffset: length,
    });

    const textWithInsert = Modifier.insertText(currentContent, selection, native + ' ', null);
    const editorWithInsert = EditorState.push(editorState, textWithInsert, 'insert-characters');

    const newEditorState = EditorState.moveFocusToEnd(editorWithInsert);
    setEditorState(RichUtils.toggleInlineStyle(
      newEditorState,
      'nameOfCustomStyle'
    ));
  }

  const handleReturn = (event) => {
    if (isSoftNewlineEvent(event)) {
      setEditorState(RichUtils.insertSoftNewline(editorState));
      return 'handled';
    }
            
    return 'not-handled';
  }

  const trimContent = (editorCurrentState) => {
    const editorState = editorCurrentState;
    let currentContent = editorState.getCurrentContent();
    const firstBlock = currentContent.getBlockMap().first();
    const lastBlock = currentContent.getBlockMap().last();
    const firstBlockKey = firstBlock.getKey();
    const lastBlockKey = lastBlock.getKey();
    const firstAndLastBlockIsTheSame = firstBlockKey === lastBlockKey;
    
    const textStart = firstBlock.getText()
    const trimmedTextStart = textStart.trimLeft();
    const lengthOfTrimmedCharsStart = textStart.length - trimmedTextStart.length;
    
    let newSelection = new SelectionState({
      anchorKey: firstBlockKey,
      anchorOffset: 0,
      focusKey: firstBlockKey,
      focusOffset: lengthOfTrimmedCharsStart
    });
    
    currentContent = Modifier.replaceText(
      currentContent,
      newSelection,
      '',
    )
    
    let newEditorState = EditorState.push(
      editorState,
      currentContent,
    )

    let offset = 0;
    
    if (firstAndLastBlockIsTheSame) {
      offset = lengthOfTrimmedCharsStart
    }

    const textEnd = lastBlock.getText()
    const trimmedTextEnd = textEnd.trimRight();
    const lengthOfTrimmedCharsEnd = textEnd.length - trimmedTextEnd.length

    newSelection = new SelectionState({
      anchorKey: lastBlockKey,
      anchorOffset: trimmedTextEnd.length - offset,
      focusKey: lastBlockKey,
      focusOffset: textEnd.length - offset
    });
    
    currentContent = Modifier.replaceText(
      currentContent,
      newSelection,
      '',
    )

    newEditorState = EditorState.push(
      editorState,
      currentContent,
    )

    return newEditorState;
  }

  const clearData = () => {
    const draftJsField = EditorState.moveFocusToEnd(EditorState.push(editorState, ContentState.createFromText(''), 'remove-range'));
    // const clearedEditorState = EditorState.push(editorState, ContentState.createFromText(''));
    setEditorState(draftJsField);
  }

  const handleSubmit = () => {
    const content = editorState.getCurrentContent().getPlainText('');
    if (content.trim().length > 0) {
      let trimedData = trimContent(editorState)
      submit(convertToRaw(trimedData.getCurrentContent()), clearData)
    }
  }

  return (
    <div className={styles.editorWrapper}>
      <div className={styles.editorContainer}>
        {/* <div className={styles.toolBar}>
          <Toolbar editorState={editorState} setEditorState={setEditorState}/>
        </div> */}
        {/* <div className={styles.actionBarLeft}>
          <span><MdAddCircle /></span>
        </div> */}
        <div className={`${styles.editorArea} ${className}`}>
          <Editor
            placeholder="Write something!"
            editorKey="foobaz"
            ref={draftRef}
            editorState={editorState}
            onChange={setEditorState}
            handleKeyCommand={handleKeyCommand}
            keyBindingFn={handleKeyBinding}
            handleReturn={handleReturn}
            onBlur={handleOnBlur}
          />
        </div>
        <div className={styles.actionBarRight}>
          <span id="main-editor-key" onClick={() => handleEmojiPicker('main-editor-key')}><MdOutlineEmojiEmotions /></span>
        </div>
      </div>
      <EmojiDropdown
        show={showEmojiDropdown}
        toggle={toggleEmojiDropdown}
        handleSelectedEmoji={handleSelectedEmoji}
        messageId='main-editor-key'
      />
    </div>
  );
}

export default SimpleEditor;