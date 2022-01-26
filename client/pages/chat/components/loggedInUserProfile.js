const LoggedinUserProfile = ({ styles, user }) => {
  return (
    <>
      <div className={styles.profilePicture}>
        <img src={user.dp} />
      </div>
      <div className={styles.loggedinUserDetails}>
        <div className={styles.loggedinUserName}>
          {user.first_name} {user.last_name}
        </div>
        <div className={styles.loggedinUserDesig}>{user.designation || ""}</div>
      </div>
    </>
  );
};

export default LoggedinUserProfile;
