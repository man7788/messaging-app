import styles from './Text.module.css';
import { useEffect, useState, useRef } from 'react';

const Text = ({ message, loginId }) => {
  const bottom = useRef();
  const [textStyle, setTextStyle] = useState('');
  const [image, setImage] = useState('');

  const toBase64 = (uInt8Array) => btoa(String.fromCharCode(...uInt8Array));

  useEffect(() => {
    bottom.current?.scrollIntoView();
  });

  useEffect(() => {
    message &&
      message.image &&
      setImage(`data:image/jpeg;base64,${toBase64(message.image.data.data)}`);
  }, []);

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
          {message && message.text && (
            <div className={styles.messageText}>{message.text}</div>
          )}
          {message && message.image && (
            <img className={styles.messageText} src={image} />
          )}
          <div className={styles.time}>{message.time_simple}</div>
        </div>
      </div>
    </div>
  );
};

export default Text;
