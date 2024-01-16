import styles from './Chat.module.css';
import { useContext } from 'react';
import { chatContext } from '../contexts/chatContext';

const Chat = () => {
  const { chatProfile } = useContext(chatContext);

  return (
    <div className={styles.Chat}>{chatProfile && chatProfile.full_name}</div>
  );
};

export default Chat;
