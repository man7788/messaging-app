import styles from './App.module.css';
import { useEffect, useState } from 'react';
import useStatus from './fetch/StatusAPI';
import { Navigate } from 'react-router-dom';

const App = () => {
  const { result, loading, serverError } = useStatus();

  const [loginRedirect, setLoginRedirect] = useState(null);
  const [messengerRedirect, setMessengerRedirect] = useState(null);

  useEffect(() => {
    if (result && result.error) {
      setLoginRedirect(true);
    }

    if (result && result.user) {
      result.user._id && setMessengerRedirect(true);
    }
  }, [result]);

  if (serverError) {
    return (
      <div className={styles.error} data-testid="error">
        <h1>A network error was encountered</h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loading} data-testid="loading">
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <div className={styles.App}>
      {loginRedirect && <Navigate to="/login" replace={true} />}
      {messengerRedirect && <Navigate to="/chat" replace={true} />}
    </div>
  );
};

export default App;
