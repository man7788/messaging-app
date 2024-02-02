import styles from './Text.module.css';
import { useEffect, useState } from 'react';

const Text = ({ message, loginId }) => {
  const [textStyle, setTextStyle] = useState('');

  useEffect(() => {
    if (message.author !== loginId) {
      setTextStyle('received');
    } else {
      setTextStyle('sent');
    }
  }, []);

  return (
    <div className={styles.Text}>
      <div key={message._id} className={styles[textStyle]}>
        <div className={styles.textContent}>
          <div>{message.date_med_with_seconds}</div>
          <div>{message.text}</div>
        </div>
      </div>
    </div>
  );
};

export default Text;
