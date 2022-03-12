import styles from "./../../assets/styles/components/Form/SimpleInput.module.scss";

const SimpleInput = ({
  type,
  name,
  label,
  placeholder,
  handleChange,
  value,
  inputRef,
  required,
  handleBlur,
  error,
  ...restProps
}) => {
  return (
    <div className={`${styles.inputWrapper} ${error ? styles.error : ""}`}>
      <label
        className={`${!required ? styles.notRequired : styles.inputBoxLabel}`}
      >
        <span>{label}</span>{" "}
        {required && <span className={styles.requiredField}>*</span>}
      </label>
      <input
        type={type}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleChange(e.target)}
        onBlur={handleBlur}
        ref={inputRef}
        className={styles.inputControl}
        {...restProps}
      />
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

export default SimpleInput;
