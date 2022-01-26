import {useState, useRef} from 'react'
import Modal from "../../../src/components/Modal/main";
import {
  ModalHeader,
  ModalBody,
} from "./../../../src/components/Modal/ModalElements";
import styles from "./../../../src/assets/styles/chat/CreateGroup.module.scss";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import EngTooltip from "../../../src/components/Tooltip";
import SimpleInput from "./../../../src/components/Form/SimpleInput";
import Button from "./../../../src/components/Form/Button";
import { FaPlus } from "@react-icons/all-files/fa/FaPlus";
import { stringRangeValidation} from './../../../src/utils/validations'

const CreateGroupModal = ({ show, toggle }) => {

  const inputRef = useRef(null)

  const [values, setValues] = useState({
    groupName: "",
    description: ""
  })
  const [errors, setErrors] = useState({});

  const handleChange = (data) => {
    const {
      name, value
    } = data;
    setValues({ ...values, [name]: value })
    handleError(data)
  }

  const fieldValidation = (name, value) => {
    let error;
    if (name === 'groupName') {
      error = stringRangeValidation(name, value, true, 0, 50);
    } else if (name === 'description') {
      error = stringRangeValidation(name, value, false, 0, 500);
    }
    return error;
  }

  const handleError = ({name, value}) => {
    let error = fieldValidation(name, value)
    if (error !== true) {
      setErrors({...errors, [name]: error})
    } else {
      delete errors[name]
      setErrors(errors)
    }
  }

  const submitValidation = (data) => {
    let errorObj = {};
    for (const [name, value] of Object.entries(data)) {
      let error = fieldValidation(name, value)
      if (error !== null) {
        errorObj[name] = error;
      } else {
        delete errorObj[name]
      }
    }
    setErrors({...errors, ...errorObj})
    return Object.keys(errorObj).length !== 0
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = submitValidation(values)
    console.log(error)
    console.log('submit')
  }

  console.log(errors)


  return (
    <Modal visible={show} toggle={toggle}>
      <ModalHeader>
        <div className={styles.modalHeaderWrapper}>
          <div className={styles.modelTitle}>Create Group</div>
          <div className={styles.actionWrapper}>
            <div className={styles.icon} onClick={toggle}>
              <EngTooltip text="Close">
                <MdClose />
              </EngTooltip>
            </div>
          </div>
        </div>
      </ModalHeader>
      <ModalBody>
        <form className={styles.formWrapper} onSubmit={handleSubmit}>
          <div className={styles.inputField}>
            <SimpleInput
              label="Enter group name"
              name="groupName"
              type="text"
              placeholder="Enter group name"
              handleChange={handleChange}
              value={values.groupName}
              autoFocus
              inputRef={inputRef}
              autoComplete="off"
              error={errors.groupName}
            />
          </div>
          <div className={styles.inputField}>
            <SimpleInput
              label="Enter Description"
              name="description"
              type="text"
              placeholder="Description (Optional)"
              handleChange={handleChange}
              value={values.description}
              autoComplete="off"
              error={errors.description}
            />
          </div>
          <div className={styles.message}>
            Create and add users to group to start practicing
          </div>
          <div className={styles.buttonWrapper}>
            <Button
              text="Create Group"
              onClick={handleSubmit}
              size="sm"
              icon={<FaPlus />}
              buttonStyle="primeButton"
            />
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
};

export default CreateGroupModal;
