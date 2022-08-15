import styles from "./../../assets/styles/components/Extra/Spinner.module.scss";
import { Spinner } from "react-bootstrap";

const MySpinner = ({ size }) => {
  return (
    <div className={styles.spinner}>
      <Spinner animation="border" size={size || "sm"} style={{ width: "1.4rem", height: "1.4rem"}}/>
    </div>
  );
};

export default MySpinner;
