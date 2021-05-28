import { Box } from "grommet";
import { useRef, useState } from "react";

import { borderSize, edgeSize } from "../../../theme/theme";
import Avatar from "../../shared/Avatar";
import Tooltip from "../../shared/Tooltip";

type Props = {
  avatarUrl?: string | null;
  color: string;
  email: string;
  wolfColor: string;
};

export default function User({
  avatarUrl,
  color,
  email,
  wolfColor,
}: Props): JSX.Element {
  const [isHover, setIsHover] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <Box
      background={color}
      key={email}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      pad={borderSize.small}
      ref={ref}
      round="full"
    >
      <Avatar avatarUrl={avatarUrl} size="28px" wolfColor={wolfColor} />
      <Tooltip
        align={{ top: "bottom" }}
        isVisible={isHover}
        label={email}
        style={{ marginTop: edgeSize.xxxsmall }}
        target={ref.current}
      />
    </Box>
  );
}
