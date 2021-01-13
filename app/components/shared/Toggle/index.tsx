import { Box, BoxProps, Button } from "grommet";
import { Icon } from "grommet-icons";
import { IconType } from "react-icons";

import { colors, hoverTransition, iconSize } from "../../../theme/theme";
import Text from "../Text";
import styles from "./Toggle.module.css";

type Props = {
  IconComponent: Icon | IconType;
  border?: BoxProps["border"];
  disabled?: boolean;
  isOn: boolean;
  margin?: BoxProps["margin"];
  message?: string;
  onClick: () => void;
};

export const TOGGLE_SIZE = "32px";

export default function Toggle({
  IconComponent,
  border,
  disabled,
  isOn,
  margin,
  message,
  onClick,
}: Props): JSX.Element {
  const justify = isOn ? "end" : "start";

  return (
    <Box align="center" margin={margin}>
      <Button
        a11yTitle={message}
        className={styles.toggle}
        disabled={disabled}
        onClick={onClick}
        plain
      >
        <Box align="center">
          <Box
            background="fadedBlue"
            border={border}
            direction="row"
            justify={justify}
            round="xlarge"
            // do not include border in size in case no border passed
            style={{ boxSizing: "content-box" }}
            width={`calc(2 * ${TOGGLE_SIZE})`}
          >
            <Box
              align="center"
              background="brand"
              height={TOGGLE_SIZE}
              justify="center"
              round="full"
              width={TOGGLE_SIZE}
            >
              <IconComponent color={colors.black} size={iconSize} />
            </Box>
          </Box>
          {!!message && (
            <Text
              color="black"
              size="small"
              style={{ transition: hoverTransition }}
            >
              {message}
            </Text>
          )}
        </Box>
      </Button>
    </Box>
  );
}
