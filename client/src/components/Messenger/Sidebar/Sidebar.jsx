import styles from './Sidebar.module.css';
import { useContext, useEffect, useState } from 'react';
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
  const {
    friends,
    friendsLoading,
    friendsError,
    updateFriends,
    setUpdateFriends,
  } = useFriends();
  const { setContentArea } = useContext(chatContext);
  const [showChatList, setShowChatList] = useState(true);
  const [showUserList, setShowUserList] = useState(false);
  const [showNewGroupList, setShowNewGroupList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (/chat/.test(location)) {
      setShowChatList(true);
    }

    if (/requests/.test(location)) {
      setShowUserList(true);
      setShowChatList(false);
    }

    if (/group/.test(location)) {
      setShowNewGroupList(true);
    }

    if (/settings/.test(location)) {
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
                <img src={avatar}></img>
              </div>
              {name}
            </div>
            <Link
              to="/chat"
              className={showChatList ? styles.LinkActive : styles.LinkDiv}
              onClick={onShowChats}
            >
              <img src={chat}></img>
            </Link>
            <Link
              to="/requests"
              className={showUserList ? styles.LinkActive : styles.LinkDiv}
              onClick={onShowUsers}
            >
              <img src={personAdd}></img>
            </Link>

            <button
              id="hamburger"
              onClick={() => setShowHamburger(true)}
              className={showHamburger ? styles.hamburgerActive : null}
              data-testid="hamburger"
            >
              <img id="hamburger" src={hamburger}></img>
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
              loginId={loginId}
              friends={friends}
              friendsLoading={friendsLoading}
              friendsError={friendsError}
            />
          )}
        </div>
      ) : (
        <div className={styles.Sidebar}>
          <div className={styles.backHeader}>
            <Link to="/chat" onClick={onShowChats}>
              <img src={arrow}></img>
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
          {showSettings && <SettingList setContentArea={setContentArea} />}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
