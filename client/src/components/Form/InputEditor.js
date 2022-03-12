import styles from "./../../assets/styles/components/Form/InputEditor.module.scss";

const InputBox = ({
  type,
  name,
  label,
  placeholder,
  required,
  value,
  handleChange,
  handleBlur,
  onBlur,
  inputRef,
  error,
  ...restProps
}) => {
  const moveCaretAtEnd = (e) => {
    var temp_value = e.target.value;
    e.target.value = "";
    e.target.value = value;
  };

  return (
    <div className={`${styles.inputWrapper} ${error ? styles.error : ""}`}>
      <label className={`${!required ? styles.notRequired : styles.inputBoxLabel}`}>
        <span>{label}</span> {required && <span className={styles.requiredField}>*</span>}
      </label>
      <textarea
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleChange(e.target)}
        onBlur={handleBlur}
        value={value}
        ref={inputRef}
        {...restProps}
      />
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

export default InputBox;
