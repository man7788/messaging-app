import styles from './UserList.module.css';
import { useEffect, useRef, useState } from 'react';
import useProfiles from '../../../../fetch/UserAPI';
import useSentRequests from '../../../../fetch/useSentRequestsAPI';
import User from './User';

const UserList = ({ loginId, friends, friendsError, friendsLoading }) => {
  const listRef = useRef();
  const { profiles, profilesLoading, profilesError } = useProfiles();
  const { requests, requestsLoading, requestsError } = useSentRequests();
  const [notFriends, setNotFriends] = useState([]);

  const [renderList, setRenderList] = useState(null);
  const [isOverFlow, setIsOverFlow] = useState(null);

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

  if (profilesError || friendsError || requestsError) {
    return (
      <div className={styles.error} data-testid="error">
        <h1>A network error was encountered</h1>
      </div>
    );
  }

  if (profilesLoading || friendsLoading || requestsLoading) {
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
            let sent = false;
            for (const request of requests) {
              if (request.to === profile.user_id) {
                sent = true;
              }
            }
            return <User key={profile._id} profile={profile} sent={sent} />;
          }
        })}
    </div>
  );
};

export default UserList;
