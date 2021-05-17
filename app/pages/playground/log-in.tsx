import { Box } from "grommet";
import { ChangeEvent, useState } from "react";

import Button from "../../components/shared/AppButton";
import TextInput from "../../components/shared/AppTextInput";
import CheckBox from "../../components/shared/CheckBox";
import Header from "../../components/shared/playground/Header";
import Text from "../../components/shared/Text";
import { edgeSize } from "../../theme/theme";

type Props = { isUpdated?: boolean };

const correctUsername = "username";
const correctPassword = "wolf123";

const textProps = { color: "gray9", size: "component" as const };

export default function LogIn({ isUpdated }: Props): JSX.Element {
  const [isChecked, setIsChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleClick = (): void => {
    if (username !== correctUsername || password !== correctPassword) {
      setUsername("");
      setPassword("");
      setError("Invalid username/password");
    } else if (isUpdated && !isChecked) {
      setError("Must accept terms");
    } else {
      setUsername("");
      setPassword("");
      setError("");
      setIsChecked(false);
      setIsLoggedIn(true);
    }
  };

  const handleCheckBoxChange = (): void => {
    setIsChecked((prev) => !prev);
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

  const labelHtml = (
    <Text {...textProps}>I accept the terms and conditions</Text>
  );

  return (
    <Box align="center">
      <Header label="Enter your credentials to log in" />
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
        {isUpdated && (
          <Box margin={{ bottom: "small" }}>
            <CheckBox
              a11yTitle="accept terms"
              checked={isChecked}
              label={labelHtml}
              onChange={handleCheckBoxChange}
            />
          </Box>
        )}
        <Button
          justify="center"
          label="Log in"
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
