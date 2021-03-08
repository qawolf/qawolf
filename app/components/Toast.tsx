import { Box, Button } from "grommet";
import { useContext } from "react";
import styled from "styled-components";

import { state } from "../lib/state";
import {
  borderSize,
  boxShadow,
  colors,
  edgeSize,
  overflowStyle,
  transitionDuration,
} from "../theme/theme";
import Close from "./shared/icons/Close";
import Text from "./shared/Text";
import { StateContext } from "./StateContext";

const maxWidth = "480px";

const StyledBox = styled(Box)`
  svg {
    transition: fill ${transitionDuration};
  }

  &:hover {
    svg {
      fill: ${colors.gray2};
    }
  }
`;

export default function Toast(): JSX.Element {
  const { toast } = useContext(StateContext);

  if (!toast) return null;

  const { error, message } = toast;

  const handleClose = (): void => state.setToast(null);

  return (
    <Box
      align="center"
      background={error ? "danger5" : "gray10"}
      border={{ color: error ? "danger5" : "gray8" }}
      direction="row"
      height={edgeSize.large}
      pad={{ left: "xsmall", right: error ? "xxsmall" : "xsmall" }}
      round={borderSize.small}
      style={{
        boxShadow,
        left: "50%",
        maxWidth,
        position: "fixed",
        top: edgeSize.small,
        transform: "translateX(-50%)",
        zIndex: 10,
      }}
    >
      <Text color="gray0" size="component" style={overflowStyle}>
        {message}
      </Text>
      {!!error && (
        <Button margin={{ left: "xxsmall" }} onClick={handleClose} plain>
          <StyledBox>
            <Close color={colors.gray0} size={edgeSize.small} />
          </StyledBox>
        </Button>
      )}
    </Box>
  );
}
