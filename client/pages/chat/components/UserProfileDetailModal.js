import Modal from "./../../../src/components/Modal/main";
import Button from "./../../../src/components/Form/Button";
import styles from "./../../../src/assets/styles/chat/UserProfileDetailModal.module.scss";
import { MdCall } from "@react-icons/all-files/md/MdCall";
import { MdMail } from "@react-icons/all-files/md/MdMail";

const UserProfileDetailModal = ({ activeModal, show, toggle }) => {
  return (
    <Modal visible={show} toggle={toggle}>
      <div className={styles.profileWrapper}>
        <div className={styles.profilePicture}>
          <img src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500" />
        </div>
        <div className={styles.profileDetails}>
          <div className={styles.userName}>
            John Doe
          </div>
          <div className={styles.userDesc}>
            Senior Software Developer
          </div>
        </div>
        <div className={styles.action}>
          <div className={styles.button}>
            <Button icon={<MdMail />} text="Message" onClick={() => {}} disabled={false} size="sm" />
          </div>
          <div className={styles.button}>
            <Button icon={<MdCall />} text="Call" onClick={() => {}} disabled={false} size="sm" />
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default UserProfileDetailModal;