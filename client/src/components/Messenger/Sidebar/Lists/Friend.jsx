import styles from './Friend.module.css';
import { useContext, useEffect, useState } from 'react';
import { chatContext } from '../../../../contexts/chatContext';
import avatar from '../../../../images/avatar.svg';

const Friend = ({ profile }) => {
  const { setChatProfile, chatProfile } = useContext(chatContext);
  const [activeProfile, setActiveProfile] = useState(null);

  useEffect(() => {
    if (chatProfile && chatProfile.full_name === profile.full_name) {
      setActiveProfile(!activeProfile);
    } else {
      setActiveProfile(false);
    }
  }, [chatProfile]);

  const onChangeChat = () => {
    setChatProfile(profile);
  };

  return (
    <div className={styles.Friend}>
      <div
        className={activeProfile ? styles.buttonActive : styles.buttonDiv}
        onClick={onChangeChat}
      >
        <button>
          <div className={styles.avatarContainer}>
            <img src={avatar}></img>
          </div>
          {profile.full_name}
        </button>
      </div>
    </div>
  );
};

export default Friend;
