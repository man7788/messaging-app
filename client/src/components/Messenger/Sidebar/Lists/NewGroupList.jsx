import styles from './NewGroupList.module.css';
import { useEffect, useRef, useState } from 'react';
import NewGroupItem from './NewGroupItem';
import GroupCreateFetch from '../../../../fetch/groups/GroupCreateAPI';
import foward from '../../../../images/foward.svg';

const NewGroupList = ({
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

    const { error, responseData } = await GroupCreateFetch(groupPayload);

    if (error) {
      setServerError(true);
    }

    if (responseData && responseData.errors) {
      setFormErrors(responseData.errors);
      setLoading(false);
    }

    if (responseData && responseData.group) {
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
      className={isOverFlow ? styles.NewGroupListFlow : styles.NewGroup}
      ref={listRef}
      data-testid="group-list"
    >
      <div className={styles.createForm} data-testid="new-group-form">
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
          <button className={styles.button}>
            <img className={styles.img} src={foward}></img>
          </button>
        </form>
      </div>
      {renderList ? (
        friends.map((friend) => {
          if (friend.user_id !== loginId) {
            return (
              <NewGroupItem
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

export default NewGroupList;
