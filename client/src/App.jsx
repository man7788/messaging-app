import styles from './App.module.css';
import { useEffect, useState } from 'react';
import useStatus from './fetch/StatusAPI';
import { Navigate } from 'react-router-dom';

// localStorage.clear();

const App = () => {
  const { profile, loading, serverError } = useStatus();
  const [login, setLogin] = useState(null);

  const [user, setUser] = useState('User');
  const [about, setAbout] = useState('');

  useEffect(() => {
    if (profile && profile.name) {
      setUser(profile.name);
    }
    if (profile && profile.about) {
      setAbout(profile.about);
    }

    if (profile && profile.error) {
      setLogin(true);
    }
  }, [profile]);

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
    <div className={styles.App}>
      <h1>Messaging App</h1>
      <h2>Welcome back {user}!</h2>
      <h3>{about}</h3>
      {login && <Navigate to="/login" replace={true} />}
    </div>
  );
};

export default App;
