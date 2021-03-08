import { Box, Keyboard } from "grommet";
import { useState } from "react";
import styled from "styled-components";

import { useJoinMailingList } from "../../../hooks/mutations";
import { copy } from "../../../theme/copy";
import { edgeSize, width } from "../../../theme/theme-new";
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

  const [joinMailingList, { data, loading }] = useJoinMailingList();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };

  const handleClick = (): void => {
    if (!email || loading) return;
    joinMailingList({ variables: { email } });
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
            label={copy.subscribe}
            margin={{ left: "small" }}
            onClick={handleClick}
            size="medium"
          />
        </Box>
      </Keyboard>
      {!!data && (
        <Text
          color={data.joinMailingList ? "primaryFill" : "error"}
          margin={{ top: "small" }}
          size="xsmall"
          weight="normal"
        >
          {data.joinMailingList ? copy.subscribeSuccess : copy.subscribeError}
        </Text>
      )}
    </StyledBox>
  );
}
