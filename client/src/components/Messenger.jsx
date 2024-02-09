import styles from './Messenger.module.css';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useStatus from '../fetch/StatusAPI';
import { chatContext } from '../contexts/chatContext';
import Chat from './Chat';
import Sidebar from './Sidebar';
import Edit from './Edit';
import Password from './Password';

const Messenger = () => {
  const { result, loading, serverError } = useStatus();

  const [loginId, setLoginId] = useState('');
  const [name, setName] = useState('');

  const [chatProfile, setChatProfile] = useState(null);

  const [appRedirect, setAppRedirect] = useState(null);

  const [showHamburger, setShowHamburger] = useState(null);

  const [contentArea, setContentArea] = useState('chat');

  useEffect(() => {
    if (result && result.error) {
      setAppRedirect(true);
    }

    if (result && result.profile) {
      result.profile.full_name && setName(result.profile.full_name);
    }

    if (result && result.user) {
      result.user._id && setLoginId(result.user._id);
    }
  }, [result]);

  const checkShowHamburger = (e) => {
    if (showHamburger && e.target.id === 'hamburger') {
      setShowHamburger(false);
    } else if (showHamburger && e.target.id === 'dropdown') {
      setShowHamburger(true);
    } else if (e.target.id === 'hamburger') {
      setShowHamburger(true);
    } else if (showHamburger) {
      setShowHamburger(false);
    }
  };

  if (serverError) {
    return (
      <div className={styles.error}>
        <h1>A network error was encountered</h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <div className={styles.Messenger} onClick={checkShowHamburger}>
      <chatContext.Provider
        value={{ chatProfile, setChatProfile, contentArea, setContentArea }}
      >
        <Sidebar
          name={name}
          loginId={loginId}
          showHamburger={showHamburger}
          setShowHamburger={setShowHamburger}
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
