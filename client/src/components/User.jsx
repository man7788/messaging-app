import styles from './User.module.css';
import { useContext } from 'react';
import { chatContext } from '../contexts/chatContext';

const User = ({ profile }) => {
  const { setChatProfile } = useContext(chatContext);

  const onChangeChat = () => {
    setChatProfile(profile);
  };

  return (
    <div className={styles.User}>
      <button onClick={onChangeChat}>{profile.full_name}</button>
    </div>
  );
};

export default User;
