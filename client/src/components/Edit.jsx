import styles from './Edit.module.css';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import EditFetch from '../fetch/EditAPI';
import useStatus from '../fetch/StatusAPI';

const Edit = () => {
  const status = useStatus();

  const [currentFullName, setCurrentFullName] = useState('');
  const [currentAbout, setCurrenAbout] = useState('');

  const [profileId, setProfileId] = useState('');
  const [fullName, setFullName] = useState('');
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
      setServerError(true);
    }

    if (result && result.error) {
      setAppRedirect(true);
    }

    if (result && result.profile) {
      result.profile._id && setProfileId(result.profile._id);
      result.profile.full_name && setCurrentFullName(result.profile.full_name);
      result.profile.about && setCurrenAbout(result.profile.about);
    }

    setLoading(false);
  }, [status]);

  useEffect(() => {
    setFullName(currentFullName);
    setAbout(currentAbout);
  }, [currentFullName, currentAbout]);

  const onSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);

    const editPayload = {
      new_full_name: fullName,
      new_about: about,
      profile_id: profileId,
    };

    const result = await EditFetch(editPayload);

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
    <div className={styles.Edit}>
      <h1>Messaging App</h1>
      <h2>Edit</h2>
      <form action="" method="post" onSubmit={onSubmitForm}>
        <label htmlFor="new_full_name">Full Name:</label>
        <input
          type="text"
          name="new_full_name"
          id="new_full_name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
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
