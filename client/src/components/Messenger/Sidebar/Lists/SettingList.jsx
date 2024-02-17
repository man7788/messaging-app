import { useContext, useEffect, useState, useRef } from 'react';
import styles from './SettingList.module.css';
import { chatContext } from '../../../../contexts/chatContext';

const SettingList = () => {
  const listRef = useRef();

  const { contentArea, setContentArea } = useContext(chatContext);
  const [isOverFlow, setIsOverFlow] = useState(null);

  useEffect(() => {
    if (listRef.current?.scrollHeight > listRef.current?.clientHeight) {
      setIsOverFlow(true);
    }
  }, []);

  return (
    <div
      className={isOverFlow ? styles.SettingListFlow : styles.SettingList}
      ref={listRef}
      data-testid="setting-list"
    >
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
