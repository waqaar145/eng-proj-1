import { useState } from "react"; 
import Editor from "./../../../src/components/Form/InputEditor";
import { chatService } from "../../../src/services";
import { useDispatch } from 'react-redux';
import { chatActionTypes } from "../../../src/store/chat/chat.actiontype";
import { useRouter } from "next/router";


const EditorArea = ({parentId}) => {

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

  const handleKeypress = async (e) => { 
    if(e.key === 'Enter' && !e.shiftKey){
      if (value.trim()) {
        e.preventDefault();
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
          console.log(error)
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
      />
  )
}

export default EditorArea;