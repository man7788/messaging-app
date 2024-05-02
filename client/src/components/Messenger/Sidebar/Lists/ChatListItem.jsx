import styles from './ChatListItem.module.css';
import { useContext, useEffect, useState } from 'react';
import { chatContext } from '../../../../contexts/chatContext';
import { Link } from 'react-router-dom';
import avatar from '../../../../images/avatar.svg';

const ChatListItem = ({ profile, online, chatId }) => {
  const { setChatProfile, chatProfile } = useContext(chatContext);
  const [activeProfile, setActiveProfile] = useState(null);

  useEffect(() => {
    if (chatProfile && chatProfile._id === profile._id) {
      setActiveProfile(true);
    } else {
      setActiveProfile(false);
    }
  }, [chatProfile]);

  useEffect(() => {
    if (chatId && (chatId === profile.chat_id || chatId === profile._id)) {
      setActiveProfile(true);
      setChatProfile(profile);
    } else {
      setActiveProfile(false);
    }
  }, []);

  const onChangeChat = () => {
    setChatProfile(profile);
  };

  return (
    <div className={styles.ChatListItem}>
      <Link
        to={
          profile?.full_name
            ? `/chat/${profile.chat_id}`
            : `/chat/${profile._id}`
        }
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
      </Link>
    </div>
  );
};

export default ChatListItem;
