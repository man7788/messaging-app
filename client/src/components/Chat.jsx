import styles from './Chat.module.css';
import { useContext, useEffect, useState } from 'react';
import { chatContext } from '../contexts/chatContext';
import SendFetch from '../fetch/ChatAPI';
import messagesFetch from '../fetch/MessageAPI';
import Text from './Text';
import send from '../images/send.svg';

const Chat = ({ loginId }) => {
  const { chatProfile } = useContext(chatContext);
  const [messages, setMessages] = useState(null);
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
      <div>
        <h1>A network error was encountered</h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <>
      {chatProfile ? (
        <div className={styles.Chat}>
          <div className={styles.ChatTitle}>
            {chatProfile && chatProfile.full_name}
          </div>
          <div className={styles.messages}>
            {messages && messages.length > 0 ? (
              <ul>
                {messages.map((message) => (
                  <Text key={message._id} message={message} loginId={loginId} />
                ))}
              </ul>
            ) : (
              'There is no message'
            )}
          </div>
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
        <div className={styles.Chat}>No chat selected</div>
      )}
    </>
  );
};

export default Chat;
