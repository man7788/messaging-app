import styles from './Group.module.css';
import avatar from '../../../../images/avatar.svg';

const Group = ({ profile, groupList, setGroupList }) => {
  const onChangeChat = () => {
    let newGroupList = [...groupList];

    if (!groupList.includes(profile.user_id)) {
      newGroupList.push(profile.user_id);
    } else {
      newGroupList = groupList.filter((id) => id !== profile.user_id);
    }

    setGroupList(newGroupList);
  };

  return (
    <div className={styles.Group}>
      <div className={styles.avatarContainer}>
        <img src={avatar}></img>
      </div>
      {profile.full_name}
      <input type="checkbox" onClick={onChangeChat}></input>
    </div>
  );
};

export default Group;
