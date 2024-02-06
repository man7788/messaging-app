import { useContext, useEffect } from 'react';
import styles from './SettingList.module.css';
import { chatContext } from '../contexts/chatContext';

const SettingList = () => {
  const { contentArea, setContentArea } = useContext(chatContext);

  useEffect(() => {}, [contentArea]);
  return (
    <div className={styles.SettingList}>
      <div
        className={
          contentArea === 'profile' ? styles.buttonActive : styles.buttonDiv
        }
        onClick={() => setContentArea('profile')}
      >
        <button>Edit Profile</button>
      </div>
      <div
        className={
          contentArea === 'password' ? styles.buttonActive : styles.buttonDiv
        }
        onClick={() => setContentArea('password')}
      >
        <button>Change Password</button>
      </div>
    </div>
  );
};

export default SettingList;
