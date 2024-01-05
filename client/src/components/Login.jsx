import styles from './Login.module.css';
import { useState } from 'react';
import { LoginFetch } from '../fetch/LoginFetch';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [serverError, setServerError] = useState(null);
  const [formErrors, setFormErrors] = useState([]);

  const [loading, setLoading] = useState(null);

  const onSubmitForm = (e) => {
    e.preventDefault();
    setLoading(true);

    const loginPayload = { username, password };

    LoginFetch(loginPayload, setFormErrors, setServerError, setLoading);
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
    <div className={styles.Login}>
      <h1>Messaging App</h1>
      <h2>Login</h2>
      <form action="" method="post" onSubmit={onSubmitForm}>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          name="username"
          id="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        ></input>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          name="password"
          id="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        ></input>
        <button type="submit">Log In</button>
      </form>
      {formErrors && (
        <ul>
          {formErrors.map((error) => (
            <li key={error.msg}>{error.msg}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Login;
