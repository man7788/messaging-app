import styles from './Edit.module.css';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import EditFetch from '../fetch/EditAPI';
import useStatus from '../fetch/StatusAPI';

const Edit = () => {
  const status = useStatus();

  const [currentField, setCurrentField] = useState(true);
  const [currentName, setCurrentName] = useState('');
  const [currentAbout, setCurrenAbout] = useState('');

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');

  const [serverError, setServerError] = useState(null);
  const [formErrors, setFormErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [appRedirect, setAppRedirect] = useState(null);

  useEffect(() => {
    setLoading(true);

    const { profile, serverError } = status;

    if (serverError) {
      serverError(true);
    }

    if (profile && profile._id) {
      setId(profile._id);
    }

    if (currentField === true) {
      if (profile && profile.name) {
        setCurrentName(profile.name);
        if (profile && profile.about) {
          setCurrenAbout(profile.about);
        }
        setCurrentField(false);
      }
    }

    if (profile && profile.error) {
      setAppRedirect(true);
    }
    setLoading(false);
  }, [status]);

  useEffect(() => {
    setName(currentName);
    setAbout(currentAbout);
  }, [currentField]);

  const onSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);

    const editPayload = { name, about, id };

    const result = await EditFetch(editPayload);

    if (result && result.error) {
      setServerError(true);
    }

    if (result && result.formErrors) {
      setFormErrors(result.formErrors);
    }

    setLoading(false);

    if (result && result.responseData) {
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
