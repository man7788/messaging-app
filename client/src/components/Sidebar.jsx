import styles from './Sidebar.module.css';
import useProfiles from '../fetch/UserAPI';
import Setting from './Setting';
import UserList from './UserList';

const Sidebar = ({ name, loginId }) => {
  const { profiles, profilesLoading, profilesError } = useProfiles();

  return (
    <div className={styles.Sidebar}>
      <div className={styles.sidebarContainer}>
        <div className={styles.userInfo}>
          {name}
          <div className={styles.setting}>
            <Setting />
          </div>
        </div>
        <div className={styles.userList}>
          <UserList
            loginId={loginId}
            profiles={profiles}
            profilesLoading={profilesLoading}
            profilesError={profilesError}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
