import Modal from "./../../../src/components/Modal/main";
import {
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "./../../../src/components/Modal/ModalElements";
import styles from "./../../../src/assets/styles/chat/CreateGroup.module.scss";
import CloseIcon from "./../../../src/components/Extra/CloseIcon";
import SimpleInput from "../../../src/components/Form/SimpleInput";
import InputEditor from "../../../src/components/Form/InputEditor";
import Button from "../../../src/components/Form/Button";
import { useState } from "react";
import { chatService } from "../../../src/services";
import { useDispatch } from "react-redux";
import { chatActionTypes } from "../../../src/store/chat/chat.actiontype";
import SimpleButton from "../../../src/components/Form/SimpleButton";
import { MdAdd } from 'react-icons/md'

const validation = {
  groupName(value) {
    if (!value || value === "" || value.trim().length === 0) {
      return "Group name is required.";
    }
    if (value.length > 80) {
      return "Group name must be less than 80 chracters long.";
    }
    return true;
  },
  description(value) {
    if (value.length > 500) {
      return "Description must be less than 500 chracters long.";
    }
    return true;
  },
};

const UserProfileDetailModal = ({ show, toggle, addGroupNameToList }) => {

  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({ groupName: "", description: "" });
  const [error, setError] = useState({});

  const handleChange = (e) => {
    const { name, value } = e;
    setValues({ ...values, [name]: value });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let errorMsg = validation[name](value);
    if (errorMsg !== true) {
      setError({ ...error, [name]: errorMsg });
    } else {
      delete error[name];
      setError({ ...error });
    }
  };

  const validateForm = () => {
    let obj = {};
    for (const [key, value] of Object.entries(values)) {
      let errorMsg = validation[key](values[key]);
      if (errorMsg !== true) {
        obj = {
          ...obj,
          [key]: errorMsg,
        };
      }
    }
    setError({ ...error, obj });
    return obj;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errorObj = validateForm();
    if (Object.keys(errorObj).length === 0) {
      try {
        setLoading(true);
        let {data: {data}} = await chatService.createGroup(values);
        dispatch({type: chatActionTypes.THREAD_MESSAGE_ID, data: null});
        setValues({
          ...values,
          groupName: "",
          description: ""
        });
        setError({});
        addGroupNameToList(data);
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <Modal visible={show} toggle={toggle}>
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <div className={styles.headerContainer}>
            <div className={styles.title}>Create Group</div>
            <div className={styles.title}>
              <CloseIcon onClick={() => toggle()} />
            </div>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className={styles.formContainer}>
            <SimpleInput
              type="text"
              name="groupName"
              label="Group Name"
              placeholder="Enter Group Name"
              required={true}
              handleChange={handleChange}
              handleBlur={handleBlur}
              value={values.groupName}
              error={error.groupName}
            />
            <InputEditor
              type="textarea"
              name="description"
              label="Description (Optional)"
              placeholder="Enter Description"
              handleChange={handleChange}
              handleBlur={handleBlur}
              value={values.description}
              error={error.description}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <div className={styles.footerContainer}>
            <SimpleButton
              text={`Create Group`}
              onClick={handleSubmit}
              disabled={loading}
              size="lg"
              buttonStyle="primeButton"
              icon={<MdAdd />}
            />
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default UserProfileDetailModal;
