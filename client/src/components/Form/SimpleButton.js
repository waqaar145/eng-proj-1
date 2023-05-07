import styles from "./../../assets/styles/components/Form/SimpleButton.module.scss";

const SimpleButton = ({ text, type, disabled, buttonStyle, size, onClick, icon, ...restProps }) => {
  return (
    <button
      type={type}
      className={`${styles[buttonStyle || 'defaultButton']} ${size === 'lg' ? styles.lg : size === 'sm' ? styles.sm : styles.xs}`}
      disabled={disabled}
      onClick={onClick}
      {...restProps}
    >
      {text} {icon && <span className={styles.buttonIcon}>{icon}</span>}
    </button>
  );
};

export default SimpleButton;
