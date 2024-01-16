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
      <button onClick={onEdit}>Edit Profile</button>
      {editRedirect && <Navigate to="/profile/edit" />}
      <button onClick={onPassword}>Change Password</button>
      {passwordRedirect && <Navigate to="/password/edit" />}
      <button onClick={onLogOut}>Log Out</button>
      {appRedirect && <Navigate to="/" replace={true} />}
    </div>
  );
};

export default Setting;
