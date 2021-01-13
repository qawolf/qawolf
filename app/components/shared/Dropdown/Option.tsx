import { Box, Button } from "grommet";
import { Icon } from "grommet-icons";
import Link from "next/link";
import { IconType } from "react-icons";

import {
  colors,
  edgeSize,
  hoverTransition,
  iconSize,
  overflowStyle,
} from "../../../theme/theme";
import Text from "../Text";
import styles from "./Dropdown.module.css";

type Props = {
  IconComponent?: Icon | IconType;
  href?: string;
  isSelected: boolean;
  message: string;
  onClick?: () => void;
};

export default function Option({
  IconComponent,
  href,
  isSelected,
  message,
  onClick,
}: Props): JSX.Element {
  const color = isSelected ? colors.fadedBlue : colors.black;
  const weight = isSelected ? "bold" : "normal";

  const innerHtml = (
    <Box
      align="center"
      className={styles.dropdownOption}
      direction="row"
      pad={{ horizontal: "medium", vertical: "small" }}
    >
      {!!IconComponent && (
        <IconComponent
          color={color}
          size={iconSize}
          style={{ marginRight: edgeSize.small, transition: hoverTransition }}
        />
      )}
      <Text
        color={color}
        size="medium"
        style={{ ...overflowStyle, transition: hoverTransition }}
        weight={weight}
      >
        {message}
      </Text>
    </Box>
  );

  if (href) {
    return (
      <Link href={href} replace>
        <a>{innerHtml}</a>
      </Link>
    );
  }

  return (
    <Button a11yTitle={message} onClick={onClick} plain>
      {innerHtml}
    </Button>
  );
}
