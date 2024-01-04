import { useEffect, useState } from "react";
import styles from "./App.module.css";

const App = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [serverError, setServerError] = useState(false);

  const [loading, setLoading] = useState(false);

  if (serverError) {
    return (
      <div>
        <h1>A network error was encountered</h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className={styles.App}>
      <h1>Messaging App</h1>
    </div>
  );
};

export default App;
