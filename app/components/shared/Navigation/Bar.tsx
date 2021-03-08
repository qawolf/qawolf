import { Box } from "grommet";
import { useState } from "react";
import styled from "styled-components";

import { breakpoints, colors, height, width } from "../../../theme/theme";
import GitHubStars from "../GitHubStars";
import Hamburger from "../Hamburger";
import Buttons from "./Buttons";
import Container from "./Container";
import Drawer from "./Drawer";
import Links from "./Links";

type Props = { transparent?: boolean };

const StyledBox = styled(Box)`
  width: 100%;

  @media screen and (min-width: ${breakpoints.small.value}px) {
    max-width: 100%;
    width: ${width.content};
  }
`;

export default function Navigation({ transparent }: Props): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const type = !isOpen && transparent ? "light" : "dark";

  return (
    <Container transparent={!isOpen && !!transparent}>
      <StyledBox
        align="center"
        direction="row"
        height={height.navigation}
        justify="between"
        margin={{ horizontal: "auto" }}
      >
        <Links type={type} />
        <Box align="center" direction="row">
          <GitHubStars type={type} />
          <Hamburger
            color={type === "light" ? colors.white : colors.textDark}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
          />
          <Buttons type={type} />
        </Box>
      </StyledBox>
      {isOpen && <Drawer />}
    </Container>
  );
}
