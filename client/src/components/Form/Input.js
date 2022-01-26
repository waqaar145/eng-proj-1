import styles from './../../assets/styles/components/Form/Input.module.scss'

const InputBox = ({type, name, label, placeholder, handleChange, error, ...restProps}) => {
  const errorBool = !!error;
  return (
    <div className={`${styles.inputWrapper} ${errorBool ? styles.error : ''}`}>
      <label className={styles.inputBox}>
        <input name={name} type={type} placeholder={placeholder} onChange={(e) => handleChange(e.target)} {...restProps}/>
        <span className={`${styles.label}`}>{label}</span>
      </label>
      {errorBool && <div className={styles.errorMessage}>{error}</div>}
    </div>
  )
}

export default InputBox;