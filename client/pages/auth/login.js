import InputBox from './../../src/components/Form/Input'
import Button from './../../src/components/Form/Button'
import styles from '../../src/assets/styles/Auth.module.scss'
import Link from "next/link";
import SocialLogins from './components/socialLogins'
import AuthBanner from './components/AuthBanner'
import SigninForm from './components/SigninForm'

const Signin = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.signup}>
        <div className={styles.signupText}>
          <span className={styles.smallText}>Don't have an account? </span>
          <Link href="/auth/signup" as="/signup">
            <a className={styles.link}>Sign up</a>
          </Link>
        </div>
        <div className={styles.signupFormWrapper}>
          <div className={styles.signupArea}>
            <div className={styles.signupTitleText}>
              Sign in to practice
            </div>
            <div className={styles.formWrapper}>
              <div className="row">
                <SigninForm 
                  styles={styles}
                  />
                <SocialLogins 
                  text="Or sign in with"
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

export default Signin;
