import styles from './Conversation.module.css';
import { useEffect, useRef } from 'react';
import Text from './Text';

const Conversation = ({ messages, messageDates, loginId }) => {
  const bottom = useRef();

  useEffect(() => {
    bottom.current?.scrollIntoView();
  });

  return (
    <div className={styles.Conversation}>
      {messageDates && messageDates.length > 0 ? (
        <>
          {messageDates.map((date) => {
            return (
              <div key={date}>
                <div className={styles.dateContainer}>
                  <div className={styles.date}>{date}</div>
                </div>
                {messages.map((message) => {
                  if (date === message.date_med) {
                    return (
                      <Text
                        key={message._id}
                        message={message}
                        loginId={loginId}
                      />
                    );
                  }
                })}
              </div>
            );
          })}
          <div ref={bottom}></div>
        </>
      ) : (
        <div className={styles.noMessage}>There is no message</div>
      )}
    </div>
  );
};

export default Conversation;
