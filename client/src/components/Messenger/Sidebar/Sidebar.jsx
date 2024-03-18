import styles from './Sidebar.module.css';
import { useContext, useState } from 'react';
import useFriends from '../../../fetch/useFriendsAPI';
import Dropdown from './Dropdown';
import FriendList from './Lists/FriendList';
import UserList from './Lists/UserList';
import RequestList from './Lists/RequestList';
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
  const [showRequestList, setShowRequestList] = useState(false);

  const onShowFriends = () => {
    setShowFriendList(true);
    setShowUserList(false);
    setShowSettings(false);
    setShowRequestList(false);
    setContentArea('chat');
  };

  const onShowUsers = () => {
    setShowUserList(true);
    setShowFriendList(false);
    setShowRequestList(false);
    setContentArea('chat');
  };

  const onShowRequests = () => {
    setShowRequestList(true);
    setShowUserList(false);
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
            <button onClick={onShowFriends}>Fds</button>
            <button onClick={onShowUsers}>Ppl</button>
            <button onClick={onShowRequests}>Req</button>

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
          {showRequestList && <RequestList />}
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
