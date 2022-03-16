import Modal from "./../../../src/components/Modal/confirmModal";
import Button from "./../../../src/components/Form/Button";
import styles from "./../../../src/assets/styles/chat/ConfirmModal.module.scss";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { MdDelete } from "@react-icons/all-files/md/MdDelete";

const ConfirmModal = ({
  show,
  toggle,
  id,
  titleText,
  bodyText,
  handleDelete,
  handleToggle,
  loading,
  buttonText
}) => {
  return (
    <Modal visible={show} toggle={toggle}>
      <div className="eng-confirm-header">
        <div className={styles.header}>{titleText}</div>
      </div>
      <div className="eng-confirm-body">
        <div className={styles.body}>{bodyText}</div>
      </div>
      <div className="eng-confirm-footer">
        <div className={styles.footer}>
          <div></div>
          <div className={styles.actions}>
            <Button
              text="Cancel"
              onClick={() => handleToggle()}
              size="sm"
              icon={<MdClose />}
            />
            <Button
              text={`${buttonText ? buttonText : 'Delete'}`}
              onClick={() => handleDelete(id)}
              size="sm"
              disabled={loading}
              icon={<MdDelete />}
              buttonStyle="dangerButton"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
