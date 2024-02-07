import styles from './Sidebar.module.css';
import { useContext, useEffect, useRef, useState } from 'react';
import useProfiles from '../fetch/UserAPI';
import Dropdown from './Dropdown';
import UserList from './UserList';
import hamburger from '../images/hamburger.svg';
import arrow from '../images/arrow.svg';
import avatar from '../images/avatar.svg';
import { chatContext } from '../contexts/chatContext';
import SettingList from './SettingList';

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
            <div className={styles.loginUser}>
              <div className={styles.avatarContainer}>
                <img src={avatar}></img>
              </div>
              {name}
            </div>
            <button
              id="hamburger"
              className={showHamburger ? styles.buttonActive : null}
              ref={buttonRef}
            >
              <img id="hamburger" src={hamburger}></img>
            </button>
            {showHamburger && <Dropdown setShowUserList={setShowUserList} />}
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
          <div className={styles.settingInfo}>
            <button onClick={onShowUser}>
              <img src={arrow}></img>
            </button>
            <div>Settings</div>
          </div>
          <SettingList setContentArea={setContentArea} />
        </div>
      )}
    </div>
  );
};

export default Sidebar;
