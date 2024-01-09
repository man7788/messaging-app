import styles from './Edit.module.css';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import LoginFetch from '../fetch/LoginAPI';
import useStatus from '../fetch/StatusAPI';

const Edit = () => {
  const status = useStatus();
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');

  const [serverError, setServerError] = useState(null);
  const [formErrors, setFormErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [appRedirect, setAppRedirect] = useState(null);

  useEffect(() => {
    const { profile, serverError } = status;

    if (serverError) {
      serverError(true);
    }

    if (profile && profile.name) {
      setName(profile.name);
    }

    if (profile && profile.about) {
      setAbout(profile.about);
    }

    if (profile && profile.error) {
      setAppRedirect(true);
    }
    setLoading(false);
  }, [status]);

  const onSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);

    const loginPayload = { name, about };

    const result = await LoginFetch(loginPayload, setServerError);

    if (result && result.error) {
      setServerError(true);
    }

    if (result && result.formErrors) {
      setFormErrors(result.formErrors);
    }

    setLoading(false);
    localStorage.setItem('token', JSON.stringify(result.token));
    setAppRedirect(true);
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
        <label htmlFor="name">Your Name:</label>
        <input
          type="text"
          name="name"
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        ></input>
        <label htmlFor="about">About:</label>
        <input
          type="text"
          name="about"
          id="about"
          value={about}
          onChange={(event) => setAbout(event.target.value)}
        ></input>
        <button type="submit">Save</button>
      </form>
      <button onClick={() => setAppRedirect(true)}>Cancel</button>
      {appRedirect && <Navigate to="/" />}
      {formErrors && (
        <ul>
          {formErrors.map((error) => (
            <li key={error.msg}>{error.msg}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Edit;
