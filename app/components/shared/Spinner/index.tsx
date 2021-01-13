import classNames from "classnames";
import { Box, BoxProps } from "grommet";

import { colors, edgeSize } from "../../../theme/theme";
import Paw from "../icons/Paw";
import styles from "./Spinner.module.css";

type Props = {
  color?: string;
  fill?: BoxProps["fill"];
  noMargin?: boolean;
  small?: boolean;
};

const ANIMATION_DELAY = 500;
const DEFAULT_MARGIN = "160px";
const NUM_PAWS = 6;
const SMALL_SIZE = 9;

const formatDelay = (delay: string) => {
  return {
    animationDelay: delay,
    MozAnimationDelay: delay,
    OAnimationDelay: delay,
    WebkitAnimationDelay: delay,
  };
};

export default function Spinner({
  color,
  fill,
  noMargin,
  small,
}: Props): JSX.Element {
  const pawComponents: JSX.Element[] = [];
  const pawColor = colors[color] || colors.black;
  const pawSize = small ? `${SMALL_SIZE}px` : "large";
  const topMarginSize = pawSize === "large" ? 80 : SMALL_SIZE;

  for (let i = 0; i < NUM_PAWS; i++) {
    const className = classNames(styles.svg, {
      [styles.even]: i % 2 === 0,
      [styles.odd]: i % 2 !== 0,
    });
    const topMargin =
      i % 2 === 0 ? `-${topMarginSize}px` : `${topMarginSize}px`;
    const rightMargin = i < NUM_PAWS - 1 ? edgeSize.medium : "0";
    const style = formatDelay(`${(i + 1) * ANIMATION_DELAY}ms`);

    pawComponents.push(
      <Box
        className={className}
        key={i}
        margin={{
          top: topMargin,
          right: rightMargin,
        }}
        style={style}
      >
        <Paw color={pawColor} size={pawSize} />
      </Box>
    );
  }

  return (
    <Box align="center" fill flex>
      <Box
        align="center"
        direction="row"
        fill={fill}
        margin={noMargin ? undefined : { top: DEFAULT_MARGIN }}
      >
        {pawComponents}
      </Box>
    </Box>
  );
}
