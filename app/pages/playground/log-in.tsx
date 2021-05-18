import { Box } from "grommet";
import { ChangeEvent, useState } from "react";

import Button from "../../components/shared/AppButton";
import TextInput from "../../components/shared/AppTextInput";
import Header from "../../components/shared/playground/Header";
import Text from "../../components/shared/Text";
import { edgeSize } from "../../theme/theme";

type Props = { isUpdated?: boolean };

const correctUsername = "username";
const correctPassword = "wolf123";

const textProps = { color: "gray9", size: "component" as const };

export default function LogIn({ isUpdated }: Props): JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleClick = (): void => {
    setUsername("");
    setPassword("");

    if (username !== correctUsername || password !== correctPassword) {
      setUsername("");
      setPassword("");
      setError("Invalid username/password");
    } else {
      setError("");
      setIsLoggedIn(true);
    }
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  };

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setUsername(e.target.value);
  };

  if (isLoggedIn) {
    return (
      <Box align="center">
        <Header label="You are logged in" />
        <Button
          label="Log out"
          onClick={() => setIsLoggedIn(false)}
          type="primary"
        />
      </Box>
    );
  }

  return (
    <Box align="center">
      <Header label="Log in" />
      <Box width="280px">
        <TextInput
          id="username"
          onChange={handleUsernameChange}
          placeholder="Username"
          value={username}
        />
        <TextInput
          id="password"
          margin={{ vertical: "small" }}
          onChange={handlePasswordChange}
          placeholder="Password"
          type="password"
          value={password}
        />
        <Button
          justify="center"
          label={isUpdated ? "Sign in" : "Log in"}
          onClick={handleClick}
          type="primary"
        />
        <Box height={edgeSize.small} margin={{ top: "xxsmall" }}>
          {!!error && (
            <Text {...textProps} color="danger5" textAlign="center">
              {error}
            </Text>
          )}
        </Box>
        <Box margin={{ top: "medium" }}>
          <Text {...textProps}>{`Username: ${correctUsername}`}</Text>
          <Text {...textProps} margin={{ top: "xxsmall" }}>
            {`Password: ${correctPassword}`}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
