
import {useEffect} from 'react'
import { chatService } from "../../../src/services";
import { chatActionTypes } from "../../../src/store/chat/chat.actiontype";
import { useDispatch } from 'react-redux';


const AddUsersTopGroup = ({groupId}) => {

  const dispatch = useDispatch()

  const getGroupInfo = async (groupId) => {
    try {
      let {data: {data}} = await chatService.getGroupInfo(groupId)
      let obj = {
        group: data
      }
      dispatch({type: chatActionTypes.CURRENT_SELECTED_GROUP, data: obj})
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getGroupInfo(groupId);
  }, [groupId]);

  return (
    <div>
      Add users to group
    </div>
  )
}

export default AddUsersTopGroup;