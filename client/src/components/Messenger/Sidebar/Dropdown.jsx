import styles from './Dropdown.module.css';
import { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { chatContext } from '../../../contexts/chatContext';
import LogoutFetch from '../../../fetch/LogoutAPI';

const Dropdown = ({ setShowUserList, setShowFriendList, setShowSettings }) => {
  const { setError } = useContext(chatContext);
  const [appRedirect, setAppRedirect] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSettings = (e) => {
    e.stopPropagation();
    setShowSettings(true);
    setShowUserList(false);
    setShowFriendList(false);
  };

  const onLogOut = async (e) => {
    e.stopPropagation();
    setLoading(true);

    const result = await LogoutFetch();

    if (result && result.error) {
      setError(true);
    }

    if (result && result.responseData) {
      localStorage.clear();
      setLoading(false);
      setAppRedirect(true);
    }
  };

  return (
    <>
      {loading ? (
        <div className={styles.loading} data-testid="loading">
          <div className={styles.loader}></div>
        </div>
      ) : (
        <div className={styles.Dropdown} id="dropdown" data-testid="dropdown">
          <div className={styles.button} onClick={onSettings}>
            <button>Settings</button>
          </div>
          <hr id="dropdown"></hr>
          <div className={styles.button} id="logout" onClick={onLogOut}>
            <button id="logout">Log Out</button>
          </div>
          {appRedirect && <Navigate to="/" replace={true} />}
        </div>
      )}
    </>
  );
};

export default Dropdown;
