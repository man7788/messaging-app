import styles from './UserList.module.css';
import User from './User';
import { useEffect, useRef, useState } from 'react';

const UserList = ({ loginId, profiles, profilesLoading, profilesError }) => {
  const listRef = useRef();
  const [renderList, setRenderList] = useState(null);
  const [isOverFlow, setIsOverFlow] = useState(null);

  useEffect(() => {
    if (profiles && profiles.length > 0) {
      setRenderList(true);
    }

    if (listRef.current?.scrollHeight > listRef.current?.clientHeight) {
      setIsOverFlow(true);
    }
  }, [profiles]);

  if (profilesError) {
    return (
      <div className={styles.error} data-testid="error">
        <h1>A network error was encountered</h1>
      </div>
    );
  }

  if (profilesLoading) {
    return (
      <div className={styles.loading} data-testid="loading">
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <div
      className={isOverFlow ? styles.UserListFlow : styles.UserList}
      ref={listRef}
    >
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
