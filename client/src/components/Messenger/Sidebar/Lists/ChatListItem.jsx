import styles from './ChatListItem.module.css';
import { useContext, useEffect, useState } from 'react';
import { chatContext } from '../../../../contexts/chatContext';
import avatar from '../../../../images/avatar.svg';

const Chat = ({ profile, online }) => {
  const { setChatProfile, chatProfile } = useContext(chatContext);
  const [activeProfile, setActiveProfile] = useState(null);

  useEffect(() => {
    if (chatProfile && chatProfile._id === profile._id) {
      setActiveProfile(!activeProfile);
    } else {
      setActiveProfile(false);
    }
  }, [chatProfile]);

  const onChangeChat = () => {
    setChatProfile(profile);
  };

  return (
    <div className={styles.Chat}>
      <div
        className={activeProfile ? styles.buttonActive : styles.buttonDiv}
        onClick={onChangeChat}
      >
        <button>
          <div className={styles.avatarContainer}>
            <img src={avatar}></img>
            {online && <div className={styles.dot}></div>}
          </div>
          <div className={styles.nameDiv}>{profile.full_name}</div>
          <div className={styles.nameDiv}>{profile.name}</div>
        </button>
      </div>
    </div>
  );
};

export default Chat;
