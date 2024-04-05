import styles from './GroupList.module.css';
import Group from './Group';
import { useEffect, useRef, useState } from 'react';

const GroupList = ({
  loginId,
  friends,
  friendsLoading,
  friendsError,
  groupList,
  setGroupList,
}) => {
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
      className={isOverFlow ? styles.GroupListFlow : styles.Group}
      ref={listRef}
    >
      {renderList ? (
        friends.map((friend) => {
          if (friend.user_id !== loginId) {
            return (
              <Group
                key={friend._id}
                profile={friend}
                groupList={groupList}
                setGroupList={setGroupList}
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

export default GroupList;
