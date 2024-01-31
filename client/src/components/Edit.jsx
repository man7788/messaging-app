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
  const [fullNameError, setFullNameError] = useState(null);
  const [aboutError, setAboutError] = useState(null);
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

  useEffect(() => {
    if (formErrors) {
      for (const error of formErrors) {
        if (/name/i.test(error.msg)) {
          setFullNameError(error.msg);
        } else if (/about/i.test(error.msg)) {
          setAboutError(error.msg);
        }
      }
    }
  }, [formErrors]);

  const onSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFullNameError(null);
    setAboutError(null);

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
    <div className={styles.EditContainer}>
      <div className={styles.heading}>
        <h2>Edit Profile</h2>
      </div>
      <div className={styles.Edit}>
        <div className={styles.formContainer}>
          <form action="" method="post" onSubmit={onSubmitForm}>
            <div className={styles.inputContainer}>
              <label htmlFor="new_full_name">Full Name:</label>
              <input
                className={fullNameError ? styles.inputOutline : null}
                type="text"
                name="new_full_name"
                id="new_full_name"
                placeholder="New Full Name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              ></input>
              <div className={styles.inputError}>{fullNameError}</div>
            </div>
            <div className={styles.inputContainer}>
              <label htmlFor="new_about">About:</label>
              <input
                className={aboutError ? styles.inputOutline : null}
                type="text"
                name="new_about"
                id="new_about"
                value={about}
                placeholder="New About"
                onChange={(event) => setAbout(event.target.value)}
              ></input>
              <div className={styles.inputError}>{aboutError}</div>
            </div>
            <div className={styles.success}>
              {success && 'Profile successfully updated'}
            </div>
            <div className={styles.saveBtn}>
              <button type="submit">Save</button>
            </div>
            <hr></hr>
            <div className={styles.backBtn}>
              <button onClick={() => setAppRedirect(true)}>Back</button>
            </div>
          </form>
        </div>
      </div>
      {appRedirect && <Navigate to="/" />}
    </div>
  );
};

export default Edit;
