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
  const { setShowChat } = useContext(chatContext);
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
  const [drop, setDrop] = useState(null);
  const [slide, setSlide] = useState(null);
  const [changeSlide, setChangeSlide] = useState(true);
  const [userListSlide, setUserListSlide] = useState(null);

  useEffect(() => {
    if (/\/chat\/\w/.test(location)) {
      const uri = location.split('/chat/')[1];
      setChatId(uri);
    }
  });

  useEffect(() => {
    let timeoutId;

    if (showHamburger) {
      setDrop(true);
    } else {
      timeoutId = setTimeout(() => setDrop(false), 100);
    }

    return () => clearTimeout(timeoutId);
  }, [showHamburger]);

  useEffect(() => {
    let timeoutId;

    if (!changeSlide) {
      timeoutId = setTimeout(() => {
        if (showNewGroupList) {
          setShowNewGroupList(false);
        } else if (showSettings) {
          setShowSettings(false);
        }

        setSlide(false);
      }, 250);
    }
    return () => clearTimeout(timeoutId);
  }, [slide, changeSlide]);

  useEffect(() => {
    let timeoutId;
    let mql = window.matchMedia('(max-width: 900px)');

    if (mql.matches) {
      if (userListSlide) {
        setShowUserList(true);
      } else {
        timeoutId = setTimeout(() => setShowUserList(false), 100);
      }
    } else {
      if (userListSlide) {
        setShowUserList(true);
      } else {
        setShowUserList(false);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [userListSlide]);

  useEffect(() => {
    if (/chat/.test(location)) {
      setShowChatList(true);
    }

    if (/requests/.test(location)) {
      setShowUserList(true);
      setShowChatList(false);
    }

    if (/group\/create/.test(location)) {
      setSlide(true);
      setChangeSlide(true);
      setShowNewGroupList(true);
    }

    if (/user/.test(location)) {
      setSlide(true);
      setChangeSlide(true);
      setShowSettings(true);
    }
  }, []);

  const onHideSlide = () => {
    setChangeSlide(false);
    setShowChat(true);
  };

  const onShowChats = () => {
    setUpdateFriends(!updateFriends);
    setShowChatList(true);
    setUserListSlide(false);
  };

  const onShowUsers = () => {
    setShowChatList(false);
    setUserListSlide(true);
  };

  return (
    <div>
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
            onClick={showChatList ? null : onShowChats}
            data-testid="chats"
            tabIndex={0}
          >
            <img className={styles.img} src={chat} title="Chats"></img>
          </Link>
          <Link
            to="/requests"
            className={showUserList ? styles.LinkActive : styles.LinkDiv}
            onClick={showUserList ? null : onShowUsers}
            data-testid="requests"
            tabIndex={0}
          >
            <img className={styles.img} src={personAdd} title="Requests"></img>
          </Link>

          <button
            id="hamburger"
            onClick={() => setShowHamburger(true)}
            className={
              showHamburger ? styles.hamburgerActive : styles.hamburger
            }
            data-testid="hamburger"
            tabIndex={0}
          >
            <img
              id="hamburger"
              className={styles.img}
              src={hamburger}
              title="Menu"
            ></img>
          </button>
          {drop && (
            <Dropdown
              setShowNewGroupList={setShowNewGroupList}
              setShowSettings={setShowSettings}
              showHamburger={showHamburger}
              setShowHamburger={setShowHamburger}
              setSlide={setSlide}
              setChangeSlide={setChangeSlide}
            />
          )}
        </div>
        {showUserList && (
          <UserList
            loginId={loginId}
            friends={friends}
            friendsLoading={friendsLoading}
            friendsError={friendsError}
            userListSlide={userListSlide}
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

      {slide && (
        <div
          className={
            changeSlide ? styles.backSidebarActive : styles.backSidebar
          }
          data-testid="backsidebar"
        >
          <div className={styles.backHeader}>
            <Link
              to={chatId ? `/chat/${chatId}` : `/chat`}
              onClick={onHideSlide}
              data-testid="back"
            >
              <img className={styles.img} src={arrow}></img>
            </Link>
            {showNewGroupList && <div className={styles.title}>New Group</div>}
            {showSettings && <div className={styles.title}>Settings</div>}
          </div>
          {showNewGroupList && (
            <NewGroupList
              loginId={loginId}
              friends={friends}
              friendsLoading={friendsLoading}
              friendsError={friendsError}
              setChangeSlide={setChangeSlide}
              onShowChats={onShowChats}
              setChatId={setChatId}
            />
          )}
          {showSettings && <SettingList />}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
