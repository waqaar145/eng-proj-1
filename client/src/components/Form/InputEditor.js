import styles from "./../../assets/styles/components/Form/InputEditor.module.scss";

const InputBox = ({
  type,
  name,
  label,
  placeholder,
  value,
  onChange,
  onKeyPress,
  onBlur,
  ...restProps
}) => {
  const moveCaretAtEnd = (e) => {
    var temp_value = e.target.value;
    e.target.value = "";
    e.target.value = value;
  };

  return (
    <div className={`${styles.inputWrapper}`}>
      <label className={styles.inputBox}>
        <textarea
          autoFocus
          onFocus={moveCaretAtEnd}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          onBlur={onBlur}
          {...restProps}
        />
      </label>
    </div>
  );
};

export default InputBox;
