import * as EmailValidator from "email-validator";
import { Box } from "grommet";
import { KeyboardEvent } from "react";
import styled from "styled-components";

import {
  border,
  borderSize,
  colors,
  edgeSize,
  transitionDuration,
} from "../../../../theme/theme-new";
import Email from "./Email";
import TextInput from "./TextInput";

type Props = {
  addEmail: (email: string) => void;
  email: string;
  emails: string[];
  removeEmail: (email: string) => void;
  setEmail: (email: string) => void;
};

const minWidth = "160px";

const StyledBox = styled(Box)`
  transition: border ${transitionDuration};

  &:hover {
    border-color: ${colors.gray5};
  }

  &:focus-within {
    border-color: ${colors.primary};
  }
`;

export default function InviteInput({
  addEmail,
  email,
  emails,
  removeEmail,
  setEmail,
}: Props): JSX.Element {
  const emailsHtml = emails.map((email, i) => {
    return (
      <Email
        email={email}
        isValid={EmailValidator.validate(email)}
        key={`${email}-${i}`}
        removeEmail={removeEmail}
      />
    );
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (email.length && ["Enter", ","].includes(e.key)) {
      e.preventDefault();
      addEmail(email);
      setEmail("");
    }
  };

  const padHorizontal = `calc(${
    emails.length ? edgeSize.xxxsmall : edgeSize.xsmall
  } - ${borderSize.xsmall})`;

  return (
    <StyledBox
      align="center"
      border={border}
      direction="row"
      fill="horizontal"
      pad={{ horizontal: padHorizontal }}
      round={borderSize.small}
      wrap
    >
      {emailsHtml}
      <Box flex style={{ minWidth }}>
        <TextInput
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          value={email}
        />
      </Box>
    </StyledBox>
  );
}
