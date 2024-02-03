import styles from './UserList.module.css';
import User from './User';
import { useEffect, useState } from 'react';

const UserList = ({ loginId, profiles, profilesLoading, profilesError }) => {
  const [renderList, setRenderList] = useState(null);

  useEffect(() => {
    if (profiles && profiles.length > 0) {
      setRenderList(true);
    }
  }, [profiles]);

  if (profilesError) {
    return (
      <div>
        <h1>A network error was encountered</h1>
      </div>
    );
  }

  if (profilesLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <div className={styles.UserList}>
      {renderList &&
        profiles.map((profile) => {
          if (profile.user_id !== loginId) {
            return <User key={profile._id} profile={profile} />;
          }
        })}
    </div>
  );
};

export default UserList;
