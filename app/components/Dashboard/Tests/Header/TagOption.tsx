import { Box, Button } from "grommet";
import styled from "styled-components";

import { Tag } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { colors, transitionDuration } from "../../../../theme/theme";
import TagCheckBox from "../../../shared/TagCheckBox";

type Props = {
  isChecked: boolean;
  onClick: () => void;
  tag?: Tag;
};

const StyledBox = styled(Box)`
  transition: background ${transitionDuration};

  &:hover {
    background: ${colors.gray2};
  }

  &:active {
    background: ${colors.gray3};
  }
`;

export default function TagOption({
  isChecked,
  onClick,
  tag,
}: Props): JSX.Element {
  return (
    <Button
      a11yTitle={`filter ${tag?.name || copy.noTags}`}
      onClick={onClick}
      plain
    >
      <StyledBox align="center" direction="row" justify="between" width="full">
        <TagCheckBox
          pad={{ horizontal: "xsmall", vertical: "xxsmall" }}
          selectState={isChecked ? "all" : "none"}
          tag={tag}
          width="full"
        />
      </StyledBox>
    </Button>
  );
}
