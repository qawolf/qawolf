import { Box } from "grommet";
import { useRef, useState } from "react";
import styled from "styled-components";

import { borderSize, edgeSize, transitionDuration } from "../../../theme/theme";
import Avatar from "../../shared/Avatar";
import Tooltip from "../../shared/Tooltip";

type Props = {
  avatar_url?: string | null;
  color: string;
  email: string;
  wolf_variant: string;
};

const StyledBox = styled(Box)`
  position: relative;

  .user-tooltip {
    opacity: 0;
    transition: opacity ${transitionDuration};
  }

  &:hover {
    .user-tooltip {
      opacity: 1;
    }
  }
`;

export default function User({
  avatar_url,
  color,
  email,
  wolf_variant,
}: Props): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <StyledBox
      background={color}
      key={email}
      pad={borderSize.small}
      ref={ref}
      round="full"
    >
      <Avatar avatarUrl={avatar_url} size="28px" wolfColor={wolf_variant} />
      <Box
        background="gray9"
        className="user-tooltip"
        style={{ position: "absolute" }}
        pad={{ horizontal: "xxsmall", vertical: "xxxsmall" }}
        round={borderSize.small}
      ></Box>
      {/* {!!ref.current && (
        <Tooltip
          align={{ top: "bottom" }}
          className="user-tooltip"
          isVisible
          label={email}
          style={{ marginTop: edgeSize.xxxsmall }}
          target={ref.current}
        />
      )} */}
    </StyledBox>
  );
}
