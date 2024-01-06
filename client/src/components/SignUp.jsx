import styles from './SignUp.module.css';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import SignUpFetch from '../fetch/SignUpAPI';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [serverError, setServerError] = useState(null);
  const [formErrors, setFormErrors] = useState([]);

  const [loading, setLoading] = useState(null);

  const [loginRedirect, setLoginRedirect] = useState(null);

  const onSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);

    const signUpPayload = { username, password, confirmPassword };

    const result = await SignUpFetch(signUpPayload);

    if (result && result.error) {
      setServerError(true);
    }

    if (result && result.formErrors) {
      setFormErrors(result.formErrors);
    }

    setLoading(false);
    // console.log(result);
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
    <div className={styles.SignUp}>
      <h1>Messaging App</h1>
      <h2>Sign Up</h2>
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
        <label htmlFor="confirmPassword">Confirm Password:</label>
        <input
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        ></input>
        <button type="submit">Sign Up</button>
      </form>
      <button onClick={() => setLoginRedirect(true)}>Log In</button>
      {formErrors && (
        <ul>
          {formErrors.map((error) => (
            <li key={error.msg}>{error.msg}</li>
          ))}
        </ul>
      )}
      {loginRedirect && <Navigate to="/login" />}
    </div>
  );
};

export default SignUp;
