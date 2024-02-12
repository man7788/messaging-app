import styles from './Password.module.css';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import PasswordFetch from '../../../fetch/PasswordAPI';
import useStatus from '../../../fetch/StatusAPI';

const Password = () => {
  const status = useStatus();

  const [userId, setUserId] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState(null);

  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState(null);
  const [formErrors, setFormErrors] = useState([]);
  const [saveBtnActive, setSaveBtnActive] = useState(false);
  const [success, setSuccess] = useState(false);

  const [appRedirect, setAppRedirect] = useState(null);

  useEffect(() => {
    setLoading(true);

    const { result, serverError } = status;

    if (serverError) {
      serverError(true);
    }

    if (result && result.error) {
      setAppRedirect(true);
    }

    if (result && result.user) {
      result.user._id && setUserId(result.user._id);
    }

    setLoading(false);
  }, [status]);

  useEffect(() => {
    if (formErrors) {
      for (const error of formErrors) {
        if (/current/i.test(error.msg)) {
          setCurrentPasswordError(error.msg);
        } else if (/\bcharacters/i.test(error.msg)) {
          setPasswordError(error.msg);
        } else if (/\bmatch$/i.test(error.msg)) {
          setConfirmPasswordError(error.msg);
        }
      }
    }
  }, [formErrors]);

  useEffect(() => {
    if (
      currentPassword.length > 0 ||
      password.length > 0 ||
      confirmPassword.length > 0
    ) {
      setSuccess(false);
    }

    if (
      currentPassword.length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0
    ) {
      setSaveBtnActive(true);
    } else {
      setSaveBtnActive(false);
    }
  }, [currentPassword, password, confirmPassword]);

  const onSubmitForm = async (e) => {
    e.preventDefault();
    if (!saveBtnActive) {
      return;
    }
    setLoading(true);
    setCurrentPasswordError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);

    const passwordPayload = {
      user_id: userId,
      current_password: currentPassword,
      new_password: password,
      confirm_new_password: confirmPassword,
    };

    const result = await PasswordFetch(passwordPayload);

    if (result && result.error) {
      if (
        result.error === 'invalid token' ||
        result.error === 'missing token'
      ) {
        setAppRedirect(true);
      } else {
        setServerError(true);
      }
    }

    if (result && result.formErrors) {
      setFormErrors(result.formErrors);
    }

    if (result && result.responseData) {
      setFormErrors(null);
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
      setSuccess(true);
    }

    setLoading(false);
  };

  if (serverError) {
    return (
      <div className={styles.error}>
        <h1>A network error was encountered</h1>
      </div>
    );
  }

  return (
    <div className={styles.PasswordContainer}>
      <div className={styles.Password}>
        <div className={styles.heading}>
          <h2>Change Password</h2>
        </div>
        <div className={styles.formContainer}>
          <form action="" method="post" onSubmit={onSubmitForm}>
            <div className={styles.inputContainer}>
              <label htmlFor="current_password">Current Password:</label>
              <input
                className={currentPasswordError ? styles.inputOutline : null}
                type="password"
                name="current_password"
                id="current_password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              ></input>
              <div className={styles.inputError}>{currentPasswordError}</div>
            </div>
            <div className={styles.inputContainer}>
              <label htmlFor="new_password">New Password:</label>
              <input
                className={passwordError ? styles.inputOutline : null}
                type="password"
                name="new_password"
                id="new_password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              ></input>
              <div className={styles.inputError}>{passwordError}</div>
            </div>
            <div className={styles.inputContainer}>
              <label htmlFor="confirm_new_password">
                Confirm New Password:
              </label>
              <input
                className={confirmPasswordError ? styles.inputOutline : null}
                type="password"
                name="confirm_new_password"
                id="confirm_new_password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              ></input>
              <div className={styles.inputError}>{confirmPasswordError}</div>
            </div>
            <div className={styles.success}>
              {success && 'Password successfully updated'}
            </div>
            {loading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loading}>
                  <div className={styles.loader}></div>
                </div>
              </div>
            ) : (
              <div
                className={
                  saveBtnActive ? styles.saveBtnActive : styles.saveBtnDefault
                }
              >
                <button type="submit">Save</button>
              </div>
            )}
          </form>
        </div>
      </div>
      {appRedirect && <Navigate to="/" />}
    </div>
  );
};

export default Password;