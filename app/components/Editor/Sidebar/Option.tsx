import classNames from "classnames";
import { Box, Button, TextProps } from "grommet";
import { useContext } from "react";

import { NavigationOption } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { edgeSize, hoverTransition } from "../../../theme/theme";
import Text from "../../shared/Text";
import { ActionsContext } from "../contexts/ActionsContext";
import styles from "./Sidebar.module.css";

type Props = {
  isSelected: boolean;
  onClick: () => void;
  option: NavigationOption;
};

const OFFSET = `-${edgeSize.small}`;
const textProps = {
  size: "medium",
  weight: "bold" as TextProps["weight"],
};

export default function Option({
  isSelected,
  onClick,
  option,
}: Props): JSX.Element {
  const { actions } = useContext(ActionsContext);

  const color = isSelected ? "white" : "fadedBlue";
  const isCode = option === "code";

  return (
    <Box className={styles.navigationOption} style={{ position: "relative" }}>
      {isCode && (
        <Box
          background="fadedBlue"
          className={classNames(styles.codeAction, {
            [styles.showCodeAction]: actions.length,
          })}
          flex={false}
          onClick={onClick}
          pad={{ horizontal: "medium", vertical: "small" }}
          round="xlarge"
          style={{
            left: OFFSET,
            position: "absolute",
            top: OFFSET,
          }}
        >
          <Text {...textProps} color="white">{`+ ${actions.length}`}</Text>
        </Box>
      )}
      <Button
        a11yTitle={`show ${option}`}
        id={isCode ? "code" : undefined}
        key={option}
        margin={{ right: "medium" }}
        onClick={onClick}
        plain
      >
        <Text
          {...textProps}
          color={color}
          style={{ transition: hoverTransition }}
        >
          {copy[option]}
        </Text>
      </Button>
    </Box>
  );
}
