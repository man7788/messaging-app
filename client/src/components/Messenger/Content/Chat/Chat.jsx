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
import close from '../../../../images/close.svg';

const Chat = ({ loginId }) => {
  const { chatProfile } = useContext(chatContext);
  const [messages, setMessages] = useState([]);
  const [outMessage, setOutMessage] = useState('');
  const [updateMessage, setUpdateMessage] = useState(null);
  const [sendImage, setSendImage] = useState('');
  const [outImage, setOutImage] = useState('');
  const [submit, setSubmit] = useState(null);

  const [loading, setLoading] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [formErrors, setFormErrors] = useState([]);
  const [imageError, setImageError] = useState(null);

  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);
      setSendImage(null);
      setMessages(null);
      setOutMessage('');
      setOutImage('');
      setImageError(null);
      const idPayload = {};

      if (chatProfile && chatProfile._id) {
        idPayload.user_id = chatProfile.user_id;
      }

      const result = await messagesFetch(idPayload);

      if (result && result.error) {
        setServerError(true);
      }

      if (result && result.formErrors) {
        setFormErrors(result.formErrors);
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

  useEffect(() => {
    if (outMessage.length > 0 || outImage) {
      setSubmit(true);
    } else {
      setSubmit(false);
    }
    setImageError(null);
  }, [outMessage, outImage]);

  useEffect(() => {
    for (const error of formErrors) {
      if (/\bimage/i.test(error.msg)) {
        setImageError(error.msg);
      }
    }
  }, [formErrors]);

  const onChangeInput = () => {
    if (!sendImage) {
      setSendImage(true);
      setOutImage('');
      setOutMessage('');
    } else {
      setSendImage(false);
      setOutImage('');
      setOutMessage('');
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

    if (result && result.formErrors) {
      setFormErrors(result.formErrors);
      setLoading(false);
    }

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
              <img src={avatar} />
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
                  <img src={chat} />
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
                  <div
                    className={
                      imageError ? styles.imageNameGrid : styles.imageName
                    }
                  >
                    <div className={styles.imageFileName}>
                      {outImage?.name ? outImage.name : 'No image chosen'}
                    </div>
                    {imageError ? (
                      <div className={styles.imageError}>{imageError}</div>
                    ) : null}
                  </div>
                  <button
                    className={styles.imageDelete}
                    type="button"
                    style={outImage ? { display: 'flex' } : { display: 'none' }}
                    onClick={() => setOutImage('')}
                    data-testid="image-delete"
                  >
                    <img src={close} />
                  </button>
                </div>
                <div className={styles.submit}>
                  <button
                    style={submit ? { display: 'block' } : { display: 'none' }}
                    type="submit"
                    data-testid="submit"
                  >
                    <img src={send} />
                  </button>
                </div>
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
                  <img src={image} />
                </button>
                <input
                  type="text"
                  name="out_message"
                  id="out_message"
                  placeholder="Type a message"
                  value={outMessage}
                  onChange={(event) => setOutMessage(event.target.value)}
                ></input>
                <div className={styles.submit}>
                  <button
                    style={submit ? { display: 'block' } : { display: 'none' }}
                    type="submit"
                    data-testid="submit"
                  >
                    <img src={send} />
                  </button>
                </div>
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
