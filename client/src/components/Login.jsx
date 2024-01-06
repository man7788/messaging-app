import styles from './Login.module.css';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import LoginFetch from '../fetch/LoginAPI';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [serverError, setServerError] = useState(null);
  const [formErrors, setFormErrors] = useState([]);

  const [loading, setLoading] = useState(null);

  const [signUpRedirect, setSignUpRedirect] = useState(null);

  const onSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);

    const loginPayload = { username, password };

    const result = await LoginFetch(loginPayload, setServerError);

    if (result && result.error) {
      setServerError(true);
    }

    if (result && result.formErrors) {
      setFormErrors(result.formErrors);
    }

    setLoading(false);
    localStorage.setItem('token', JSON.stringify(result.token));
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
      <button onClick={() => setSignUpRedirect(true)}>Sign Up</button>
      {signUpRedirect && <Navigate to={'/signup'} />}
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
