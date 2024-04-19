import styles from './Dropdown.module.css';
import { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { chatContext } from '../../../contexts/chatContext';
import LogoutFetch from '../../../fetch/messenger/LogoutAPI';

const Dropdown = ({
  setShowUserList,
  setShowFriendList,
  setShowGroupList,
  setShowSettings,
}) => {
  const { setError } = useContext(chatContext);
  const [appRedirect, setAppRedirect] = useState(false);
  const [loading, setLoading] = useState(false);

  const onNewGroup = (e) => {
    e.stopPropagation();
    setShowGroupList(true);
    setShowUserList(false);
    setShowFriendList(false);
  };

  const onSettings = (e) => {
    e.stopPropagation();
    setShowSettings(true);
    setShowUserList(false);
    setShowFriendList(false);
  };

  const onLogOut = async (e) => {
    e.stopPropagation();
    setLoading(true);

    const { error, responseData } = await LogoutFetch();

    if (error) {
      setError(true);
    }

    if (responseData && responseData.updatedOnline) {
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
          <div className={styles.button} onClick={onNewGroup}>
            <button>New Group</button>
          </div>
          <hr id="dropdown"></hr>
          <div className={styles.button} onClick={onSettings}>
            <button>Settings</button>
          </div>
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
