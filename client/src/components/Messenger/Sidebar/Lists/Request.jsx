import styles from './Request.module.css';
import { useState } from 'react';
import FriendFetch from '../../../../fetch/FriendAPI';
import avatar from '../../../../images/avatar.svg';

const Request = ({ profile }) => {
  const [accepted, setAccepted] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onAcceptRequest = async () => {
    setLoading(true);

    let addFriendPayload = { user_id: profile.from };

    const result = await FriendFetch(addFriendPayload);

    if (result && result.error) {
      setError(true);
    }

    if (result && result.responseData) {
      setAccepted(true);
      setLoading(false);
    }
  };

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
    <>
      {accepted ? null : (
        <div className={styles.Request}>
          <div className={styles.avatarContainer}>
            <img src={avatar}></img>
          </div>
          {profile.full_name}
          <button onClick={onAcceptRequest}>Accept</button>
        </div>
      )}
    </>
  );
};

export default Request;
