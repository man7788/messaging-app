import styles from './Edit.module.css';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import EditFetch from '../../../fetch/messenger/EditAPI';
import useStatus from '../../../fetch/messenger/StatusAPI';

const Edit = () => {
  const { result, loading, serverError } = useStatus();

  const [currentFullName, setCurrentFullName] = useState('');
  const [currentAbout, setCurrentAbout] = useState('');

  const [profileId, setProfileId] = useState('');
  const [fullName, setFullName] = useState('');
  const [about, setAbout] = useState('');

  const [editServerError, setEditServerError] = useState(null);
  const [editLoading, setEditLoading] = useState(null);
  const [formErrors, setFormErrors] = useState([]);
  const [fullNameError, setFullNameError] = useState(null);
  const [aboutError, setAboutError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saveBtnActive, setSaveBtnActive] = useState(false);

  const [appRedirect, setAppRedirect] = useState(null);

  useEffect(() => {
    if (result && result.error) {
      setAppRedirect(true);
    }

    if (!currentFullName) {
      if (result && result.profile) {
        result.profile._id && setProfileId(result.profile._id);
        result.profile.full_name &&
          setCurrentFullName(result.profile.full_name);
        result.profile.about && setCurrentAbout(result.profile.about);
      }
    }
  }, [result]);

  useEffect(() => {
    setFullName(currentFullName);
    setAbout(currentAbout);
  }, [currentFullName, currentAbout]);

  useEffect(() => {
    setFullNameError(null);
  }, [fullName]);

  useEffect(() => {
    setAboutError(null);
  }, [about]);

  useEffect(() => {
    if (fullName === currentFullName && currentAbout === about) {
      setSaveBtnActive(false);
    } else {
      setSuccess(false);
      setSaveBtnActive(true);
    }
  }, [fullName, about]);

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
    if (!saveBtnActive) {
      return;
    }
    setEditLoading(true);
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
        setEditServerError(true);
      }
    }

    if (result && result.formErrors) {
      setFormErrors(result.formErrors);
      setEditLoading(false);
    }

    if (result && result.responseData) {
      setCurrentFullName(result.responseData.updated_profile.full_name);
      setCurrentAbout(result.responseData.updated_profile?.about);
      setSuccess(true);
      setFormErrors(null);
      setEditLoading(false);
      setSaveBtnActive(false);
    }
  };

  if (serverError || editServerError) {
    return (
      <div className={styles.error} data-testid="error">
        <h1>A network error was encountered</h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loading} data-testid="loading">
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <div className={styles.EditContainer}>
      <div className={styles.Edit}>
        <div className={styles.heading}>
          <h2>Edit Profile</h2>
        </div>

        <div className={styles.formContainer}>
          <form action="" method="post" onSubmit={onSubmitForm}>
            <div className={styles.inputContainer} data-testid="new_full_name">
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
            <div className={styles.inputContainer} data-testid="new_about">
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
            <div className={styles.success} data-testid="success">
              {success && 'Profile successfully updated'}
            </div>
            {editLoading ? (
              <div
                className={styles.loadingContainer}
                data-testid="edit-loading"
              >
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

export default Edit;
