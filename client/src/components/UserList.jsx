import styles from './UserList.module.css';
import { useEffect, useState } from 'react';

const UserList = ({ profiles, profilesLoading, profilesError }) => {
  if (profilesError) {
    return (
      <div>
        <h1>A network error was encountered</h1>
      </div>
    );
  }

  if (profilesLoading) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className={styles.UserList}>
      <ul>
        {profiles.map((profile) => (
          <li key={profile._id}>{profile.full_name}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
