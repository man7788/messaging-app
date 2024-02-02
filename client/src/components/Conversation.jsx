import styles from './Conversation.module.css';
import Text from './Text';

const Conversation = ({ messages, messageDates, loginId }) => {
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
        </>
      ) : (
        'There is no message'
      )}
    </div>
  );
};

export default Conversation;
