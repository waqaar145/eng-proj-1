
import {useCallback, useEffect, useState} from 'react'
import { chatService } from "../../../src/services";
import { chatActionTypes } from "../../../src/store/chat/chat.actiontype";
import { useDispatch } from 'react-redux';
import styles from './../../../src/assets/styles/chat/AddUsersToGroup.module.scss'
import CloseIcon from "./../../../src/components/Extra/CloseIcon";
import SimpleInput from '../../../src/components/Form/SimpleInput';
import debounce from 'lodash.debounce';

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

  const [values, setValues] = useState({name: ""})

  const handleChange = (target) => {
    const {name, value} = target;
    setValues({...values, [name]: value});
    handleDebounce(value)
  }

  const handleSearchUsers = (value) => {
    try {

    } catch (error) {
      console.log(error);
    }
  }

  const handleDebounce = useCallback(
    debounce(nextValue => handleSearchUsers(nextValue), 1000),
    [],
  );


  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.title}>
          Add Members to Group
        </div>
        <div className={styles.action}>
          <CloseIcon onClick={() => {}} />
        </div>
      </div>
      <div className={styles.body}>
       <div className={styles.inputBox}>
        <SimpleInput
          type="text"
          name="name"
          label="Search emails/usernames to add"
          placeholder="Type here..."
          handleChange={handleChange}
          value={values.name}
        />
       </div>
      </div>
    </div>
  )
}

export default AddUsersTopGroup;