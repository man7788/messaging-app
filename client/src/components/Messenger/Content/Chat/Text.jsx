import styles from './Text.module.css';
import { useEffect, useState, useRef, memo } from 'react';
import PropTypes from 'prop-types';

const Text = memo(function Text({ message, loginId, chatProfile, scroll }) {
  const bottom = useRef();
  const [textStyle, setTextStyle] = useState('');
  const [image, setImage] = useState('');

  const toBase64 = (uInt8Array) => btoa(String.fromCharCode(...uInt8Array));

  useEffect(() => {
    scroll && bottom.current?.scrollIntoView();
  });

  useEffect(() => {
    message &&
      message.image &&
      setImage(`data:image/jpeg;base64,${toBase64(message.image.data.data)}`);
  }, []);

  useEffect(() => {
    if (message.author !== loginId && chatProfile.name) {
      setTextStyle('receivedGroup');
    } else if (message.author !== loginId) {
      setTextStyle('received');
    } else {
      setTextStyle('sent');
    }
  }, []);

  return (
    <div className={styles.Text} ref={bottom} data-testid="text">
      <div key={message._id} className={styles[textStyle]}>
        <div className={styles.textContent}>
          {message.author !== loginId && chatProfile.name && (
            <div className={styles.name}>{message.author_name}</div>
          )}

          {message && message.text && (
            <div className={styles.messageText}>{message.text}</div>
          )}
          {message && message.image && (
            <img className={styles.messageImage} src={image} />
          )}
          <div className={styles.time}>{message.time_simple}</div>
        </div>
      </div>
    </div>
  );
});

Text.propTypes = {
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  loginId: PropTypes.string.isRequired,
  chatProfile: PropTypes.object,
  scroll: PropTypes.bool,
};

export default Text;
