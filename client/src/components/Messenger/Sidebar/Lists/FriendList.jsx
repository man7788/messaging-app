import styles from './UserList.module.css';
import User from './User';
import { useEffect, useRef, useState } from 'react';

const FriendList = ({ loginId, friends, friendsLoading, friendsError }) => {
  const listRef = useRef();
  const [renderList, setRenderList] = useState(null);
  const [isOverFlow, setIsOverFlow] = useState(null);

  useEffect(() => {
    if (friends && friends.length > 0) {
      setRenderList(true);
    }

    if (listRef.current?.scrollHeight > listRef.current?.clientHeight) {
      setIsOverFlow(true);
    }
  }, [friends]);

  if (friendsError) {
    return (
      <div className={styles.error} data-testid="error">
        <h1>A network error was encountered</h1>
      </div>
    );
  }

  if (friendsLoading) {
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
        friends.map((friend) => {
          if (friend.user_id !== loginId) {
            return <User key={friend._id} profile={friend} />;
          }
        })}
    </div>
  );
};

export default FriendList;
