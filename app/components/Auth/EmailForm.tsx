import { Box, Keyboard } from "grommet";
import { useRef, useState } from "react";

import { AuthMode } from "../../lib/types";
import { copy } from "../../theme/copy";
import Button from "../shared/Button";
import Text from "../shared/Text";
import TextInput from "../shared/TextInput";

type Props = {
  disabled: boolean;
  error: string;
  mode: AuthMode;
  onSubmit: (email: string) => void;
};

export default function EmailForm({
  disabled,
  error,
  mode,
  onSubmit,
}: Props): JSX.Element {
  const [email, setEmail] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    onSubmit(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const label = mode === "signUp" ? copy.signUpWithEmail : copy.logInWithEmail;

  return (
    <Keyboard onEnter={handleClick}>
      <Box flex={false}>
        <Text
          color="textDark"
          margin={{ bottom: "xxsmall" }}
          size="xsmall"
          weight="medium"
        >
          {copy.email}
        </Text>
        <TextInput
          autoFocus
          name="email"
          onChange={handleEmailChange}
          placeholder={copy.emailPlaceholder}
          ref={ref}
          value={email}
        />
        {!!error && (
          <Text
            color="error"
            margin={{ top: "xxsmall" }}
            size="xsmall"
            weight="medium"
          >
            {error}
          </Text>
        )}
        <Button
          disabled={disabled}
          margin={{ bottom: "xxsmall", top: "medium" }}
          label={label}
          onClick={handleClick}
          size="medium"
        />
      </Box>
    </Keyboard>
  );
}
