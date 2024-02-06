import styles from './Setting.module.css';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';

const Setting = ({ setShowUserList }) => {
  const [appRedirect, setAppRedirect] = useState(null);

  const onSettings = () => {
    setShowUserList(false);
  };

  const onLogOut = () => {
    localStorage.clear();
    setAppRedirect(true);
  };

  return (
    <div className={styles.Setting}>
      <div className={styles.button} onClick={onSettings}>
        <button>Settings</button>
      </div>
      <hr></hr>
      <div className={styles.button} onClick={onLogOut}>
        <button>Log Out</button>
      </div>

      {appRedirect && <Navigate to="/" replace={true} />}
    </div>
  );
};

export default Setting;
