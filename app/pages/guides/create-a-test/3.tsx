import { Box } from "grommet";
import { useState } from "react";
import { BsArrowUpLeft } from "react-icons/bs";

import ClickButton from "../../../components/Guides/CreateATest/ClickButton";
import {
  iconProps,
  textProps,
} from "../../../components/Guides/CreateATest/helpers";
import Layout from "../../../components/Guides/CreateATest/Layout";
import NextButton from "../../../components/Guides/CreateATest/NextButton";
import Text from "../../../components/shared/Text";
import { copy } from "../../../theme/copy";
import { transitionDuration } from "../../../theme/theme";

const step = 3;

export default function CreateATest3(): JSX.Element {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (): void => setIsClicked(true);

  return (
    <Layout step={step}>
      <BsArrowUpLeft {...iconProps} />
      <Text {...textProps}>{copy.toggleCreateCode}</Text>
      <ClickButton onClick={handleClick} />
      <Box
        style={{
          cursor: isClicked ? "auto" : "default",
          opacity: isClicked ? 1 : 0,
          transition: `opacity ${transitionDuration}`,
        }}
      >
        <Text {...textProps}>{copy.toggleCreateCode2}</Text>
        <Text {...textProps} margin={{ top: "medium" }}>
          {copy.toggleCreateCode3}
        </Text>
        {isClicked && <NextButton step={step} />}
      </Box>
    </Layout>
  );
}
