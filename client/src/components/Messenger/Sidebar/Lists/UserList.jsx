import styles from './UserList.module.css';
import User from './User';
import { useEffect, useRef, useState } from 'react';

const UserList = ({ loginId, profileProps, friendProps }) => {
  const listRef = useRef();
  const { profiles, profilesLoading, profilesError } = profileProps;
  const { friends, friendsLoading, friendssError } = friendProps;
  const [notFriends, setNotFriends] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [renderList, setRenderList] = useState(null);
  const [isOverFlow, setIsOverFlow] = useState(null);

  useEffect(() => {
    if (profilesError || friendssError) {
      setError(true);
    }
  }, [profilesError, friendssError]);

  useEffect(() => {
    if (!profilesLoading && !friendsLoading) {
      setLoading(false);
    }
  }, [profilesLoading, friendsLoading]);

  useEffect(() => {
    const list = [];

    if (profiles && friends) {
      for (const profile of profiles) {
        const isFriend = [];

        for (const friend of friends) {
          if (profile.user_id === friend.user_id) {
            isFriend.push('is friend');
          }
        }

        if (isFriend.length === 0) {
          list.push(profile);
        }
      }
    }

    setNotFriends(list);
  }, [profiles, friends]);

  useEffect(() => {
    if (notFriends && notFriends.length > 0) {
      setRenderList(true);
    }

    if (listRef.current?.scrollHeight > listRef.current?.clientHeight) {
      setIsOverFlow(true);
    }
  }, [notFriends]);

  if (error) {
    return (
      <div className={styles.error} data-testid="error">
        <h1>A network error was encountered</h1>
      </div>
    );
  }

  if (loading) {
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
        notFriends.map((profile) => {
          if (profile.user_id !== loginId) {
            return <User key={profile._id} profile={profile} />;
          }
        })}
    </div>
  );
};

export default UserList;
