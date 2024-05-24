import styles from './ChatListItem.module.css';
import { useContext, useEffect, useState, useRef } from 'react';
import { chatContext } from '../../../../contexts/chatContext';
import { Link } from 'react-router-dom';
import avatar from '../../../../images/avatar.svg';

const ChatListItem = ({ profile, online, chatId }) => {
  const itemRef = useRef();
  const { setChatProfile } = useContext(chatContext);
  const [activeProfile, setActiveProfile] = useState(null);

  useEffect(() => {
    if (chatId && (chatId === profile.chat_id || chatId === profile._id)) {
      itemRef.current?.scrollIntoView({ block: 'nearest' });
      setActiveProfile(true);
      setChatProfile(profile);
    } else {
      setActiveProfile(false);
    }
  }, [chatId]);

  const onChangeChat = () => {
    if (chatId === profile.chat_id || chatId === profile._id) {
      return;
    }
    setChatProfile(profile);
  };

  return (
    <div className={styles.ChatListItem} ref={itemRef}>
      <Link
        to={
          profile?.full_name
            ? `/chat/${profile.chat_id}`
            : `/chat/${profile._id}`
        }
        className={activeProfile ? styles.linkActive : styles.linkDiv}
        onClick={onChangeChat}
      >
        <div className={styles.avatarContainer}>
          <img className={styles.img} src={avatar}></img>
          {online && <div className={styles.dot}></div>}
        </div>
        <div className={styles.nameDiv}>{profile.full_name}</div>
        <div className={styles.nameDiv}>{profile.name}</div>
      </Link>
    </div>
  );
};

export default ChatListItem;
