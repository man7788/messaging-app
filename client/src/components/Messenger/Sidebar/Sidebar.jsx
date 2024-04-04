import styles from './Sidebar.module.css';
import { useContext, useState } from 'react';
import { chatContext } from '../../../contexts/chatContext';
import useFriends from '../../../fetch/users/useFriendsAPI';
import Dropdown from './Dropdown';
import FriendList from './Lists/FriendList';
import UserList from './Lists/UserList';
import hamburger from '../../../images/hamburger.svg';
import arrow from '../../../images/arrow.svg';
import avatar from '../../../images/avatar.svg';
import chat from '../../../images/chat.svg';
import personAdd from '../../../images/person_add.svg';
import SettingList from './Lists/SettingList';

const Sidebar = ({ name, loginId, showHamburger }) => {
  const {
    friends,
    friendsLoading,
    friendsError,
    updateFriends,
    setUpdateFriends,
  } = useFriends();
  const { setContentArea } = useContext(chatContext);
  const [showFriendList, setShowFriendList] = useState(true);
  const [showUserList, setShowUserList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const onShowFriends = () => {
    setUpdateFriends(!updateFriends);
    setShowFriendList(true);
    setShowUserList(false);
    setShowSettings(false);
    setContentArea('chat');
  };

  const onShowUsers = () => {
    setShowUserList(true);
    setShowFriendList(false);
    setContentArea('chat');
  };

  return (
    <div>
      {!showSettings && (
        <div className={styles.Sidebar} data-testid="sidebar">
          <div className={styles.userInfo}>
            <div className={styles.loginUser}>
              <div className={styles.avatarContainer}>
                <img src={avatar}></img>
              </div>
              {name}
            </div>
            <button
              className={showFriendList ? styles.buttonActiveList : null}
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
              className={showHamburger ? styles.buttonActive : null}
              data-testid="hamburger"
            >
              <img id="hamburger" src={hamburger}></img>
            </button>
            {showHamburger && (
              <Dropdown
                setShowUserList={setShowUserList}
                setShowFriendList={setShowFriendList}
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
          {showFriendList && (
            <FriendList
              loginId={loginId}
              friends={friends}
              friendsLoading={friendsLoading}
              friendsError={friendsError}
            />
          )}
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
