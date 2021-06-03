import { Box } from "grommet";
import { useRef, useState } from "react";

import { borderSize, edgeSize } from "../../../theme/theme";
import Avatar from "../../shared/Avatar";
import Tooltip from "../../shared/Tooltip";

type Props = {
  avatar_url?: string | null;
  color: string;
  email: string;
  wolf_variant: string;
};

export default function User({
  avatar_url,
  color,
  email,
  wolf_variant,
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
      <Avatar avatarUrl={avatar_url} size="28px" wolfColor={wolf_variant} />
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
