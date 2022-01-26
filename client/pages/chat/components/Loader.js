import styles from './../../../src/assets/styles/chat/Loader.module.scss'

const Loader = ({color}) => {
  return (
    <div className={styles.searchUserResult}>
      <div className={`${styles.loadingMore} ${styles.padddingLoader}`}>
        <div className={`spinner-border ${!color ? 'spinner-main-color' : color}`} role="status"></div>
      </div>
    </div>
  );
};

export default Loader; 