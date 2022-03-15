const CurrentUserChattingTo = ({ styles, currentSelectedGroup, showMembers }) => {
  return (
    <>
      {currentSelectedGroup.groupType === 'private' && <div className={styles.profilePicture}>
        <img src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500" />
      </div>}
      <div className={`${styles.loggedinUserDetails} ${currentSelectedGroup.groupType === 'group' ? styles.currentChatActiveDiv : ''}`}>
        <div className={styles.info}>
          <div className={styles.loggedinUserName}>{Object.keys(currentSelectedGroup).length > 0 && `${currentSelectedGroup.groupType !== 'private' ? '#' : ''} ${currentSelectedGroup.groupName}`}</div>
          <div className={styles.loggedinUserDesig}>
            { currentSelectedGroup.groupType === 'public' || currentSelectedGroup.groupType === 'group' ? `${currentSelectedGroup.members} (members)` : 'Senior Software Developer' }
          </div>  
        </div>
        {
          currentSelectedGroup.groupType === 'group'
          &&
          <div className={styles.actions}>
            <span className={styles.showMembers} onClick={() => showMembers()}>Show Members</span>
          </div>
        }
      </div>
    </>
  );
};

export default CurrentUserChattingTo;
