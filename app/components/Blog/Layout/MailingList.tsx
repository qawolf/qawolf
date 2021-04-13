import * as EmailValidator from "email-validator";
import { Box, Keyboard } from "grommet";
import { useState } from "react";
import styled from "styled-components";

import { useCreateSubscriber } from "../../../hooks/mutations";
import { copy } from "../../../theme/copy";
import { edgeSize, width } from "../../../theme/theme";
import Button from "../../shared/Button";
import Text from "../../shared/Text";
import TextInput from "../../shared/TextInput";

const StyledBox = styled(Box)`
  padding: 0 ${edgeSize.medium};

  @media screen and (min-width: ${width.content}) {
    padding: 0;
  }
`;

export default function MailingList(): JSX.Element {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const [createSubscriber, { data, loading }] = useCreateSubscriber();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };

  const handleClick = (): void => {
    if (!EmailValidator.validate(email)) {
      setError(copy.noEmail);
      return;
    }

    setError("");
    createSubscriber({ variables: { email } }).then(() => setEmail(""));
  };

  return (
    <StyledBox margin={{ top: "large" }}>
      <Text color="textDark" size="medium" weight="bold">
        {copy.joinMailingList}
      </Text>
      <Keyboard onEnter={handleClick}>
        <Box direction="row" margin={{ top: "small" }}>
          <TextInput
            onChange={handleChange}
            placeholder={copy.emailPlaceholder}
            value={email}
          />
          <Button
            disabled={loading}
            label={copy.subscribe}
            margin={{ left: "small" }}
            onClick={handleClick}
            size="medium"
          />
        </Box>
      </Keyboard>
      {!!(data?.createSubscriber || error) && (
        <Text
          color={error ? "error" : "primary"}
          margin={{ top: "small" }}
          size="xsmall"
          weight="normal"
        >
          {error ? copy.noEmail : copy.subscribeSuccess}
        </Text>
      )}
    </StyledBox>
  );
}
