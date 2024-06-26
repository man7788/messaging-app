import styles from './SignUp.module.css';
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import SignUpFetch from '../fetch/messenger/SignUpAPI';
import LoginFetch from '../fetch/messenger/LoginAPI';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [fullNameError, setFullNameError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState(null);

  const [signUpError, setSignUpError] = useState(null);
  const [signLoading, setSignUpLoading] = useState(null);

  const [formErrors, setFormErrors] = useState([]);

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
      } else if (/\bmatch/i.test(error.msg)) {
        setConfirmPasswordError(error.msg);
      }
    }
  }, [formErrors]);

  useEffect(() => {
    setEmailError(null);
  }, [email]);

  useEffect(() => {
    setFullNameError(null);
  }, [fullName]);

  useEffect(() => {
    setPasswordError(null);
  }, [password]);

  useEffect(() => {
    setConfirmPasswordError(null);
  }, [confirmPassword]);

  const onSubmitForm = async (e) => {
    e.preventDefault();

    setSignUpLoading(true);

    const signUpPayload = {
      email,
      full_name: fullName,
      password,
      confirm_password: confirmPassword,
    };

    const { error, responseData } = await SignUpFetch(signUpPayload);

    if (error) {
      setSignUpError(true);
    }

    if (responseData && responseData.errors) {
      setFormErrors(responseData.errors);
      setSignUpLoading(false);
    }

    if (responseData && responseData.createdUser) {
      autoLogin({
        email: responseData.createdUser.email,
        password: 'placeholder',
        auto_login: responseData.createdUser.password,
      });
    }
  };

  const autoLogin = async (payload) => {
    const { error, responseData } = await LoginFetch(payload);

    if (error) {
      setSignUpError(true);
    }

    if (responseData && responseData.errors) {
      setSignUpError(true);
    }

    if (responseData && responseData.token) {
      localStorage.setItem('token', JSON.stringify(responseData.token));
      setAppRedirect(true);
    }
  };

  if (signUpError) {
    return (
      <div className={styles.error} data-testid="error">
        <h1>A network error was encountered</h1>
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
            <div className={styles.inputContainer} data-testid="email">
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
            <div className={styles.inputContainer} data-testid="full_name">
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
            <div
              className={styles.inputContainer}
              data-testid="confirm_password"
            >
              <input
                className={confirmPasswordError ? styles.inputOutline : null}
                type="password"
                name="confirm_password"
                id="confirm_password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              ></input>
              <div className={styles.inputError}>{confirmPasswordError}</div>
            </div>
            {signLoading ? (
              <div className={styles.loading} data-testid="loading">
                <div className={styles.loader}></div>
              </div>
            ) : (
              <div className={styles.signupBtn}>
                <button className={styles.button} type="submit">
                  Sign Up
                </button>
              </div>
            )}

            <hr></hr>
            <div className={styles.loginBtn}>
              <button
                className={styles.button}
                onClick={() => setLoginRedirect(true)}
              >
                Cancel
              </button>
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
