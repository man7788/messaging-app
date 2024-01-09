import styles from './Messenger.module.css';
import { useEffect, useState } from 'react';
import useStatus from '../fetch/StatusAPI';
import { Navigate } from 'react-router-dom';

const Messenger = () => {
  const { profile, loading, serverError } = useStatus();

  const [user, setUser] = useState('User');
  const [about, setAbout] = useState('');

  const [loginRedirect, setLoginRedirect] = useState(null);

  useEffect(() => {
    if (profile && profile.name) {
      setUser(profile.name);
    }
    if (profile && profile.about) {
      setAbout(profile.about);
    }

    if (profile && profile.error) {
      setLoginRedirect(true);
    }
  }, [profile]);

  const onLogOut = () => {
    localStorage.clear();
    setLoginRedirect(true);
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
      <h2>Welcome back {user}!</h2>
      <h3>{about}</h3>
      <button onClick={onLogOut}>Log Out</button>
      {loginRedirect && <Navigate to="/login" replace={true} />}
    </div>
  );
};

export default Messenger;
