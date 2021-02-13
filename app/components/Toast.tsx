import { Box, ThemeContext } from "grommet";
import { useContext } from "react";
import {
  borderSize,
  boxShadow,
  edgeSize,
  overflowStyle,
  theme,
} from "../theme/theme-new";
import { StateContext } from "./StateContext";
import Text from "./shared-new/Text";

const maxWidth = "480px";

export default function Toast(): JSX.Element {
  const { toast } = useContext(StateContext);

  if (!toast) return null;

  return (
    <ThemeContext.Extend value={theme}>
      <Box
        align="center"
        background="gray10"
        border={{ color: "gray8" }}
        direction="row"
        height={edgeSize.large}
        pad={{ horizontal: "xsmall" }}
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
          {toast.message}
        </Text>
      </Box>
    </ThemeContext.Extend>
  );
}
