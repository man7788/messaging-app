import styles from './Messenger.module.css';
import { useEffect, useState, useRef, useMemo } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useStatus from '../../fetch/messenger/useStatusAPI';
import { chatContext } from '../../contexts/chatContext';
import Sidebar from './Sidebar/Sidebar';
import Chat from './Content/Chat/Chat';

const Messenger = () => {
  const { statusResult, statusLoading, statusError } = useStatus();
  const previousChatProfile = useRef(null);

  const [loginId, setLoginId] = useState('');
  const [name, setName] = useState('');
  const [showHamburger, setShowHamburger] = useState(false);

  const [chatProfile, setChatProfile] = useState(null);
  const [showChat, setShowChat] = useState(true);
  const [refreshChat, setRefreshChat] = useState(null);
  const [outMessage, setOutMessage] = useState('');

  const [appRedirect, setAppRedirect] = useState(null);
  const [error, setError] = useState(null);

  const ChatMemo = useMemo(
    () => (
      <Chat
        loginId={loginId}
        chatProfile={chatProfile}
        outMessage={outMessage}
        setOutMessage={setOutMessage}
      />
    ),
    [refreshChat, outMessage],
  );

  useEffect(() => {
    if (chatProfile && previousChatProfile.current?._id !== chatProfile._id) {
      setOutMessage('');
      setRefreshChat(!refreshChat);
      previousChatProfile.current = chatProfile;
    }
  }, [chatProfile]);

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

  if (error || statusError) {
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
          setShowChat,
          chatProfile,
          setChatProfile,
          setError,
        }}
      >
        <Sidebar
          name={name}
          loginId={loginId}
          setShowHamburger={setShowHamburger}
          showHamburger={showHamburger}
        />
        <Outlet />
        <div style={showChat ? { display: 'grid' } : { display: ' none' }}>
          {ChatMemo}
        </div>
      </chatContext.Provider>

      {appRedirect && <Navigate to="/" replace={true} />}
    </div>
  );
};

export default Messenger;
