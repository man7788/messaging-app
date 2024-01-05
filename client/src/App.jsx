import styles from './App.module.css';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const App = () => {
  const [messenger, setMessenger] = useState(null);
  const [login, setLogin] = useState(null);

  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(null);

  const getData = async (token) => {
    try {
      const response = await fetch(`http://localhost:3000/user/status`, {
        mode: 'cors',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status >= 400) {
        throw new Error('server error');
      }
      const responseData = await response.json();
      console.log(responseData);
      if (responseData && responseData.profile === undefined) {
        setLogin(true);
      } else {
        setMessenger(true);
      }
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem('token'));
    console.log(token);

    if (token !== undefined) {
      getData(token);
    }
  }, []);

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
