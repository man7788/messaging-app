import styles from './Text.module.css';
import { useEffect, useState } from 'react';

const Text = ({ message, loginId }) => {
  const [textStyle, setTextStyle] = useState('sent');

  useEffect(() => {
    if (message.author !== loginId) {
      setTextStyle('recevied');
    }
  }, []);
  return (
    <div className={styles.Text}>
      <li key={message._id} className={styles[textStyle]}>
        {message.text}
      </li>
    </div>
  );
};

export default Text;
