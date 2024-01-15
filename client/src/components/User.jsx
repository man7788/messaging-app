import styles from './User.module.css';

const User = ({ profile }) => {
  return (
    <div className={styles.User}>
      <button>{profile.full_name}</button>
    </div>
  );
};

export default User;
