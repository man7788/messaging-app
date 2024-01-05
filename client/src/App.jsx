import styles from './App.module.css';
import { useEffect, useState } from 'react';
import useStatus from './fetch/StatusAPI';
import { Navigate } from 'react-router-dom';

// localStorage.clear();

const App = () => {
  const { profile, loading, serverError } = useStatus();
  const [messenger, setMessenger] = useState(null);
  const [login, setLogin] = useState(null);

  useEffect(() => {
    if (profile && profile.profile) {
      setMessenger(true);
    } else if (profile && profile.error) {
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
      {messenger && <Navigate to="/messenger" replace={true} />}
      {login && <Navigate to="/login" replace={true} />}
    </div>
  );
};

export default App;
