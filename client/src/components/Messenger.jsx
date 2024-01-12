import styles from './Messenger.module.css';
import { useEffect, useState } from 'react';
import useStatus from '../fetch/StatusAPI';
import { Navigate } from 'react-router-dom';

const Messenger = () => {
  const { result, loading, serverError } = useStatus();

  const [name, setName] = useState('User');
  const [about, setAbout] = useState('');

  const [appRedirect, setAppRedirect] = useState(null);
  const [editRedirect, setEditRedirect] = useState(null);

  useEffect(() => {
    if (result && result.error) {
      setAppRedirect(true);
    }

    if (result && result.profile) {
      result.profile.name && setName(result.profile.name);
      result.profile.about && setAbout(result.profile.about);
    }
  }, [result]);

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
      <h2>Welcome Back, {name}!</h2>
      <h3>{about}</h3>
      <button onClick={onEdit}>Edit Profile</button>
      {editRedirect && <Navigate to="/profile/edit" />}
      <button onClick={onLogOut}>Log Out</button>
      {appRedirect && <Navigate to="/" replace={true} />}
    </div>
  );
};

export default Messenger;
