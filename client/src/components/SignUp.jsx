import styles from './SignUp.module.css';
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import SignUpFetch from '../fetch/SignUpAPI';
import LoginFetch from '../fetch/LoginAPI';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [fullNameError, setFullNameError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState(null);

  const [serverError, setServerError] = useState(null);
  const [formErrors, setFormErrors] = useState([]);

  const [loading, setLoading] = useState(null);

  const [loginRedirect, setLoginRedirect] = useState(null);
  const [appRedirect, setAppRedirect] = useState(null);

  useEffect(() => {
    for (const error of formErrors) {
      if (/email/i.test(error.msg)) {
        setEmailError(error.msg);
      } else if (/full name/i.test(error.msg)) {
        setFullNameError(error.msg);
      } else if (/\bpassword\b/i.test(error.msg)) {
        setPasswordError(error.msg);
      } else if (/\bmatch$/i.test(error.msg)) {
        setConfirmPasswordError(error.msg);
      }
    }
  }, [formErrors]);

  const onSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEmailError(null);
    setFullNameError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);

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
        auto_login: result.responseData.password,
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
    <div className={styles.SignUpContainer}>
      <div className={styles.SignUp}>
        <div className={styles.heading}>
          <h1>Sign Up</h1>
          <h2></h2>
        </div>
        <div className={styles.formContainer}>
          <form action="" method="post" onSubmit={onSubmitForm}>
            <div className={styles.inputContainer}>
              <input
                className={emailError ? styles.inputOutline : null}
                type="text"
                name="email"
                id="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              ></input>
              <div className={styles.inputError}>{emailError}</div>
            </div>
            <div className={styles.inputContainer}>
              <input
                className={fullNameError ? styles.inputOutline : null}
                type="text"
                name="full_name"
                id="full_name"
                placeholder="Full Name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              ></input>
              <div className={styles.inputError}>{fullNameError}</div>
            </div>
            <div className={styles.inputContainer}>
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
            <div className={styles.inputContainer}>
              <input
                className={confirmPasswordError ? styles.inputOutline : null}
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              ></input>
              <div className={styles.inputError}>{confirmPasswordError}</div>
            </div>
            <div className={styles.signupBtn}>
              <button type="submit">Sign Up</button>
            </div>
            <hr></hr>
            <div className={styles.loginBtn}>
              <button onClick={() => setLoginRedirect(true)}>Canel</button>
            </div>
          </form>
        </div>
      </div>
      {loginRedirect && <Navigate to="/login" />}
      {appRedirect && <Navigate to="/" />}
    </div>
  );
};

export default SignUp;
