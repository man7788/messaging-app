import styles from './SignUp.module.css';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';

function SignUp() {
  const [loginRedirect, setLoginRedirect] = useState(null);
  return (
    <div className={styles.SignUp}>
      <h1>Messaging App</h1>
      <h2>SignUp</h2>
      <button onClick={() => setLoginRedirect(true)}>Log In</button>
      {loginRedirect && <Navigate to="/login" />}
    </div>
  );
}

export default SignUp;
