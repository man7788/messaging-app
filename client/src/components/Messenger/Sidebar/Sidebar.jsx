import styles from './Sidebar.module.css';
import { useContext, useState } from 'react';
import useFriends from '../../../fetch/useFriendsAPI';
import Dropdown from './Dropdown';
import UserList from './Lists/UserList';
import FriendList from './Lists/FriendList';
import hamburger from '../../../images/hamburger.svg';
import arrow from '../../../images/arrow.svg';
import avatar from '../../../images/avatar.svg';
import { chatContext } from '../../../contexts/chatContext';
import SettingList from './Lists/SettingList';

const Sidebar = ({ name, loginId, showHamburger }) => {
  const { friends, friendsLoading, friendssError } = useFriends();
  const { setContentArea } = useContext(chatContext);
  const [showFriendList, setShowFriendList] = useState(true);
  const [showUserList, setShowUserList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const onShowFriends = () => {
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
            {showFriendList ? (
              <button onClick={onShowUsers}>Add</button>
            ) : (
              <button onClick={onShowFriends}>Friends</button>
            )}

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
          {showUserList && !showSettings && (
            <UserList
              loginId={loginId}
              friends={friends}
              friendsLoading={friendsLoading}
              friendssError={friendssError}
            />
          )}
          {showFriendList && (
            <FriendList
              loginId={loginId}
              friends={friends}
              friendsLoading={friendsLoading}
              friendssError={friendssError}
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
