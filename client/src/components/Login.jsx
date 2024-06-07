import styles from './Login.module.css';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import LoginFetch from '../fetch/messenger/LoginAPI';
import useStatus from '../fetch/messenger/useStatusAPI';

const Login = () => {
  const { statusResult, statusLoading, statusError } = useStatus();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const [loginError, setLoginError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(null);
  const [formErrors, setFormErrors] = useState([]);

  const [signUpRedirect, setSignUpRedirect] = useState(null);
  const [appRedirect, setAppRedirect] = useState(null);

  useEffect(() => {
    if (statusResult && statusResult.user) {
      setAppRedirect(true);
    }
  }, [statusLoading]);

  useEffect(() => {
    for (const error of formErrors) {
      if (/email/i.test(error.msg)) {
        setEmailError(error.msg);
      } else if (/user/i.test(error.msg)) {
        setEmailError(error.msg);
      } else if (/password/i.test(error.msg)) {
        setPasswordError(error.msg);
      }
    }
  }, [formErrors]);

  useEffect(() => {
    setEmailError(null);
  }, [email]);

  useEffect(() => {
    setPasswordError(null);
  }, [password]);

  const onSubmitForm = async (e) => {
    e.preventDefault();

    setLoginLoading(true);
    setEmailError(null);
    setPasswordError(null);

    const loginPayload = { email, password };

    const { error, responseData } = await LoginFetch(loginPayload);

    if (error) {
      setLoginError(true);
    }

    if (responseData && responseData.errors) {
      setFormErrors(responseData.errors);
      setLoginLoading(false);
    }

    if (responseData && responseData.token) {
      localStorage.setItem('token', JSON.stringify(responseData.token));
      setAppRedirect(true);
    }
  };

  if (statusError || loginError) {
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
    <div className={styles.LoginContainer}>
      <div className={styles.Login}>
        <div className={styles.heading}>
          <h1>Messaging App</h1>
        </div>
        <div className={styles.formContainer}>
          <form action="" method="post" onSubmit={onSubmitForm}>
            <div className={styles.inputContainer} data-testid="email">
              <input
                className={emailError ? styles.inputOutline : null}
                type="text"
                name="email"
                id="email"
                placeholder="Email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              ></input>
              <div className={styles.inputError}>{emailError}</div>
            </div>
            <div className={styles.inputContainer} data-testid="password">
              <input
                className={passwordError ? styles.inputOutline : null}
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              ></input>
              <div className={styles.inputError}>{passwordError}</div>
            </div>
            {loginLoading ? (
              <div className={styles.loginLoading} data-testid="loading">
                <div className={styles.loginLoader}></div>
              </div>
            ) : (
              <div className={styles.loginBtn}>
                <button className={styles.button} type="submit">
                  Log In
                </button>
              </div>
            )}
            <hr></hr>
            <div className={styles.signupBtn}>
              <button
                className={styles.button}
                type="button"
                onClick={() => setSignUpRedirect(true)}
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
      {signUpRedirect && <Navigate to={'/signup'} />}
      {appRedirect && <Navigate to={'/chat'} />}
    </div>
  );
};

export default Login;
