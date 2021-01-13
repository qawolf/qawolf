import { Box, Button } from "grommet";
import { Close } from "grommet-icons";
import { useContext } from "react";

import { state } from "../../../lib/state";
import { colors, hoverTransition, iconSize } from "../../../theme/theme";
import { StateContext } from "../../StateContext";
import Text from "../Text";
import styles from "./Error.module.css";

const MAX_WIDTH = "480px";

export default function Error(): JSX.Element {
  const { error } = useContext(StateContext);

  if (!error) return null;

  const handleClick = () => state.setError(null);

  return (
    <Box
      align="center"
      background="pink"
      direction="row"
      margin={{ top: "medium" }}
      pad={{ horizontal: "medium", vertical: "small" }}
      round="xlarge"
      style={{
        left: "50%",
        position: "fixed",
        transform: "translateX(-50%)",
        maxWidth: MAX_WIDTH,
        zIndex: 50,
      }}
    >
      <Text
        color="black"
        margin={{ right: "medium" }}
        size="medium"
        textAlign="center"
      >
        {error}
      </Text>
      <Button
        a11yTitle="dismiss error"
        className={styles.closeError}
        onClick={handleClick}
        plain
        style={{ transition: hoverTransition }}
      >
        <Close color={colors.black} size={iconSize} />
      </Button>
    </Box>
  );
}
