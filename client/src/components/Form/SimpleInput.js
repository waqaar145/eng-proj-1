import styles from './../../assets/styles/components/Form/SimpleInput.module.scss'

const SimpleInput = ({type, name, label, placeholder, handleChange, value, inputRef, error, ...restProps}) => {
  const errorBool = !!error;
  return (
    <div className={`${styles.inputWrapper}  ${errorBool ? styles.error : ''}` }>
      <label className={styles.inputBoxLabel}>
        {label}
      </label>
      <input type={type} name={name} type={type} placeholder={placeholder} value={value} onChange={(e) => handleChange(e.target)} ref={inputRef} className={styles.inputControl} {...restProps}/>
      {errorBool && <div className={styles.errorMessage}>{error}</div>}
    </div>
  )
}

export default SimpleInput;