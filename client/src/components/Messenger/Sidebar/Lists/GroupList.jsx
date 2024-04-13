import styles from './GroupList.module.css';
import { useEffect, useRef, useState } from 'react';
import Group from './Group';
import GroupCreateFetch from '../../../../fetch/groups/GroupCreateAPI';
import foward from '../../../../images/foward.svg';

const GroupList = ({
  loginId,
  friends,
  friendsLoading,
  friendsError,
  onShowFriends,
}) => {
  const listRef = useRef();
  const [renderList, setRenderList] = useState(null);
  const [isOverFlow, setIsOverFlow] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [groupList, setGroupList] = useState([]);

  const [loading, setLoading] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [formErrors, setFormErrors] = useState([]);

  useEffect(() => {
    setGroupName('');
    setGroupList([]);
  }, []);

  useEffect(() => {
    setFormErrors([]);
  }, [groupName, groupList]);

  useEffect(() => {
    if (friends && friends.length > 0) {
      setRenderList(true);
    }

    if (listRef.current?.scrollHeight > listRef.current?.clientHeight) {
      setIsOverFlow(true);
    }
  }, [friends]);

  const onSubmitForm = async (e) => {
    e.preventDefault();

    setLoading(true);

    const groupPayload = {
      group_name: groupName,
      user_id_list: groupList,
    };

    const result = await GroupCreateFetch(groupPayload);

    if (result && result.error) {
      setServerError(true);
    }

    if (result && result.formErrors) {
      setFormErrors(result.formErrors);
      setLoading(false);
    }

    if (result && result.responseData) {
      setLoading(false);
      setGroupName('');
      setGroupList([]);
      onShowFriends();
    }
  };

  if (friendsError || serverError) {
    return (
      <div className={styles.error} data-testid="error">
        <h1>A network error was encountered</h1>
      </div>
    );
  }

  if (friendsLoading || loading) {
    return (
      <div className={styles.loading} data-testid="loading">
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <div
      className={isOverFlow ? styles.GroupListFlow : styles.Group}
      ref={listRef}
      data-testid="group-list"
    >
      <div className={styles.createForm}>
        <form action="" method="post" onSubmit={onSubmitForm}>
          <div className={styles.createError}>{formErrors[0]?.msg}</div>
          <input
            type="text"
            name="out_message"
            id="out_message"
            placeholder="Group name"
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
          ></input>
          <button>
            <img src={foward}></img>
          </button>
        </form>
      </div>
      {renderList ? (
        friends.map((friend) => {
          if (friend.user_id !== loginId) {
            return (
              <Group
                key={friend._id}
                profile={friend}
                groupList={groupList}
                setGroupList={setGroupList}
              />
            );
          }
        })
      ) : (
        <div className={styles.empty}>Friend list is empty</div>
      )}
    </div>
  );
};

export default GroupList;
