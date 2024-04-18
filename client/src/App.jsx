import styles from './App.module.css';
import { useEffect, useState } from 'react';
import useStatus from './fetch/messenger/useStatusAPI';
import { Navigate } from 'react-router-dom';

const App = () => {
  const { statusResult, statusLoading, statusError } = useStatus();

  const [loginRedirect, setLoginRedirect] = useState(null);
  const [messengerRedirect, setMessengerRedirect] = useState(null);

  useEffect(() => {
    if (statusResult && statusResult.error) {
      setLoginRedirect(true);
    }

    if (statusResult && statusResult.user) {
      setMessengerRedirect(true);
    }
  }, [statusLoading]);

  if (statusError) {
    return (
      <div className={styles.error} data-testid="error">
        <h1>A network error was encountered</h1>
      </div>
    );
  }

  if (statusLoading) {
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
