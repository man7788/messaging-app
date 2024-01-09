import styles from './App.module.css';
import { useEffect, useState } from 'react';
import useStatus from './fetch/StatusAPI';
import { Navigate } from 'react-router-dom';

const App = () => {
  const { profile, loading, serverError } = useStatus();

  const [id, setId] = useState('');

  const [loginRedirect, setLoginRedirect] = useState(null);
  const [messengerRedirect, setMessengerRedirect] = useState(null);

  useEffect(() => {
    if (profile && profile._id) {
      setId(profile._id);
      setMessengerRedirect(true);
    }

    if (profile && profile.error) {
      setLoginRedirect(true);
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
      {loginRedirect && <Navigate to="/login" replace={true} />}
      {messengerRedirect && <Navigate to={`/user/${id}`} replace={true} />}
    </div>
  );
};

export default App;
