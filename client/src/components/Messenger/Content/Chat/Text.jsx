import styles from './Text.module.css';
import { useEffect, useState, useRef } from 'react';

const Text = ({ message, loginId }) => {
  const bottom = useRef();
  const [textStyle, setTextStyle] = useState('');

  useEffect(() => {
    bottom.current?.scrollIntoView();
  });

  useEffect(() => {
    if (message.author !== loginId) {
      setTextStyle('received');
    } else {
      setTextStyle('sent');
    }
  }, []);

  return (
    <div className={styles.Text} ref={bottom} data-testid="text">
      <div key={message._id} className={styles[textStyle]}>
        <div className={styles.textContent}>
          <div className={styles.messageText}>{message.text}</div>
          <div className={styles.time}>{message.time_simple}</div>
        </div>
      </div>
    </div>
  );
};

export default Text;
