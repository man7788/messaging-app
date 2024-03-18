import styles from './User.module.css';
import { useState } from 'react';
import RequestCreateFetch from '../../../../fetch/RequestCreateAPI';
import avatar from '../../../../images/avatar.svg';

const User = ({ profile, sent }) => {
  const [sentRequest, setSentRequest] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSendRequest = async () => {
    setLoading(true);

    let requestPayload = { user_id: profile.user_id };

    const result = await RequestCreateFetch(requestPayload);

    if (result && result.error) {
      setError(true);
    }

    if (result && result.responseData) {
      setSentRequest(true);
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
    <div className={styles.User}>
      <div className={styles.avatarContainer}>
        <img src={avatar}></img>
      </div>
      {profile.full_name}
      {!sent && !sentRequest && (
        <button onClick={onSendRequest}>Add Friend</button>
      )}
      {(sent || sentRequest) && <div>Request sent</div>}
    </div>
  );
};

export default User;
