import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Toolbar from './Toolbar';
import useNormalDropdown from '../../../src/hooks/useNormalDropdown';
import styles from './../../../src/assets/styles/components/Editor.module.scss'
const Draft = require('draft-js');

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

const { Editor, EditorState, RichUtils, Modifier, SelectionState } = Draft;

const SimpleEditor = ({handleStateChange}) => {

  const draftRef = useRef(null)
  const [editorState, setEditorState] = React.useState(EditorState.createWithContent(emptyContentState));

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  }

  useEffect(() => {
    draftRef.current.focus()
  }, []);

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

  const handleSelectedEmoji = ({native}) => {
    addAndFocusAtTheEnd(native)
  }

  const addAndFocusAtTheEnd = (native) => {
    // get current editor state 
    const currentContent = editorState.getCurrentContent();

    // create new selection state where focus is at the end
    const blockMap = currentContent.getBlockMap();
    const key = blockMap.last().getKey();
    const length = blockMap.last().getLength();
    const selection = new SelectionState({
        anchorKey: key,
        anchorOffset: length,
        focusKey: key,
        focusOffset: length,
      });

    //insert text at the selection created above 
    const textWithInsert = Modifier.insertText(currentContent, selection, native, null);
    const editorWithInsert = EditorState.push(editorState, textWithInsert, 'insert-characters');

    // //also focuses cursor at the end of the editor 
    const newEditorState = EditorState.moveFocusToEnd(editorWithInsert);
    setEditorState(newEditorState);
  }

  return (
    <div className={styles.editorWrapper}>
      <div className={styles.editorContainer}>
        <div className={styles.toolBar}>
          <Toolbar editorState={editorState} setEditorState={setEditorState}/>
        </div>
        <div className={`${styles.editorArea} ${className}`}>
          <Editor
            placeholder="Write something!"
            editorKey="foobaz"
            ref={draftRef}
            editorState={editorState}
            onChange={setEditorState}
            handleKeyCommand={handleKeyCommand}
          />
        </div>
        {/* <div className={styles.actionBar}>
          <span style={{float: 'right'}} id="dddd-123123" onClick={() => handleEmojiPicker('dddd-123123', 12)}>Emoji Picker</span>
        </div> */}
      </div>
      <EmojiDropdown
        show={showEmojiDropdown}
        toggle={toggleEmojiDropdown}
        handleSelectedEmoji={handleSelectedEmoji}
        messageId='dddd-123123'
      />
    </div>
  );
}

export default SimpleEditor;