import styles from './Chat.module.css';
import { useContext, useState } from 'react';
import { chatContext } from '../contexts/chatContext';
import SendFetch from '../fetch/ChatAPI';

const Chat = ({ loginId }) => {
  const { chatProfile } = useContext(chatContext);
  const [messages, setMessages] = useState(null);
  const [outMessage, setOutMessage] = useState('');

  const [loading, setLoading] = useState(null);
  const [serverError, setServerError] = useState(null);

  const onSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);

    const sendPayload = {
      user_id: loginId,
      _user_id: chatProfile.user_id,
      message: outMessage,
    };

    const result = await SendFetch(sendPayload);

    if (result && result.error) {
      setServerError(true);
    }

    setLoading(false);
    setOutMessage('');
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
            {messages ? 'some messages' : 'There is no message'}
          </div>
          <div className={styles.input}>
            <form action="" method="post" onSubmit={onSubmitForm}>
              <input
                type="text"
                name="messageOut"
                id="new_messageOutfull_name"
                value={outMessage}
                onChange={(event) => setOutMessage(event.target.value)}
              ></input>
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      ) : (
        <div className={styles.Chat}>No chats selected</div>
      )}
    </>
  );
};

export default Chat;
