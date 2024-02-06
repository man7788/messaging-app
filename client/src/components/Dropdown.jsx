import styles from './Dropdown.module.css';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';

const Dropdown = ({ setShowUserList }) => {
  const [appRedirect, setAppRedirect] = useState(false);

  const onSettings = () => {
    setShowUserList(false);
  };

  const onLogOut = (e) => {
    e.stopPropagation();
    localStorage.clear();
    setAppRedirect(true);
  };

  return (
    <div className={styles.Dropdown}>
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

export default Dropdown;
