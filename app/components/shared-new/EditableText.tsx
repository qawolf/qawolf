import { Box, Button } from "grommet";
import { useState } from "react";
import styled from "styled-components";
import {
  borderSize,
  colors,
  edgeSize,
  transitionDuration,
} from "../../theme/theme-new";
import Text from "./Text";

type Props = {
  disabled?: boolean;
  onChange: (value: string) => void;
  value: string;
};

const StyledBox = styled(Box)`
  border: ${borderSize.xsmall} solid transparent;
  height: ${edgeSize.large};
  transition: background ${transitionDuration}, border-color: ${transitionDuration};

  &:hover {
    background: ${colors.gray2};
  }

  &:active {
    background: transparent;
    border-color: ${colors.primary};
  }
`;

export default function EditableText({
  disabled,
  onChange,
  value,
}: Props): JSX.Element {
  const [isEdit, setIsEdit] = useState(false);

  const textHtml = (
    <StyledBox
      justify="center"
      pad={{ horizontal: "xxsmall" }}
      round={borderSize.small}
    >
      <Text color="gray9" size="componentHeader">
        {value}
      </Text>
    </StyledBox>
  );

  if (disabled) return textHtml;

  return <Button plain>{textHtml}</Button>;
}
