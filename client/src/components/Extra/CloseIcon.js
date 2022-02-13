import { MdClose } from "react-icons/md";
import styles from './../../assets/styles/components/Extra/CloseIcon.module.scss';

const CloseIcon = ({onClick}) => {
  return (
    <div className={styles.CloseIcon} onClick={onClick}>
      <div className={styles.icon}>
        <MdClose/>
      </div>
    </div>
  )
}

export default CloseIcon;