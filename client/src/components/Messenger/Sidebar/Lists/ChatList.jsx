import styles from './ChatList.module.css';
import { useEffect, useRef, useState } from 'react';
import ChatListItem from './ChatListItem';
import useGroups from '../../../../fetch/groups/useGroupsAPI';

const ChatList = ({ friends, friendsLoading, friendsError, chatId }) => {
  const listRef = useRef();
  const { groups, groupsLoading, groupsError } = useGroups();
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renderList, setRenderList] = useState(null);
  const [isOverFlow, setIsOverFlow] = useState(null);

  useEffect(() => {
    if (listRef.current?.scrollHeight > listRef.current?.clientHeight) {
      setIsOverFlow(true);
    }
  });

  useEffect(() => {
    if (!friendsLoading && !groupsLoading && !friendsError && !groupsError) {
      const list = [...friends, ...groups];

      if (list.length > 0) {
        setChatList(list);
        setRenderList(true);
      }

      setLoading(false);
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
      data-testid="chat-list"
    >
      {renderList ? (
        chatList.map((chat) => {
          return (
            <ChatListItem
              key={chat._id}
              profile={chat}
              online={chat?.online}
              chatId={chatId}
            />
          );
        })
      ) : (
        <div className={styles.empty}>Chat list is empty</div>
      )}
    </div>
  );
};

export default ChatList;
