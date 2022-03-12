import styles from './../../assets/styles/components/Extra/Spinner.module.scss';
import {Spinner} from 'react-bootstrap';
const MySpinner = () => {
  return (
    <div className={styles.spinner}>
      <Spinner animation="border" size='sm' />
    </div>
  )
}

export default MySpinner;