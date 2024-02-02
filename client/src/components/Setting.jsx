import styles from './Setting.module.css';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';

const Setting = () => {
  const [editRedirect, setEditRedirect] = useState(null);
  const [passwordRedirect, setPasswordRedirect] = useState(null);
  const [appRedirect, setAppRedirect] = useState(null);

  const onEdit = () => {
    setEditRedirect(true);
  };

  const onPassword = () => {
    setPasswordRedirect(true);
  };

  const onLogOut = () => {
    localStorage.clear();
    setAppRedirect(true);
  };

  return (
    <div className={styles.Setting}>
      <div className={styles.button} onClick={onEdit}>
        <button>Edit Profile</button>
      </div>
      <div className={styles.button} onClick={onPassword}>
        <button>Change Password</button>
      </div>
      <hr></hr>
      <div className={styles.button} onClick={onLogOut}>
        <button>Log Out</button>
      </div>

      {editRedirect && <Navigate to="/profile/edit" />}
      {passwordRedirect && <Navigate to="/password/edit" />}
      {appRedirect && <Navigate to="/" replace={true} />}
    </div>
  );
};

export default Setting;
