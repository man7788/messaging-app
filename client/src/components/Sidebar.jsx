import styles from './Sidebar.module.css';
import { useContext, useEffect, useRef, useState } from 'react';
import useProfiles from '../fetch/UserAPI';
import Setting from './Setting';
import UserList from './UserList';
import hamburger from '../images/hamburger.svg';
import { chatContext } from '../contexts/chatContext';

const Sidebar = ({ name, loginId, showHamburger, setHamburger }) => {
  const { profiles, profilesLoading, profilesError } = useProfiles();
  const buttonRef = useRef();
  const { setContentArea } = useContext(chatContext);
  const [showUserList, setShowUserList] = useState(true);

  useEffect(() => {
    setHamburger(buttonRef.current?.id);
  }, []);

  const onShowUser = () => {
    setShowUserList(true);
    setContentArea('chat');
  };

  return (
    <div>
      {showUserList ? (
        <div className={styles.Sidebar}>
          <div className={styles.userInfo}>
            {name}
            <button
              id="hamburger"
              className={showHamburger ? styles.buttonActive : null}
              ref={buttonRef}
            >
              <img id="hamburger" src={hamburger}></img>
            </button>
            {showHamburger && <Setting setShowUserList={setShowUserList} />}
          </div>
          <UserList
            loginId={loginId}
            profiles={profiles}
            profilesLoading={profilesLoading}
            profilesError={profilesError}
          />
        </div>
      ) : (
        <div className={styles.Sidebar}>
          <div className={styles.SettingList}>
            <div className={styles.userInfo}>
              <div>Settings</div>
              <button onClick={onShowUser}>back</button>
            </div>
            <div>
              <button onClick={() => setContentArea('profile')}>
                Edit Profile
              </button>
              <button onClick={() => setContentArea('password')}>
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
