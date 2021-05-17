import { Box } from "grommet";
import { ChangeEvent, useState } from "react";

import Button from "../../components/shared/AppButton";
import TextInput from "../../components/shared/AppTextInput";
import Header from "../../components/shared/playground/Header";
import Text from "../../components/shared/Text";

const correctUsername = "username";
const correctPassword = "wolf123";

export default function LogIn(): JSX.Element {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  };

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
          margin={{ vertical: "small" }}
          onChange={handlePasswordChange}
          placeholder="Password"
          type="password"
          value={password}
        />
        <Button justify="center" label="Log in" type="primary" />
        <Box margin={{ top: "large" }}>
          <Text
            color="gray9"
            size="component"
          >{`Username: ${correctUsername}`}</Text>
          <Text
            color="gray9"
            margin={{ top: "xxsmall" }}
            size="component"
          >{`Password: ${correctPassword}`}</Text>
        </Box>
      </Box>
    </Box>
  );
}
