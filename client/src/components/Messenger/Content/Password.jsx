import styles from './Password.module.css';
import { useEffect, useState } from 'react';
import PasswordFetch from '../../../fetch/messenger/PasswordAPI';
import useStatus from '../../../fetch/messenger/useStatusAPI';

const Password = () => {
  const { statusResult, statusLoading, statusError } = useStatus();

  const [userId, setUserId] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState(null);

  const [passwordServerError, setPasswordServerError] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(null);
  const [formErrors, setFormErrors] = useState([]);
  const [saveBtnActive, setSaveBtnActive] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (statusResult && statusResult.user) {
      statusResult.user._id && setUserId(statusResult.user._id);
    }
  }, [statusResult]);

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
    setCurrentPasswordError(null);
  }, [currentPassword]);

  useEffect(() => {
    setPasswordError(null);
  }, [newPassword]);

  useEffect(() => {
    setConfirmPasswordError(null);
  }, [confirmPassword]);

  useEffect(() => {
    if (
      currentPassword.length > 0 ||
      newPassword.length > 0 ||
      confirmPassword.length > 0
    ) {
      setSuccess(false);
    }

    if (
      currentPassword.length > 0 &&
      newPassword.length > 0 &&
      confirmPassword.length > 0
    ) {
      setSaveBtnActive(true);
    } else {
      setSaveBtnActive(false);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  const onSubmitForm = async (e) => {
    e.preventDefault();

    if (!saveBtnActive) {
      return;
    }

    setPasswordLoading(true);
    setCurrentPasswordError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);

    const passwordPayload = {
      user_id: userId,
      current_password: currentPassword,
      new_password: newPassword,
      confirm_new_password: confirmPassword,
    };

    const { error, responseData } = await PasswordFetch(passwordPayload);

    if (error) {
      setPasswordServerError(true);
    }

    if (responseData && responseData.errors) {
      setFormErrors(responseData.errors);
      setPasswordLoading(false);
    }

    if (responseData && responseData.updatedUser) {
      setFormErrors(null);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(true);
      setPasswordLoading(false);
    }
  };

  if (statusError || passwordServerError) {
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
    <div className={styles.PasswordContainer}>
      <div className={styles.Password}>
        <div className={styles.heading}>
          <h2>Change Password</h2>
        </div>
        <div className={styles.formContainer}>
          <form action="" method="post" onSubmit={onSubmitForm}>
            <div
              className={styles.inputContainer}
              data-testid="current-password"
            >
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
            <div className={styles.inputContainer} data-testid="new-password">
              <label htmlFor="new_password">New Password:</label>
              <input
                className={passwordError ? styles.inputOutline : null}
                type="password"
                name="new_password"
                id="new_password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              ></input>
              <div className={styles.inputError}>{passwordError}</div>
            </div>
            <div
              className={styles.inputContainer}
              data-testid="confirm-new-password"
            >
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
            <div className={styles.success} data-testid="success">
              {success && 'Password successfully updated'}
            </div>
            {passwordLoading ? (
              <div
                className={styles.formLoadingContainer}
                data-testid="password-loading"
              >
                <div className={styles.formLoading}>
                  <div className={styles.formLoader}></div>
                </div>
              </div>
            ) : (
              <div
                className={
                  saveBtnActive ? styles.saveBtnActive : styles.saveBtnDefault
                }
              >
                <button className={styles.button} type="submit">
                  Save
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Password;
