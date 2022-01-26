const AuthBanner = ({styles, title, description}) => {
  return (
    <div className={styles.banner}>
      <div className={styles.signupArea}>
        <div className={styles.signupTitleText}>
          {title}
        </div>
        <div className={styles.signupDescText}>
          {description}
        </div>
      </div>
    </div>
  )
}

export default AuthBanner;