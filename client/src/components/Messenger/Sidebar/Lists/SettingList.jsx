import styles from './SettingList.module.css';
import { useEffect, useState, useRef, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { chatContext } from '../../../../contexts/chatContext';

const SettingList = () => {
  const listRef = useRef();
  const location = useLocation().pathname;
  const { setShowChat } = useContext(chatContext);

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
      <Link
        to="/user/profile/edit"
        className={/profile/.test(location) ? styles.LinkActive : styles.Link}
        onClick={() => setShowChat(false)}
      >
        Edit Profile
      </Link>

      <Link
        to="/user/password/change"
        className={/password/.test(location) ? styles.LinkActive : styles.Link}
        onClick={() => setShowChat(false)}
      >
        Change Password
      </Link>
    </div>
  );
};

export default SettingList;
