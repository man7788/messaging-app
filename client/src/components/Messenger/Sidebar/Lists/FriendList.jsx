import styles from './FriendList.module.css';
import Friend from './Friend';
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
      className={isOverFlow ? styles.FriendListFlow : styles.FriendList}
      ref={listRef}
    >
      {renderList ? (
        friends.map((friend) => {
          if (friend.user_id !== loginId) {
            return (
              <Friend
                key={friend._id}
                profile={friend}
                online={friend.online}
              />
            );
          }
        })
      ) : (
        <div className={styles.empty}>Friend list is empty</div>
      )}
    </div>
  );
};

export default FriendList;
