import styles from './Sidebar.module.css';
import { useContext, useState } from 'react';
import { chatContext } from '../../../contexts/chatContext';
import useFriends from '../../../fetch/users/useFriendsAPI';
import Dropdown from './Dropdown';
import ChatList from './Lists/ChatList';
import UserList from './Lists/UserList';
import GroupList from './Lists/GroupList';
import SettingList from './Lists/SettingList';
import arrow from '../../../images/arrow.svg';
import hamburger from '../../../images/hamburger.svg';
import avatar from '../../../images/avatar.svg';
import chat from '../../../images/chat.svg';
import personAdd from '../../../images/person_add.svg';

const Sidebar = ({ name, loginId, showHamburger, setShowHamburger }) => {
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
  const [showGroupList, setShowGroupList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const onShowFriends = () => {
    setUpdateFriends(!updateFriends);
    setShowChatList(true);
    setShowUserList(false);
    setShowGroupList(false);
    setShowSettings(false);
    setContentArea('chat');
  };

  const onShowUsers = () => {
    setShowUserList(true);
    setShowChatList(false);
    setContentArea('chat');
  };

  return (
    <div>
      {!showSettings && !showGroupList && (
        <div className={styles.Sidebar} data-testid="sidebar">
          <div className={styles.userInfo}>
            <div className={styles.loginUser}>
              <div className={styles.avatarContainer}>
                <img src={avatar}></img>
              </div>
              {name}
            </div>
            <button
              className={showChatList ? styles.buttonActiveList : null}
              onClick={onShowFriends}
            >
              <img src={chat}></img>
            </button>
            <button
              className={showUserList ? styles.buttonActiveList : null}
              onClick={onShowUsers}
            >
              <img src={personAdd}></img>
            </button>

            <button
              id="hamburger"
              onClick={() => setShowHamburger(true)}
              className={showHamburger ? styles.buttonActive : null}
              data-testid="hamburger"
            >
              <img id="hamburger" src={hamburger}></img>
            </button>
            {showHamburger && (
              <Dropdown
                setShowUserList={setShowUserList}
                setShowFriendList={setShowChatList}
                setShowGroupList={setShowGroupList}
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
      )}

      {showGroupList && (
        <div className={styles.Sidebar}>
          <div className={styles.groupInfo}>
            <button onClick={onShowFriends}>
              <img src={arrow}></img>
            </button>
            <div>New Group</div>
          </div>
          <GroupList
            loginId={loginId}
            friends={friends}
            friendsLoading={friendsLoading}
            friendsError={friendsError}
            onShowFriends={onShowFriends}
          />
        </div>
      )}

      {showSettings && (
        <div className={styles.Sidebar}>
          <div className={styles.settingInfo}>
            <button onClick={onShowFriends}>
              <img src={arrow}></img>
            </button>
            <div>Settings</div>
          </div>
          <SettingList setContentArea={setContentArea} />
        </div>
      )}
    </div>
  );
};

export default Sidebar;
