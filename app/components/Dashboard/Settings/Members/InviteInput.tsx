import { Box, Keyboard } from "grommet";
import { KeyboardEvent } from "react";
import styled from "styled-components";

import {
  border,
  borderSize,
  colors,
  transitionDuration,
} from "../../../../theme/theme-new";
import TextInput from "./TextInput";

type Props = {
  email: string;
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

export default function InviteInput({ email, setEmail }: Props): JSX.Element {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    // TODO
  };

  return (
    <>
      <Keyboard onKeyDown={handleKeyDown}>
        <StyledBox
          align="center"
          border={border}
          direction="row"
          round={borderSize.small}
          wrap
        >
          <Box flex style={{ minWidth }}>
            <TextInput onChange={handleChange} value={email} />
          </Box>
        </StyledBox>
      </Keyboard>
    </>
  );
}
