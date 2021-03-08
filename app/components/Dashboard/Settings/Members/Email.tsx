import { Box, Button } from "grommet";
import styled from "styled-components";

import {
  border,
  borderSize,
  colors,
  edgeSize,
  transitionDuration,
} from "../../../../theme/theme";
import Close from "../../../shared/icons/Close";
import Text from "../../../shared/Text";

type Props = {
  className?: string;
  email: string;
  isValid: boolean;
  removeEmail: (email: string) => void;
};

function Email({ className, email, isValid, removeEmail }: Props): JSX.Element {
  const handleClick = (): void => removeEmail(email);

  return (
    <Box
      align="center"
      background={isValid ? "transparent" : "danger2"}
      border={{ ...border, color: isValid ? "gray3" : "danger2" }}
      direction="row"
      margin={{ right: "xxsmall" }}
      pad={{ horizontal: "xxsmall", vertical: "xxxsmall" }}
      round="xlarge"
    >
      <Text
        color={isValid ? "gray9" : "danger7"}
        margin={{ right: "xxxsmall" }}
        size="componentSmall"
      >
        {email}
      </Text>
      <Button a11yTitle={`remove ${email}`} onClick={handleClick} plain>
        <Box className={className} round={borderSize.small}>
          <Close
            color={isValid ? colors.gray5 : colors.danger5}
            size={edgeSize.xsmall}
          />
        </Box>
      </Button>
    </Box>
  );
}

const StyledEmail = styled(Email)`
  svg {
    transition: fill ${transitionDuration};
  }

  &:hover {
    svg {
      fill: ${(props) => (props.isValid ? colors.gray8 : colors.danger6)};
    }
  }

  &:active {
    svg {
      fill: ${(props) => (props.isValid ? colors.gray9 : colors.danger7)};
    }
  }
`;

export default StyledEmail;
