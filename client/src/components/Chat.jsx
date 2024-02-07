import styles from './Chat.module.css';
import { useContext, useEffect, useState } from 'react';
import { chatContext } from '../contexts/chatContext';
import SendFetch from '../fetch/ChatAPI';
import messagesFetch from '../fetch/MessageAPI';
import Conversation from './Conversation';
import send from '../images/send.svg';
import avatar from '../images/avatar.svg';

const Chat = ({ loginId }) => {
  const { chatProfile } = useContext(chatContext);
  const [messages, setMessages] = useState([]);
  const [messageDates, setMessageDates] = useState([]);
  const [outMessage, setOutMessage] = useState('');
  const [updateMessage, setUpdateMessage] = useState(null);

  const [loading, setLoading] = useState(null);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);
      setMessages(null);
      setOutMessage('');
      const idPayload = {};

      if (chatProfile && chatProfile._id) {
        idPayload.user_id = chatProfile.user_id;
      }

      const result = await messagesFetch(idPayload);

      if (result && result.error) {
        setServerError(true);
      }

      if (result && result.messages) {
        setMessages(result.messages);
      }

      setLoading(false);
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

  const onSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);

    const sendPayload = {
      user_id: loginId,
      message: outMessage,
    };

    const result = await SendFetch(sendPayload);

    if (result && result.error) {
      setServerError(true);
    }

    setOutMessage('');

    if (!updateMessage) {
      setUpdateMessage(!updateMessage);
    } else if (updateMessage) {
      setUpdateMessage(!updateMessage);
    }

    setLoading(false);
  };

  if (serverError) {
    return (
      <div className={styles.error}>
        <div className={styles.ChatTitle}>
          {chatProfile && chatProfile.full_name}
        </div>
        <h1>A network error was encountered</h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.ChatTitle}>
          {chatProfile && chatProfile.full_name}
        </div>
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <>
      {chatProfile ? (
        <div className={styles.Chat}>
          <div className={styles.ChatTitle}>
            <div className={styles.avatarContainer}>
              <img src={avatar}></img>
            </div>
            {chatProfile && chatProfile.full_name}
          </div>
          <Conversation
            messages={messages}
            messageDates={messageDates}
            loginId={loginId}
          />
          <div className={styles.input}>
            <form action="" method="post" onSubmit={onSubmitForm}>
              <input
                type="text"
                name="out_message"
                id="out_message"
                placeholder="Type a message"
                value={outMessage}
                onChange={(event) => setOutMessage(event.target.value)}
              ></input>
              <button type="submit">
                <img src={send}></img>
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className={styles.noChat}>No chats selected</div>
      )}
    </>
  );
};

export default Chat;
