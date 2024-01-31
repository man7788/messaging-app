import styles from './User.module.css';
import { useContext, useEffect, useState } from 'react';
import { chatContext } from '../contexts/chatContext';

const User = ({ profile }) => {
  const { setChatProfile, chatProfile } = useContext(chatContext);
  const [activeProfile, setActiveProfile] = useState(null);

  useEffect(() => {
    console.log(chatProfile, profile.full_name);
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
    <div className={styles.User}>
      <div
        className={activeProfile ? styles.buttonActive : styles.buttonDiv}
        onClick={onChangeChat}
      >
        <button>{profile.full_name}</button>
      </div>
    </div>
  );
};

export default User;
