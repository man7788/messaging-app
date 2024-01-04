import { useEffect, useState } from "react";
import styles from "./App.module.css";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [serverError, setServerError] = useState(false);
  const [formErrors, setFormErrors] = useState([]);

  const [loading, setLoading] = useState(false);

  const onSubmitForm = (e) => {
    e.preventDefault();
    setLoading(true);

    const loginPayload = { username, password };
    console.log(loginPayload);
    fetch(`http://localhost:3000/login`, {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginPayload),
    })
      .then((response) => {
        console.log(response);
        if (response.status >= 400) {
          throw new Error("server error");
        }
        return response.json();
      })
      .then((response) => {
        if (response && response.errors) {
          setFormErrors(response.errors);
          throw new Error("login error");
        }
        console.log("Success:", response);
        localStorage.setItem("token", JSON.stringify(response.token));
      })
      .catch((error) => {
        if (error && error.message == "sever error") {
          setServerError(error);
        }

        console.dir(error);
        console.error(error);
      })
      .finally(() => setLoading(false));
  };

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
      <h2>Login</h2>
      <form action="" method="post" onSubmit={onSubmitForm}>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          name="username"
          id="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        ></input>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          name="password"
          id="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        ></input>
        <button type="submit">Log In</button>
      </form>
      {formErrors && (
        <ul>
          {formErrors.map((error) => (
            <li key={error.msg}>{error.msg}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
