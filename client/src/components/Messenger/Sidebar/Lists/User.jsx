import styles from './User.module.css';
import { useState } from 'react';
import PropTypes from 'prop-types';
import RequestCreateFetch from '../../../../fetch/users/RequestCreateAPI';
import FriendCreateFetch from '../../../../fetch/users/FriendCreateAPI';
import avatar from '../../../../images/avatar.svg';

const User = ({ profile, sent, received }) => {
  const [sentRequest, setSentRequest] = useState(null);
  const [accepted, setAccepted] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSendRequest = async () => {
    setLoading(true);

    let requestPayload = { user_id: profile.user_id };

    const { error, responseData } = await RequestCreateFetch(requestPayload);

    if (error) {
      setError(true);
    }

    if (responseData && responseData.createdRequest) {
      setSentRequest(true);
      setLoading(false);
    }
  };

  const onAcceptRequest = async () => {
    setLoading(true);

    let addFriendPayload = { user_id: profile.user_id };

    const { error, responseData } = await FriendCreateFetch(addFriendPayload);

    if (error) {
      setError(true);
    }

    if (responseData && responseData.createdFriend) {
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
        <div className={styles.User} data-testid="user">
          <div className={styles.avatarContainer}>
            <img className={styles.img} src={avatar}></img>
          </div>
          {profile.full_name}
          {!sent && !received && !sentRequest && (
            <button className={styles.send} onClick={onSendRequest}>
              Send Request
            </button>
          )}
          {(sent || sentRequest) && (
            <div className={styles.requestSent}>Request Sent</div>
          )}
          {received && (
            <button className={styles.accept} onClick={onAcceptRequest}>
              Accept Friend
            </button>
          )}
        </div>
      )}
    </>
  );
};

User.propTypes = {
  profile: PropTypes.object.isRequired,
  sent: PropTypes.bool.isRequired,
  received: PropTypes.bool.isRequired,
};

export default User;
