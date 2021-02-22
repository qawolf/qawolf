import { Box, Button } from "grommet";
import { useContext, useRef, useState } from "react";
import styled from "styled-components";

import { useOnClickOutside } from "../../../hooks/onClickOutside";
import {
  borderSize,
  colors,
  edgeSize,
  overflowStyle,
  transitionDuration,
} from "../../../theme/theme-new";
import Avatar from "../../shared-new/Avatar";
import Logo from "../../shared-new/icons/Logo";
import Text from "../../shared-new/Text";
import { StateContext } from "../../StateContext";
import { UserContext } from "../../UserContext";
import Actions from "./Actions";
import UserMenu from "./UserMenu";

const StyledBox = styled(Box)`
  transition: background ${transitionDuration};

  &:hover {
    background: ${colors.gray2};
  }
`;

export default function Header(): JSX.Element {
  const { teamId } = useContext(StateContext);
  const { user, wolf } = useContext(UserContext);

  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (): void => setIsOpen((prev) => !prev);
  const handleClose = (): void => setIsOpen(false);

  useOnClickOutside({ onClickOutside: handleClose, ref });

  const team = user?.teams.find((t) => t.id === teamId);

  return (
    <>
      <Box ref={ref} style={{ position: "relative" }}>
        <Button a11yTitle="user menu" onClick={handleClick} plain>
          <StyledBox
            align="center"
            background={isOpen ? "gray2" : "transparent"}
            direction="row"
            justify="between"
            pad="xxxsmall"
            round={borderSize.small}
          >
            <Box align="center" direction="row">
              <Box
                background="textDark"
                flex={false}
                pad="xxxsmall"
                round={borderSize.small}
              >
                <Logo width={edgeSize.small} />
              </Box>
              {!!team && (
                <Text
                  color="gray9"
                  margin={{ left: "xsmall" }}
                  size="componentBold"
                  style={overflowStyle}
                >
                  {team.name}
                </Text>
              )}
            </Box>
            {!!user && (
              <Avatar avatarUrl={user.avatar_url} wolfColor={wolf?.variant} />
            )}
          </StyledBox>
        </Button>
        <UserMenu isOpen={isOpen} onClose={handleClose} />
      </Box>
      <Actions teamId={teamId} />
    </>
  );
}
