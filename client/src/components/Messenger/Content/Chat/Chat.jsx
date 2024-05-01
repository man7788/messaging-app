import styles from './Chat.module.css';
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import SendMessageFetch from '../../../../fetch/chats/SendMessageAPI';
import SendImageFetch from '../../../../fetch/chats/SendImageAPI';
import GroupSendMessageFetch from '../../../../fetch/groups/GroupSendMessageAPI';
import GroupSendImageFetch from '../../../../fetch/groups/GroupSendImageAPI';
import Conversation from './Conversation';
import send from '../../../../images/send.svg';
import avatar from '../../../../images/avatar.svg';
import image from '../../../../images/image.svg';
import chat from '../../../../images/chat.svg';
import close from '../../../../images/close.svg';

const Chat = () => {
  const { loginId, chatProfile } = useOutletContext();
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
    setSendImage(null);
    setOutMessage('');
    setOutImage('');
    setImageError(null);
  }, [chatProfile]);

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

    let sendPayload = {};
    let result;

    if (sendImage) {
      if (chatProfile && chatProfile.full_name) {
        sendPayload.user_id = chatProfile.user_id;
        sendPayload.image = outImage;
        result = await SendImageFetch(sendPayload);
      } else if (chatProfile && chatProfile.name) {
        sendPayload.group_id = chatProfile._id;
        sendPayload.image = outImage;
        result = await GroupSendImageFetch(sendPayload);
      }
    } else {
      if (chatProfile && chatProfile.full_name) {
        sendPayload.user_id = chatProfile.user_id;
        sendPayload.message = outMessage;
        result = await SendMessageFetch(sendPayload);
      } else if (chatProfile && chatProfile.name) {
        sendPayload.group_id = chatProfile._id;
        sendPayload.message = outMessage;
        result = await GroupSendMessageFetch(sendPayload);
      }
    }

    const { error, responseData } = result;

    if (error) {
      setServerError(true);
    }

    if (responseData && responseData.errors) {
      setFormErrors(responseData.errors);
      setLoading(false);
    }

    if (
      (responseData && responseData.createdMessage) ||
      (responseData && responseData.createdImage)
    ) {
      setUpdateMessage(!updateMessage);
      setSendImage(null);
      setOutImage('');
      setOutMessage('');
      setLoading(false);
    }
  };

  if (serverError) {
    return (
      <div className={styles.error} data-testid="error">
        <div className={styles.ChatTitle} data-testid="chat-title">
          <div className={styles.avatarContainer}>
            <img className={styles.img} src={avatar} />
          </div>
          {chatProfile && chatProfile.full_name}
          {chatProfile && chatProfile.name}
        </div>
        <h1>A network error was encountered</h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loading} data-testid="loading">
        <div className={styles.ChatTitle} data-testid="chat-title">
          <div className={styles.avatarContainer}>
            <img className={styles.img} src={avatar} />
          </div>
          {chatProfile && chatProfile.full_name}
          {chatProfile && chatProfile.name}
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
              <img className={styles.img} src={avatar} />
            </div>
            {chatProfile && chatProfile.full_name}
            {chatProfile && chatProfile.name}
          </div>
          <Conversation
            loginId={loginId}
            chatProfile={chatProfile}
            updateMessage={updateMessage}
          />
          {sendImage ? (
            <div className={styles.input}>
              <form action="" method="post" onSubmit={onSubmitForm}>
                <button
                  className={styles.button}
                  type="button"
                  onClick={onChangeInput}
                  data-testid="chat"
                >
                  <img className={styles.img} src={chat} />
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
                    <img className={styles.img} src={close} />
                  </button>
                </div>
                <div className={styles.submit}>
                  <button
                    className={styles.button}
                    style={submit ? { display: 'block' } : { display: 'none' }}
                    type="submit"
                    data-testid="submit"
                  >
                    <img className={styles.img} src={send} />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className={styles.input} data-testid="input">
              <form action="" method="post" onSubmit={onSubmitForm}>
                <button
                  className={styles.button}
                  type="button"
                  onClick={onChangeInput}
                  data-testid="image"
                >
                  <img className={styles.img} src={image} />
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
                    className={styles.button}
                    style={submit ? { display: 'block' } : { display: 'none' }}
                    type="submit"
                    data-testid="submit"
                  >
                    <img className={styles.img} src={send} />
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
