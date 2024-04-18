import styles from './Messenger.module.css';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useStatus from '../../fetch/messenger/useStatusAPI';
import { chatContext } from '../../contexts/chatContext';
import Chat from './Content/Chat/Chat';
import Sidebar from './Sidebar/Sidebar';
import Edit from './Content/Edit';
import Password from './Content/Password';

const Messenger = () => {
  const { statusResult, statusLoading, setStatusError } = useStatus();

  const [loginId, setLoginId] = useState('');
  const [name, setName] = useState('');

  const [chatProfile, setChatProfile] = useState(null);

  const [appRedirect, setAppRedirect] = useState(null);

  const [showHamburger, setShowHamburger] = useState(null);

  const [contentArea, setContentArea] = useState('chat');

  const [error, setError] = useState(null);

  useEffect(() => {
    if (statusResult && statusResult.error) {
      setAppRedirect(true);
    }

    if (statusResult && statusResult.profile) {
      statusResult.profile.full_name && setName(statusResult.profile.full_name);
    }

    if (statusResult && statusResult.user) {
      statusResult.user._id && setLoginId(statusResult.user._id);
    }
  }, [statusResult]);

  const checkShowHamburger = (e) => {
    if (showHamburger && e.target.id === 'dropdown') {
      setShowHamburger(true);
    } else if (showHamburger) {
      setShowHamburger(false);
    }
  };

  if (error || setStatusError) {
    return (
      <div className={styles.error} data-testid="error">
        <h1>A network error was encountered</h1>
      </div>
    );
  }

  if (statusLoading) {
    return (
      <div className={styles.loading} data-testid="loading">
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <div
      className={styles.Messenger}
      onClick={showHamburger ? checkShowHamburger : null}
    >
      <chatContext.Provider
        value={{
          chatProfile,
          setChatProfile,
          contentArea,
          setContentArea,
          setError,
        }}
      >
        <Sidebar
          name={name}
          loginId={loginId}
          setShowHamburger={setShowHamburger}
          showHamburger={showHamburger}
        />
        {contentArea === 'chat' && <Chat loginId={loginId} />}
        {contentArea === 'profile' && <Edit />}
        {contentArea === 'password' && <Password />}
      </chatContext.Provider>

      {appRedirect && <Navigate to="/" replace={true} />}
    </div>
  );
};

export default Messenger;
