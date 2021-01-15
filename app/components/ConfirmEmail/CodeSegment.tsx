import { Box, TextInput } from "grommet";
import { ReactNode } from "react";
import styled from "styled-components";

import {
  borderSize,
  colors,
  edgeSize,
  fontFamily,
  textDesktop,
} from "../../theme/theme-new";

type Props = {
  code: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  startIndex: number;
};

const inputProps = {
  maxLength: 1,
  plain: true,
};

const StyledInput = styled(TextInput)`
  border: ${borderSize.medium} solid ${colors.fill20};
  border-radius: ${edgeSize.xsmall};
  color: ${colors.textDark};
  font-family: ${fontFamily.medium};
  font-size: ${textDesktop.xsmall.size};
  line-height: ${textDesktop.xsmall.height};
  max-width: 56px;
  text-align: center;

  &:focus {
    border-color: ${colors.primaryFill};
  }
`;

export default function CodeSegment({
  code,
  onChange,
  onPaste,
  startIndex,
}: Props): JSX.Element {
  const children: ReactNode[] = [];

  for (let i = 0; i < 3; i++) {
    const index = startIndex + i;

    children.push(
      <Box flex={false} margin={{ right: i < 2 ? edgeSize.xsmall : "0px" }}>
        <StyledInput
          {...inputProps}
          id={`${index}-code`}
          key={index}
          onChange={onChange}
          onPaste={onPaste}
          value={code[index] || ""}
        />
      </Box>
    );
  }

  return <>{children}</>;
}
