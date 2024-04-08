import styles from './ChatList.module.css';
import { useEffect, useRef, useState } from 'react';
import Friend from './Chat';
import useGroups from '../../../../fetch/groups/useGroupsAPI';

const ChatList = ({ loginId, friends, friendsLoading, friendsError }) => {
  const listRef = useRef();
  const { groups, groupsLoading, groupsError, updateGroups, setUpdateGroups } =
    useGroups();
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renderList, setRenderList] = useState(null);
  const [isOverFlow, setIsOverFlow] = useState(null);

  useEffect(() => {
    if (listRef.current?.scrollHeight > listRef.current?.clientHeight) {
      setIsOverFlow(true);
    }
  });

  useEffect(() => {
    if (friends && groups) {
      const list = [...friends, ...groups];
      setChatList(list);
    }

    if (chatList.length > 0) {
      setLoading(false);
      setRenderList(true);
    }
  }, [friends, groups]);

  if (friendsError || groupsError) {
    return (
      <div className={styles.error} data-testid="error">
        <h1>A network error was encountered</h1>
      </div>
    );
  }

  if (friendsLoading || groupsLoading || loading) {
    return (
      <div className={styles.loading} data-testid="loading">
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <div
      className={isOverFlow ? styles.ChatListFlow : styles.ChatList}
      ref={listRef}
    >
      {renderList ? (
        chatList.map((chat) => {
          if (chat.full_name) {
            return (
              <Friend key={chat._id} profile={chat} online={chat.online} />
            );
          } else if (chat.name) {
            return (
              <Friend key={chat._id} profile={chat} online={chat.online} />
            );
          }
        })
      ) : (
        <div className={styles.empty}>Friend list is empty</div>
      )}
    </div>
  );
};

export default ChatList;
