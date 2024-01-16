import styles from './Chat.module.css';
import { useContext, useState } from 'react';
import { chatContext } from '../contexts/chatContext';

const Chat = () => {
  const { chatProfile } = useContext(chatContext);
  const [messages, setMessages] = useState(null);
  const [outMessage, setOutMessage] = useState('');

  const onSubmitForm = async (e) => {
    e.preventDefault();
    // setLoading(true);

    // const editPayload = {
    //   new_full_name: fullName,
    //   new_about: about,
    //   profile_id: profileId,
    // };

    // const result = await EditFetch(editPayload);

    // if (result && result.error) {
    //   setServerError(true);
    // }

    // if (result && result.formErrors) {
    //   setFormErrors(result.formErrors);
    // }

    // setLoading(false);

    // if (result && result.responseData) {
    //   setSuccess(true);
    //   setFormErrors(null);
    // }
  };

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
