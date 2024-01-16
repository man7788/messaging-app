import styles from './UserList.module.css';
import User from './User';

const UserList = ({ profiles, profilesLoading, profilesError }) => {
  if (profilesError) {
    return (
      <div>
        <h1>A network error was encountered</h1>
      </div>
    );
  }

  if (profilesLoading) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className={styles.UserList}>
      {profiles.map((profile) => (
        <User key={profile._id} profile={profile} />
      ))}
    </div>
  );
};

export default UserList;