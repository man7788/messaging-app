import styles from './Sidebar.module.css';
import { useState } from 'react';
import useProfiles from '../fetch/UserAPI';
import Setting from './Setting';
import UserList from './UserList';

const Sidebar = ({ name, loginId }) => {
  const { profiles, profilesLoading, profilesError } = useProfiles();
  const [showSetting, setShowSetting] = useState(null);

  const onShowSetting = () => {
    if (!showSetting) {
      setShowSetting(!showSetting);
    } else if (showSetting) {
      setShowSetting(!showSetting);
    }
  };

  return (
    <div className={styles.Sidebar}>
      <div className={styles.userInfo}>
        {name}
        <button
          className={showSetting ? styles.buttonActive : null}
          onClick={onShowSetting}
        >
          Setting
        </button>
        {showSetting && <Setting />}
      </div>
      <UserList
        loginId={loginId}
        profiles={profiles}
        profilesLoading={profilesLoading}
        profilesError={profilesError}
      />
    </div>
  );
};

export default Sidebar;
