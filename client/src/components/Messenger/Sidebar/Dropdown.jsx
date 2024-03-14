import styles from './Dropdown.module.css';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';

const Dropdown = ({ setShowUserList, setShowFriendList, setShowSettings }) => {
  const [appRedirect, setAppRedirect] = useState(false);

  const onSettings = (e) => {
    e.stopPropagation();
    setShowSettings(true);
    setShowUserList(false);
    setShowFriendList(false);
  };

  const onLogOut = (e) => {
    e.stopPropagation();
    localStorage.clear();
    setAppRedirect(true);
  };

  return (
    <div className={styles.Dropdown} id="dropdown" data-testid="dropdown">
      <div className={styles.button} onClick={onSettings}>
        <button>Settings</button>
      </div>
      <hr id="dropdown"></hr>
      <div className={styles.button} onClick={onLogOut}>
        <button>Log Out</button>
      </div>
      {appRedirect && <Navigate to="/" replace={true} />}
    </div>
  );
};

export default Dropdown;
