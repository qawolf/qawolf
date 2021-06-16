import { Box } from "grommet";
import styled from "styled-components";

import { borderSize as border, edgeSize } from "../../../theme/theme";
import Avatar from "../../shared/Avatar";
import Tooltip from "../../shared/Tooltip/Tooltip";

type Props = {
  avatar_url?: string | null;
  color: string;
  index: number;
  email: string;
  wolf_variant: string;
};

const avatarSize = "28px";
const borderSize = border.small;
const tooltipClass = "user-tooltip";

const StyledBox = styled(Box)`
  position: relative;

  .${tooltipClass} {
    display: none;
    transform: translate(calc(-50% + ${avatarSize} / 2), 0);
    z-index: 1;
  }

  &:hover {
    .${tooltipClass} {
      display: block;
    }
  }
`;

export default function User({
  avatar_url,
  color,
  index,
  email,
  wolf_variant,
}: Props): JSX.Element {
  return (
    <StyledBox
      a11yTitle={`avatar ${index + 1} ${email}`}
      background={color}
      key={email}
      pad={borderSize}
      round="full"
    >
      <Avatar
        avatarUrl={avatar_url}
        size={avatarSize}
        wolfColor={wolf_variant}
      />
      <Box
        className={tooltipClass}
        style={{
          position: "fixed",
          // relative to top of page so need to account for top padding
          top: `calc(${edgeSize.small} + ${avatarSize} + 2 * ${borderSize} + ${edgeSize.xxxsmall})`,
        }}
      >
        <Tooltip label={email} />
      </Box>
    </StyledBox>
  );
}
