import styles from '../../src/assets/styles/Auth.module.scss'
import Link from "next/link";
import SocialLogins from './components/socialLogins'
import AuthBanner from './components/AuthBanner'
import SignupForm from './components/SignupForm'

const Signup = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.signup}>
        <div className={styles.signupText}>
          <span className={styles.smallText}>Have an account? </span> 
          <Link href="/auth/login" as="/signin">
            <a className={styles.link}>Sign in</a>
          </Link>
        </div>
        <div className={styles.signupFormWrapper}>
          <div className={styles.signupArea}>
            <div className={styles.signupTitleText}>
              Welcome to Remote English
            </div>
            <div className={styles.signupDescText}>
              Fill the signup form and get started in a minute. This is safe, secure and trusted by many.
            </div>
            <div className={styles.formWrapper}>
              <div className="row">
                <SignupForm 
                  styles={styles}
                />
                <SocialLogins 
                  text="Or sign up with"
                  styles={styles}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <AuthBanner 
        styles={styles}
        title={`Practice English Communication`}
        description={`Practice english communication at your comfort from anywhere. Intract with random people around the country to practice english, make group call to improve social communication and public speaking.`}
      />
    </div>
  )
}

export default Signup;
