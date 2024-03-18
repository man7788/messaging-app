import styles from './Request.module.css';
import { useEffect, useState } from 'react';
import avatar from '../../../../images/avatar.svg';

const Request = ({ profile }) => {
  const onAcceptRequest = () => {};

  return (
    <div className={styles.Request}>
      <div className={styles.avatarContainer}>
        <img src={avatar}></img>
      </div>
      {profile.full_name}
      <button onClick={onAcceptRequest}>Accept</button>
    </div>
  );
};

export default Request;
