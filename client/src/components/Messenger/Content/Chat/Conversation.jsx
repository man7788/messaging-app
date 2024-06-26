import styles from './Conversation.module.css';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Text from './Text';
import MessagesFetch from '../../../../fetch/chats/MessagesAPI';
import GroupMessagesFetch from '../../../../fetch/groups/GroupMessagesAPI';

const Conversation = ({ loginId, updateMessage, chatProfile }) => {
  const [messages, setMessages] = useState([]);
  const [messageDates, setMessageDates] = useState([]);
  const [loading, setLoading] = useState(null);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);
      setMessages(null);

      const idPayload = {};
      let result;

      if (chatProfile && chatProfile.full_name) {
        idPayload.user_id = chatProfile.user_id;
        result = await MessagesFetch(idPayload);
      } else if (chatProfile && chatProfile.name) {
        idPayload.group_id = chatProfile._id;
        result = await GroupMessagesFetch(idPayload);
      }

      const { error, responseData } = result;

      if (error) {
        setServerError(true);
      }

      if (responseData && responseData.messages) {
        setMessages(responseData.messages);
        setLoading(false);
      }
    };
    getMessages();
  }, [chatProfile, updateMessage]);

  useEffect(() => {
    const allDates = [];
    const filterDates = [];

    messages && messages.map((message) => allDates.push(message.date_med));
    messages &&
      allDates.filter((date) => {
        if (!filterDates.includes(date)) {
          filterDates.push(date);
        }
      });

    setMessageDates(filterDates);
  }, [messages]);

  if (serverError) {
    return (
      <div className={styles.error} data-testid="error">
        <h1>A network error was encountered</h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loading} data-testid="loading">
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <div className={styles.Conversation}>
      {messageDates && messageDates.length > 0 ? (
        <>
          {messageDates.map((date) => {
            return (
              <div key={date} data-testid="date">
                <div className={styles.dateContainer}>
                  <div className={styles.date}>{date}</div>
                </div>
                {messages.map((message, index) => {
                  if (date === message.date_med) {
                    let scroll;
                    if (index === messages.length - 1) {
                      scroll = true;
                    }
                    return (
                      <Text
                        key={message._id}
                        message={message}
                        loginId={loginId}
                        chatProfile={chatProfile}
                        scroll={scroll}
                      />
                    );
                  }
                })}
              </div>
            );
          })}
        </>
      ) : (
        <div className={styles.noMessage} data-testid="no-message">
          There is no message
        </div>
      )}
    </div>
  );
};

Conversation.propTypes = {
  loginId: PropTypes.string.isRequired,
  updateMessage: PropTypes.bool.isRequired,
  chatProfile: PropTypes.object,
};

export default Conversation;
