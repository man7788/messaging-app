import styles from './Messenger.module.css';
import { useEffect, useState } from 'react';
import useStatus from '../fetch/StatusAPI';
import { Navigate } from 'react-router-dom';

const Messenger = () => {
  const { profile, loading, serverError } = useStatus();

  const [name, setName] = useState('User');
  const [about, setAbout] = useState('');

  const [appRedirect, setAppRedirect] = useState(null);
  const [editRedirect, setEditRedirect] = useState(null);

  useEffect(() => {
    if (profile && profile.name) {
      setName(profile.name);
    }

    if (profile && profile.about) {
      setAbout(profile.about);
    }

    if (profile && profile.error) {
      setAppRedirect(true);
    }
  }, [profile]);

  const onEdit = () => {
    setEditRedirect(true);
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
      <h2>Welcome back {name}!</h2>
      <h3>{about}</h3>
      <button onClick={onEdit}>Edit Profile</button>
      {editRedirect && <Navigate to="/user/edit" />}
      <button onClick={onLogOut}>Log Out</button>
      {appRedirect && <Navigate to="/" replace={true} />}
    </div>
  );
};

export default Messenger;
