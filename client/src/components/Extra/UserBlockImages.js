const UserBlockImages = ({profileReplies}) => {
  return (
      <div className="userBlockImages">
        {Array.isArray(profileReplies) &&
          profileReplies.map((profile) => {
            return (
              <img key={profile.id} src={profile.dp} alt={profile.name} />
            );
          })}
      </div>
  )
}

export default UserBlockImages;