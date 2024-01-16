import styles from './Messenger.module.css';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useStatus from '../fetch/StatusAPI';
import useProfiles from '../fetch/UserAPI';
import { chatContext } from '../contexts/chatContext';
import UserList from './UserList';
import Chat from './Chat';

const Messenger = () => {
  const { result, loading, serverError } = useStatus();
  const { profiles, profilesLoading, profilesError } = useProfiles();

  const [name, setName] = useState('');
  const [about, setAbout] = useState('');

  const [appRedirect, setAppRedirect] = useState(null);
  const [editRedirect, setEditRedirect] = useState(null);
  const [passwordRedirect, setPasswordRedirect] = useState(null);

  const [chatProfile, setChatProfile] = useState(null);

  useEffect(() => {
    if (result && result.error) {
      setAppRedirect(true);
    }

    if (result && result.profile) {
      result.profile.full_name && setName(result.profile.full_name);
      result.profile.about && setAbout(result.profile.about);
    }
  }, [result]);

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
      <button onClick={onEdit}>Edit Profile</button>
      {editRedirect && <Navigate to="/profile/edit" />}
      <button onClick={onPassword}>Change Password</button>
      {passwordRedirect && <Navigate to="/password/edit" />}
      <button onClick={onLogOut}>Log Out</button>
      {appRedirect && <Navigate to="/" replace={true} />}
      <chatContext.Provider value={{ chatProfile, setChatProfile }}>
        <UserList
          profiles={profiles}
          profilesLoading={profilesLoading}
          profilesError={profilesError}
        />
        <Chat />
      </chatContext.Provider>
    </div>
  );
};

export default Messenger;
