import styles from './Messenger.module.css';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useStatus from '../fetch/StatusAPI';
import useProfiles from '../fetch/UserAPI';
import { chatContext } from '../contexts/chatContext';
import UserList from './UserList';
import Chat from './Chat';
import Setting from './Setting';

const Messenger = () => {
  const { result, loading, serverError } = useStatus();
  const { profiles, profilesLoading, profilesError } = useProfiles();

  const [loginId, setLoginId] = useState('');
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');

  const [appRedirect, setAppRedirect] = useState(null);

  const [chatProfile, setChatProfile] = useState(null);

  useEffect(() => {
    if (result && result.error) {
      setAppRedirect(true);
    }

    if (result && result.profile) {
      result.profile.full_name && setName(result.profile.full_name);
      result.profile.about && setAbout(result.profile.about);
      result.profile._id && setLoginId(result.profile._id);
    }

    if (result && result.user) {
      result.user._id && setLoginId(result.user._id);
    }
  }, [result]);

  if (serverError) {
    return (
      <div>
        <h1>A network error was encountered</h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className={styles.Messenger}>
      <h1>Messaging App</h1>
      <h2>Welcome Back, {name}!</h2>
      <h3>{about}</h3>
      <Setting />
      <chatContext.Provider value={{ chatProfile, setChatProfile }}>
        <UserList
          loginId={loginId}
          profiles={profiles}
          profilesLoading={profilesLoading}
          profilesError={profilesError}
        />
        <Chat loginId={loginId} />
      </chatContext.Provider>
      {appRedirect && <Navigate to="/" replace={true} />}
    </div>
  );
};

export default Messenger;
