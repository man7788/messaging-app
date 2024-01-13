import styles from './Edit.module.css';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import EditFetch from '../fetch/EditAPI';
import useStatus from '../fetch/StatusAPI';

const Edit = () => {
  const status = useStatus();

  const [currentUsername, setCurrentUsername] = useState('');
  const [currentName, setCurrentName] = useState('');
  const [currentAbout, setCurrenAbout] = useState('');

  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');

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

    if (result && result.user) {
      result.user.username && setCurrentUsername(result.user.username);
    }

    if (result && result.profile) {
      result.profile.name && setCurrentName(result.profile.name);
      result.profile.about && setCurrenAbout(result.profile.about);
    }

    setLoading(false);
  }, [status]);

  useEffect(() => {
    setUsername(currentUsername);
    setName(currentName);
    setAbout(currentAbout);
  }, [currentUsername, currentName, currentAbout]);

  const onSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);

    const editPayload = {
      new_username: username,
      new_name: name,
      new_about: about,
      user_id: userId,
    };

    const result = await EditFetch(editPayload);

    if (result && result.error) {
      setServerError(true);
    }

    if (result && result.formErrors) {
      setFormErrors(result.formErrors);
    }

    setLoading(false);

    if (result && result.responseData) {
      setSuccess(true);
      setFormErrors(null);
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
    <div className={styles.Edit}>
      <h1>Messaging App</h1>
      <h2>Edit</h2>
      <form action="" method="post" onSubmit={onSubmitForm}>
        <label htmlFor="new_username">Username:</label>
        <input
          type="text"
          name="new_username"
          id="new_username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        ></input>
        <label htmlFor="new_name">Your Name:</label>
        <input
          type="text"
          name="new_name"
          id="new_name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        ></input>
        <label htmlFor="new_about">About:</label>
        <input
          type="text"
          name="new_about"
          id="new_about"
          value={about}
          onChange={(event) => setAbout(event.target.value)}
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
      {success && 'Profile successfully updated'}
    </div>
  );
};

export default Edit;
