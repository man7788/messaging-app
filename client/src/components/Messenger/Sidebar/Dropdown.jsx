import styles from './Dropdown.module.css';
import { useContext, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { chatContext } from '../../../contexts/chatContext';
import PropTypes from 'prop-types';
import LogoutFetch from '../../../fetch/messenger/LogoutAPI';

const Dropdown = ({
  setShowNewGroupList,
  setShowSettings,
  showHamburger,
  setShowHamburger,
  setSlide,
  setChangeSlide,
}) => {
  const { setError } = useContext(chatContext);
  const [appRedirect, setAppRedirect] = useState(false);
  const [loading, setLoading] = useState(false);

  const onNewGroup = (e) => {
    e.stopPropagation();
    setSlide(true);
    setChangeSlide(true);
    setShowNewGroupList(true);
    setShowHamburger(false);
  };

  const onSettings = (e) => {
    e.stopPropagation();
    setSlide(true);
    setChangeSlide(true);
    setShowSettings(true);
    setShowHamburger(false);
  };

  const onLogOut = async (e) => {
    e.stopPropagation();
    setLoading(true);

    const { error, responseData } = await LogoutFetch();

    if (error) {
      setError(true);
    }

    if (responseData && responseData.updatedOnline) {
      localStorage.clear();
      setLoading(false);
      setAppRedirect(true);
    }
  };

  return (
    <>
      {loading ? (
        <div className={styles.loading} data-testid="loading">
          <div className={styles.loader}></div>
        </div>
      ) : (
        <div
          className={showHamburger ? styles.DropdownActive : styles.DropdownDiv}
          id="dropdown"
          data-testid="dropdown"
        >
          <Link to="/group/create" className={styles.Link} onClick={onNewGroup}>
            New Group
          </Link>
          <hr id="dropdown"></hr>
          <Link
            to="/user/settings"
            className={styles.Link}
            onClick={onSettings}
          >
            Settings
          </Link>
          <div className={styles.buttonDiv} id="logout" onClick={onLogOut}>
            <button className={styles.button} id="logout">
              Log Out
            </button>
          </div>
          {appRedirect && <Navigate to="/" replace={true} />}
        </div>
      )}
    </>
  );
};

Dropdown.propTypes = {
  setShowNewGroupList: PropTypes.func.isRequired,
  setShowSettings: PropTypes.func.isRequired,
  showHamburger: PropTypes.bool.isRequired,
  setShowHamburger: PropTypes.func.isRequired,
  setSlide: PropTypes.func.isRequired,
  setChangeSlide: PropTypes.func.isRequired,
};

export default Dropdown;
