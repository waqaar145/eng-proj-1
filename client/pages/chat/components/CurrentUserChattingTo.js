const CurrentUserChattingTo = ({
  styles,
  currentSelectedGroup,
  showMembers,
}) => {
  return (
    <>
      {currentSelectedGroup.groupType === "private" && (
        <div className={styles.profilePicture}>
          <img
            src={currentSelectedGroup.currentUser.dp}
            alt={`${currentSelectedGroup.currentUser.firstName} ${currentSelectedGroup.currentUser.lastName}`}
          />
        </div>
      )}
      <div
        className={`${styles.loggedinUserDetails} ${
          currentSelectedGroup.groupType === "group"
            ? styles.currentChatActiveDiv
            : ""
        }`}
      >
        <div className={styles.info}>
          <div className={styles.loggedinUserName}>
            {currentSelectedGroup.groupType !== "private" &&
              Object.keys(currentSelectedGroup).length > 0 &&
              `${currentSelectedGroup.groupType !== "private" ? "#" : ""} ${
                currentSelectedGroup.groupName
              }`}
            {currentSelectedGroup.groupType === "private" &&
              currentSelectedGroup.currentUser &&
              Object.keys(currentSelectedGroup).length > 0 &&
              `${currentSelectedGroup.currentUser.firstName} ${currentSelectedGroup.currentUser.lastName}`}
          </div>
          <div className={styles.loggedinUserDesig}>
            {currentSelectedGroup.groupType === "public" ||
            currentSelectedGroup.groupType === "group"
              ? `${currentSelectedGroup.members} (members)`
              : currentSelectedGroup.currentUser
              ? currentSelectedGroup.currentUser.designation
              : ""}
          </div>
        </div>
        {currentSelectedGroup.groupType === "group" && (
          <div className={styles.actions}>
            <span className={styles.showMembers} onClick={() => showMembers()}>
              Show Members
            </span>
          </div>
        )}
      </div>
    </>
  );
};

export default CurrentUserChattingTo;
