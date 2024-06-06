import styles from './NewGroupList.module.css';
import { useEffect, useRef, useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { chatContext } from '../../../../contexts/chatContext';
import PropTypes from 'prop-types';
import NewGroupItem from './NewGroupItem';
import GroupCreateFetch from '../../../../fetch/groups/GroupCreateAPI';
import foward from '../../../../images/foward.svg';

const NewGroupList = ({
  loginId,
  friends,
  friendsLoading,
  friendsError,
  setChangeSlide,
  onShowChats,
  setChatId,
}) => {
  const listRef = useRef();
  const { setChatProfile } = useContext(chatContext);
  const [renderList, setRenderList] = useState(null);
  const [isOverFlow, setIsOverFlow] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [groupList, setGroupList] = useState([]);
  const [submit, setSubmit] = useState(null);

  const [loading, setLoading] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    setGroupName('');
    setGroupList([]);
  }, []);

  useEffect(() => {
    if (
      !/^\s+$/.test(groupName) &&
      groupName.length > 0 &&
      groupName.length <= 50 &&
      groupList.length > 0
    ) {
      setSubmit(true);
    } else {
      setSubmit(false);
    }
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
    if (
      /^\s+$/.test(groupName) ||
      groupName.length === 0 ||
      groupName.length > 50 ||
      groupList.length === 0
    ) {
      return;
    }

    setLoading(true);

    const groupPayload = {
      group_name: groupName,
      user_id_list: groupList,
    };

    const { error, responseData } = await GroupCreateFetch(groupPayload);

    if (error) {
      setServerError(true);
    }

    if (responseData && responseData.group) {
      setLoading(false);
      setGroupName('');
      setGroupList([]);
      setChangeSlide(false);
      onShowChats();
      setChatProfile(responseData.group);
      setChatId(responseData.group);
      setRedirect(responseData.group._id);
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
          <input
            type="text"
            name="out_message"
            id="out_message"
            placeholder="Group name"
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
          ></input>
          {submit ? (
            <button className={styles.button}>
              <img
                className={styles.img}
                src={foward}
                data-testid="new-group-submit"
              ></img>
            </button>
          ) : null}
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
      {redirect && <Navigate to={`/chat/${redirect}`} />}
    </div>
  );
};

NewGroupList.propTypes = {
  loginId: PropTypes.string.isRequired,
  friends: PropTypes.oneOfType([
    PropTypes.oneOf([null]),
    PropTypes.arrayOf(PropTypes.object),
  ]),
  friendsLoading: PropTypes.bool.isRequired,
  friendsError: PropTypes.oneOfType([
    PropTypes.oneOf([null]),
    PropTypes.string,
  ]),
  setChangeSlide: PropTypes.func.isRequired,
  onShowChats: PropTypes.func.isRequired,
  setChatId: PropTypes.func.isRequired,
};

export default NewGroupList;
