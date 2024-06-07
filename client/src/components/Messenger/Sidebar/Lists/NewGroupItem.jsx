import styles from './NewGroupItem.module.css';
import avatar from '../../../../images/avatar.svg';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

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
        <img className={styles.img} src={avatar}></img>
      </div>
      <div className={styles.nameDiv}>{profile.full_name}</div>
      <input
        type="checkbox"
        onChange={onChangeList}
        checked={isChecked}
      ></input>
    </div>
  );
};

NewGroupItem.propTypes = {
  profile: PropTypes.object.isRequired,
  groupList: PropTypes.arrayOf(PropTypes.object).isRequired,
  setGroupList: PropTypes.func.isRequired,
};

export default NewGroupItem;
