import styles from './Login.module.css';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import LoginFetch from '../fetch/LoginAPI';
import useStatus from '../fetch/StatusAPI';

const Login = () => {
  const status = useStatus();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [serverError, setServerError] = useState(null);
  const [formErrors, setFormErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [signUpRedirect, setSignUpRedirect] = useState(null);
  const [appRedirect, setAppRedirect] = useState(null);

  useEffect(() => {
    const { profile, serverError } = status;

    if (serverError) {
      serverError(true);
    }

    if (profile && profile._id) {
      setAppRedirect(true);
    }
    setLoading(false);
  }, [status]);

  const onSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);

    const loginPayload = { email, password };

    const result = await LoginFetch(loginPayload);

    if (result && result.error) {
      setServerError(true);
    }

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
    <div className={styles.LoginContainer}>
      <div className={styles.heading}>
        <h1>Messaging App</h1>
      </div>
      <div className={styles.Login}>
        <div className={styles.formContainer}>
          <form action="" method="post" onSubmit={onSubmitForm}>
            <input
              type="text"
              name="email"
              id="email"
              placeholder="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            ></input>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            ></input>
            <div className={styles.loginBtn}>
              <button type="submit">Log In</button>
            </div>
            <hr></hr>
            <div className={styles.signupBtn}>
              <button onClick={() => setSignUpRedirect(true)}>Sign Up</button>
            </div>
          </form>
        </div>
      </div>
      {signUpRedirect && <Navigate to={'/signup'} />}
      {formErrors && (
        <ul>
          {formErrors.map((error) => (
            <li key={error.msg}>{error.msg}</li>
          ))}
        </ul>
      )}
      {appRedirect && <Navigate to={'/'} />}
    </div>
  );
};

export default Login;
