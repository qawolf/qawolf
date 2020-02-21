import React, { useState } from "react";

const USERNAME = "tomsmith";
const PASSWORD = "SuperSecretPassword!";

function LogIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const handleClick = () => {
    if (username !== USERNAME) {
      setError("Your username is invalid!");
    } else if (password !== PASSWORD) {
      setError("Your password is invalid!");
    } else {
      setError("");
      setLoggedIn(true);
    }
  };

  if (loggedIn) {
    return (
      <React.Fragment>
        <h1>Secure Area</h1>
        <button onClick={() => setLoggedIn(false)}>
          <p>Log out</p>
        </button>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <p>
        To log in, use <i>tomsmith</i> as the username, and{" "}
        <i>SuperSecretPassword!</i> as the password.
      </p>
      <label htmlFor="username">Username</label>
      <br />
      <input
        autoComplete="off"
        id="username"
        onChange={e => setUsername(e.target.value)}
        type="text"
        value={username}
      />
      <br />
      <label htmlFor="password">Password</label>
      <br />
      <input
        autoComplete="off"
        id="password"
        onChange={e => setPassword(e.target.value)}
        type="password"
        value={password}
      />
      <br />
      <button onClick={handleClick} style={{ cursor: "pointer" }} type="submit">
        <p>Log in</p>
      </button>
    </React.Fragment>
  );
}

export default LogIn;
