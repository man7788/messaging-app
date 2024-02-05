import styles from './Sidebar.module.css';
import { useState } from 'react';
import useProfiles from '../fetch/UserAPI';
import Setting from './Setting';
import UserList from './UserList';
import hamburger from '../images/hamburger.svg';

const Sidebar = ({ name, loginId }) => {
  const { profiles, profilesLoading, profilesError } = useProfiles();
  const [showSetting, setShowSetting] = useState(null);
  const [showUserList, setShowUserList] = useState(true);

  const onShowSetting = () => {
    if (!showSetting) {
      setShowSetting(!showSetting);
    } else if (showSetting) {
      setShowSetting(!showSetting);
    }
  };

  const onShowUser = () => {
    setShowUserList(true);
    onShowSetting();
  };

  return (
    <div>
      {showUserList ? (
        <div className={styles.Sidebar}>
          <div className={styles.userInfo}>
            {name}
            <button
              className={showSetting ? styles.buttonActive : null}
              onClick={onShowSetting}
            >
              <img src={hamburger}></img>
            </button>
            {showSetting && <Setting setShowUserList={setShowUserList} />}
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
          <div className={styles.settingList}>
            <div className={styles.userInfo}>
              <div>Setting</div>
              <button onClick={onShowUser}>back</button>
            </div>
            <div>
              <ul>
                <li>Edit Profile</li>
                <li>Change Password</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
