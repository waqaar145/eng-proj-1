import { useEffect, useState } from "react"; 
import Editor from "./../../../src/components/Form/InputEditor";
import { chatService } from "../../../src/services";
import { useDispatch } from 'react-redux';
import { chatActionTypes } from "../../../src/store/chat/chat.actiontype";
import { useRouter } from "next/router";


const EditorArea = ({parentId, message, editing, onBlur}) => {

  const dispatch = useDispatch();

  const router = useRouter();
  const {
    groupId
  } = router.query;

  const [value, setValue] = useState("")

  const handleOnChange = (e) => {
    const {
      value
    } = e.target;
    setValue(value)
  }

  // Editing message
  const [messageId, setMessageId] = useState(null);
  useEffect(() => {
    if (message && editing) {
      setValue(message.message);
      setMessageId(message.id);
    }
  }, [message, editing])

  const handleKeypress = async (e) => { 
    if(e.key === 'Enter' && !e.shiftKey){
      if (value.trim()) {
        e.preventDefault();
        if (!editing) { // Adding a message
          try {
            let chatObj = {
              groupId,
              message: value,
              parentId: parentId
            }
            let {data: {data}} = await chatService.addChat(chatObj);
            if (!parentId) {
              dispatch({type: chatActionTypes.ADD_NEW_MESSAGE, data: {[data.id]: data}})
            } else {
              dispatch({type: chatActionTypes.REPLY_MESSAGE, data})
            }
          } catch (error) {
            console.log('Error when adding a message')
            console.log(error)
          }
        } else { //Editing a message
          try {
            let chatObj = {
              message: value
            }
            let {data: {data}} = await chatService.updateChat(chatObj, messageId);
            dispatch({type: chatActionTypes.UPDATE_MESSAGE, data})
            setTimeout(() => onBlur())
          } catch (error) {
            console.log('Error when updating a message')
            console.log(error)
          }
        }
      }
      setValue("")
    }
  }

  return (
    <Editor 
        value={value}
        onChange={handleOnChange} 
        onKeyPress={handleKeypress}
        onBlur={onBlur}
      />
  )
}

export default EditorArea;