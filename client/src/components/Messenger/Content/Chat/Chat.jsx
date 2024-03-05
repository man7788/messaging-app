import styles from './Chat.module.css';
import { useContext, useEffect, useState } from 'react';
import { chatContext } from '../../../../contexts/chatContext';
import SendFetch from '../../../../fetch/ChatAPI';
import ImageFetch from '../../../../fetch/ImageAPI';
import messagesFetch from '../../../../fetch/MessageAPI';
import Conversation from './Conversation';
import send from '../../../../images/send.svg';
import avatar from '../../../../images/avatar.svg';
import image from '../../../../images/image.svg';
import chat from '../../../../images/chat.svg';

const Chat = ({ loginId }) => {
  const { chatProfile } = useContext(chatContext);
  const [messages, setMessages] = useState([]);
  const [outMessage, setOutMessage] = useState('');
  const [updateMessage, setUpdateMessage] = useState(null);
  const [sendImage, setSendImage] = useState(null);
  const [outImage, setOutImage] = useState('');

  const [loading, setLoading] = useState(null);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);
      setSendImage(null);
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
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    getMessages();
  }, [chatProfile, updateMessage]);

  const onChangeInput = () => {
    if (!sendImage) {
      setSendImage(true);
      setOutImage('');
    } else {
      setSendImage(false);
      setOutImage('');
    }
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);

    let sendPayload = { user_id: chatProfile.user_id };
    let result;

    if (sendImage) {
      sendPayload.image = outImage;
      result = await ImageFetch(sendPayload);
    } else {
      sendPayload.message = outMessage;
      result = await SendFetch(sendPayload);
    }

    if (result && result.error) {
      setServerError(true);
    }

    setOutMessage('');

    if (result && result.responseData) {
      if (!updateMessage) {
        setUpdateMessage(!updateMessage);
        setLoading(false);
      } else if (updateMessage) {
        setUpdateMessage(!updateMessage);
        setLoading(false);
      }
    }
  };

  if (serverError) {
    return (
      <div className={styles.error} data-testid="error">
        <div className={styles.ChatTitle} data-testid="chat-title">
          {chatProfile && chatProfile.full_name}
        </div>
        <h1>A network error was encountered</h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loading} data-testid="loading">
        <div className={styles.ChatTitle} data-testid="chat-title">
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
          <div className={styles.ChatTitle} data-testid="chat-title">
            <div className={styles.avatarContainer}>
              <img src={avatar}></img>
            </div>
            {chatProfile && chatProfile.full_name}
          </div>
          <Conversation messages={messages} loginId={loginId} />
          {sendImage ? (
            <div className={styles.input}>
              <form action="" method="post" onSubmit={onSubmitForm}>
                <button
                  type="button"
                  onClick={onChangeInput}
                  data-testid="chat"
                >
                  <img src={chat}></img>
                </button>
                <div className={styles.imageInput}>
                  <label>
                    <div className={styles.selectImage}>Choose Image</div>
                    <input
                      style={{ display: 'none' }}
                      type="file"
                      name="out_value"
                      id="out_message"
                      accept="image/png, image/jpeg"
                      value={''}
                      onChange={(event) => setOutImage(event.target.files[0])}
                      data-testid="choose-image"
                    ></input>
                  </label>
                  <div>{outImage?.name}</div>
                </div>
                <button type="submit" data-testid="submit">
                  <img src={send}></img>
                </button>
              </form>
            </div>
          ) : (
            <div className={styles.input} data-testid="input">
              <form action="" method="post" onSubmit={onSubmitForm}>
                <button
                  type="button"
                  onClick={onChangeInput}
                  data-testid="image"
                >
                  <img src={image}></img>
                </button>
                <input
                  type="text"
                  name="out_message"
                  id="out_message"
                  placeholder="Type a message"
                  value={outMessage}
                  onChange={(event) => setOutMessage(event.target.value)}
                ></input>
                <button type="submit" data-testid="submit">
                  <img src={send}></img>
                </button>
              </form>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.noChat} data-testid="no-chat">
          No chats selected
        </div>
      )}
    </>
  );
};

export default Chat;
