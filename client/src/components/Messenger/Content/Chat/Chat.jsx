import styles from './Chat.module.css';
import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
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

const Chat = ({ loginId, chatProfile, outMessage, setOutMessage }) => {
  const previousChatProfile = useRef(null);

  const [updateMessage, setUpdateMessage] = useState(false);
  const [sendImage, setSendImage] = useState(null);
  const [submit, setSubmit] = useState(null);

  const [serverError, setServerError] = useState(null);
  const [formErrors, setFormErrors] = useState([]);
  const [imageError, setImageError] = useState(null);
  const [sendLoading, setSendLoading] = useState(null);

  useEffect(() => {
    if (outMessage?.size) {
      setSendImage(true);
    } else {
      setSendImage(false);
    }
  }, []);

  useEffect(() => {
    if (chatProfile && previousChatProfile.current?._id !== chatProfile._id) {
      setSendImage(false);
      previousChatProfile.current = chatProfile;
    }
  }, [chatProfile]);

  useEffect(() => {
    if (
      (!/^\s+$/.test(outMessage) && outMessage.length > 0) ||
      outMessage?.size
    ) {
      setSubmit(true);
    } else {
      setSubmit(false);
    }
    setImageError(null);
  }, [outMessage]);

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
      setOutMessage('');
    } else {
      setSendImage(false);
      setOutMessage('');
    }
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();
    if (!sendImage && (/^\s+$/.test(outMessage) || outMessage.length === 0)) {
      return;
    }
    setSendLoading(true);

    let sendPayload = {};
    let result;

    if (sendImage) {
      if (chatProfile && chatProfile.full_name) {
        sendPayload.user_id = chatProfile.user_id;
        sendPayload.image = outMessage;
        result = await SendImageFetch(sendPayload);
        setOutMessage('');
      } else if (chatProfile && chatProfile.name) {
        sendPayload.group_id = chatProfile._id;
        sendPayload.image = outMessage;
        result = await GroupSendImageFetch(sendPayload);
        setOutMessage('');
      }
    } else {
      if (chatProfile && chatProfile.full_name) {
        sendPayload.user_id = chatProfile.user_id;
        sendPayload.message = outMessage;
        result = await SendMessageFetch(sendPayload);
        setOutMessage('');
      } else if (chatProfile && chatProfile.name) {
        sendPayload.group_id = chatProfile._id;
        sendPayload.message = outMessage;
        result = await GroupSendMessageFetch(sendPayload);
        setOutMessage('');
      }
    }

    const { error, responseData } = result;

    if (error) {
      setServerError(true);
    }

    if (responseData && responseData.errors) {
      setFormErrors(responseData.errors);
      setSendLoading(false);
    }

    if (
      (responseData && responseData.createdMessage) ||
      (responseData && responseData.createdImage)
    ) {
      setUpdateMessage(!updateMessage);
      setSendImage(null);
      setSendLoading(false);
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
          {sendLoading ? (
            <div
              className={styles.sendLoading}
              data-testid="send-loading"
            ></div>
          ) : (
            <Conversation
              loginId={loginId}
              chatProfile={chatProfile}
              updateMessage={updateMessage}
            />
          )}
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
                      onChange={(event) => setOutMessage(event.target.files[0])}
                      data-testid="choose-image"
                    ></input>
                  </label>
                  <div
                    className={
                      imageError ? styles.imageNameGrid : styles.imageName
                    }
                  >
                    <div className={styles.imageFileName}>
                      {outMessage?.name ? outMessage.name : 'No image chosen'}
                    </div>
                    {imageError ? (
                      <div className={styles.imageError}>{imageError}</div>
                    ) : null}
                  </div>
                  <button
                    className={styles.imageDelete}
                    type="button"
                    style={
                      outMessage ? { display: 'flex' } : { display: 'none' }
                    }
                    onClick={() => setOutMessage('')}
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

Chat.propTypes = {
  loginId: PropTypes.string.isRequired,
  chatProfile: PropTypes.object,
  outMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  setOutMessage: PropTypes.func.isRequired,
};

export default Chat;
