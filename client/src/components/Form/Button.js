import styles from "./../../assets/styles/components/Form/Button.module.scss";
import Spinner from "./../Extra/Spinner";

const Button = ({ text, type, disabled, buttonStyle, size, round, onClick, icon, loading, loaderSize, ...restProps }) => {
  return (
    <button
      type={type}
      className={`${styles[buttonStyle || 'defaultButton']} ${size === 'lg' ? styles.lg : size === 'sm' ? styles.sm : styles.xs} ${round ? styles.round : ''}`}
      disabled={disabled}
      onClick={onClick}
      {...restProps}
    >
      {text} {(icon && !loading) && <span className={styles.buttonIcon}>{icon}</span>} {loading && <Spinner size="loaderSize" />}
    </button>
  );
};

export default Button;
