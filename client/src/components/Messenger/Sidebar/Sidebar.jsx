import styles from './Sidebar.module.css';
import { useEffect, useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { chatContext } from '../../../contexts/chatContext';
import useFriends from '../../../fetch/users/useFriendsAPI';
import Dropdown from './Dropdown';
import ChatList from './Lists/ChatList';
import UserList from './Lists/UserList';
import NewGroupList from './Lists/NewGroupList';
import SettingList from './Lists/SettingList';
import arrow from '../../../images/arrow.svg';
import hamburger from '../../../images/hamburger.svg';
import avatar from '../../../images/avatar.svg';
import chat from '../../../images/chat.svg';
import personAdd from '../../../images/person_add.svg';

const Sidebar = ({ name, loginId, showHamburger, setShowHamburger }) => {
  const location = useLocation().pathname;
  const { chatProfile } = useContext(chatContext);

  const {
    friends,
    friendsLoading,
    friendsError,
    updateFriends,
    setUpdateFriends,
  } = useFriends();
  const [showChatList, setShowChatList] = useState(true);
  const [showUserList, setShowUserList] = useState(false);
  const [showNewGroupList, setShowNewGroupList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [chatId, setChatId] = useState(null);

  useEffect(() => {
    const uri = location.split('/chat/')[1];
    if (uri) {
      setChatId(uri);
    }
  }, [chatProfile]);

  useEffect(() => {
    if (/chat/.test(location)) {
      setShowChatList(true);
    }

    if (/requests/.test(location)) {
      setShowUserList(true);
      setShowChatList(false);
    }

    if (/group\/create/.test(location)) {
      setShowNewGroupList(true);
    }

    if (/user/.test(location)) {
      setShowSettings(true);
    }
  }, []);

  const onShowChats = () => {
    setUpdateFriends(!updateFriends);
    setShowChatList(true);
    setShowUserList(false);
    setShowNewGroupList(false);
    setShowSettings(false);
  };

  const onShowUsers = () => {
    setShowUserList(true);
    setShowChatList(false);
  };

  return (
    <div>
      {!showSettings && !showNewGroupList ? (
        <div className={styles.Sidebar} data-testid="sidebar">
          <div className={styles.userHeader}>
            <div className={styles.loginUser}>
              <div className={styles.avatarContainer}>
                <img className={styles.img} src={avatar}></img>
              </div>
              {name}
            </div>
            <Link
              to={chatId ? `/chat/${chatId}` : `/chat`}
              className={showChatList ? styles.LinkActive : styles.LinkDiv}
              onClick={onShowChats}
              data-testid="chats"
            >
              <img className={styles.img} src={chat} title="Chats"></img>
            </Link>
            <Link
              to="/requests"
              className={showUserList ? styles.LinkActive : styles.LinkDiv}
              onClick={onShowUsers}
              data-testid="requests"
            >
              <img
                className={styles.img}
                src={personAdd}
                title="Requests"
              ></img>
            </Link>

            <button
              id="hamburger"
              onClick={() => setShowHamburger(true)}
              className={showHamburger ? styles.hamburgerActive : styles.button}
              data-testid="hamburger"
            >
              <img
                id="hamburger"
                className={styles.img}
                src={hamburger}
                title="Menu"
              ></img>
            </button>
            {showHamburger && (
              <Dropdown
                setShowUserList={setShowUserList}
                setShowChatList={setShowChatList}
                setShowGroupList={setShowNewGroupList}
                setShowSettings={setShowSettings}
              />
            )}
          </div>
          {showUserList && (
            <UserList
              loginId={loginId}
              friends={friends}
              friendsLoading={friendsLoading}
              friendsError={friendsError}
            />
          )}
          {showChatList && (
            <ChatList
              friends={friends}
              friendsLoading={friendsLoading}
              friendsError={friendsError}
              chatId={chatId}
            />
          )}
        </div>
      ) : (
        <div className={styles.Sidebar}>
          <div className={styles.backHeader}>
            <Link
              to={chatId ? `/chat/${chatId}` : `/chat`}
              onClick={onShowChats}
              data-testid="back"
            >
              <img className={styles.img} src={arrow}></img>
            </Link>
            {showNewGroupList && <div>New Group</div>}
            {showSettings && <div>Settings</div>}
          </div>
          {showNewGroupList && (
            <NewGroupList
              loginId={loginId}
              friends={friends}
              friendsLoading={friendsLoading}
              friendsError={friendsError}
              onShowFriends={onShowChats}
            />
          )}
          {showSettings && <SettingList />}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
