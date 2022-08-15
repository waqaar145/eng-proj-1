import styles from "./../../assets/styles/components/Form/Button.module.scss";

const Button = ({ text, type, disabled, buttonStyle, size, round, onClick, icon, ...restProps }) => {
  return (
    <button
      type={type}
      className={`${styles[buttonStyle || 'defaultButton']} ${size === 'lg' ? styles.lg : size === 'sm' ? styles.sm : styles.xs} ${round ? styles.round : ''}`}
      disabled={disabled}
      onClick={onClick}
      {...restProps}
    >
      {text} {icon && <span className={styles.buttonIcon}>{icon}</span>}
    </button>
  );
};

export default Button;
