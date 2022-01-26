import styles from "./../../assets/styles/components/Form/Button.module.scss";

const Button = ({ text, disabled, buttonStyle, size, onClick, icon, ...restProps }) => {
  return (
    <button
      className={`${styles[buttonStyle || 'defaultButton']} ${size === 'lg' ? styles.lg : size === 'sm' ? styles.sm : styles.xs}`}
      disabled={disabled}
      onClick={onClick}
      {...restProps}
    >
      {text} {icon && <span className={styles.buttonIcon}>{icon}</span>}
    </button>
  );
};

export default Button;
