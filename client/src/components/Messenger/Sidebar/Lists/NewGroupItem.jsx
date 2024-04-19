import styles from './NewGroupItem.module.css';
import avatar from '../../../../images/avatar.svg';
import { useState, useEffect } from 'react';

const NewGroupItem = ({ profile, groupList, setGroupList }) => {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (groupList.includes(profile.user_id)) {
      setIsChecked(true);
    } else {
      setIsChecked(false);
    }
  }, [groupList]);

  const onChangeList = () => {
    let newGroupList = [...groupList];

    if (!groupList.includes(profile.user_id)) {
      newGroupList.push(profile.user_id);
    } else {
      newGroupList = groupList.filter((id) => id !== profile.user_id);
    }
    setGroupList(newGroupList);
  };

  return (
    <div className={styles.NewGroupItem} data-testid="group">
      <div className={styles.avatarContainer}>
        <img src={avatar}></img>
      </div>
      {profile.full_name}
      <input
        type="checkbox"
        onChange={onChangeList}
        checked={isChecked}
      ></input>
    </div>
  );
};

export default NewGroupItem;
