import styles from './SignUp.module.css';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import SignUpFetch from '../fetch/SignUpAPI';
import LoginFetch from '../fetch/LoginAPI';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [serverError, setServerError] = useState(null);
  const [formErrors, setFormErrors] = useState([]);

  const [loading, setLoading] = useState(null);

  const [loginRedirect, setLoginRedirect] = useState(null);
  const [appRedirect, setAppRedirect] = useState(null);

  const onSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);

    const signUpPayload = {
      email,
      full_name: fullName,
      password,
      confirm_password: confirmPassword,
    };

    const result = await SignUpFetch(signUpPayload);

    if (result && result.error) {
      setServerError(true);
    }

    if (result && result.formErrors) {
      setFormErrors(result.formErrors);
    }

    setLoading(false);

    if (result && result.responseData) {
      autoLogin({
        email: result.responseData.email,
        password: 'placeholder',
        autoLogin: result.responseData.password,
      });
    }
  };

  const autoLogin = async (payload) => {
    setLoading(true);

    const result = await LoginFetch(payload);

    if (result && result.formErrors) {
      setFormErrors(result.formErrors);
    }

    setLoading(false);

    if (result && result.token) {
      localStorage.setItem('token', JSON.stringify(result.token));
      setAppRedirect(true);
    }
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
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          name="email"
          id="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        ></input>
        <label htmlFor="full_name">Full Name:</label>
        <input
          type="text"
          name="full_name"
          id="full_name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
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
      {appRedirect && <Navigate to="/" />}
    </div>
  );
};

export default SignUp;
