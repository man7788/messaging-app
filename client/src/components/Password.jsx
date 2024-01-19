import styles from './Password.module.css';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import PasswordFetch from '../fetch/PasswordAPI';
import useStatus from '../fetch/StatusAPI';

const Password = () => {
  const status = useStatus();

  const [userId, setUserId] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState(null);
  const [formErrors, setFormErrors] = useState([]);
  const [success, setSuccess] = useState(null);

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

  const onSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);

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
      setSuccess(true);
      setFormErrors(null);
    }

    setLoading(false);
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
    <div className={styles.Password}>
      <h1>Messaging App</h1>
      <h2>Edit</h2>
      <form action="" method="post" onSubmit={onSubmitForm}>
        <label htmlFor="current_password">Current Password:</label>
        <input
          type="password"
          name="current_password"
          id="current_password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        ></input>
        <label htmlFor="new_password">New Password:</label>
        <input
          type="password"
          name="new_password"
          id="new_password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        ></input>
        <label htmlFor="confirm_new_password">Confirm New Password:</label>
        <input
          type="password"
          name="confirm_new_password"
          id="confirm_new_password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        ></input>
        <button type="submit">Save</button>
      </form>
      <button onClick={() => setAppRedirect(true)}>Back</button>
      {appRedirect && <Navigate to="/" />}
      {formErrors && (
        <ul>
          {formErrors.map((error) => (
            <li key={error.msg}>{error.msg}</li>
          ))}
        </ul>
      )}
      {success && 'Password successfully updated'}
    </div>
  );
};

export default Password;
