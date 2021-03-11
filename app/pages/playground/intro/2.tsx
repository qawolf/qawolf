import { Box } from "grommet";
import { BsArrowReturnLeft } from "react-icons/bs";

import {
  iconProps,
  textProps,
} from "../../../components/Playground/Intro/helpers";
import Layout from "../../../components/Playground/Intro/Layout";
import NextButton from "../../../components/Playground/Intro/NextButton";
import WolfButton from "../../../components/shared/icons/WolfButton";
import Text from "../../../components/shared/Text";
import { copy } from "../../../theme/copy";

const step = 2;

export default function Intro2(): JSX.Element {
  return (
    <Layout step={step}>
      <Text {...textProps}>{copy.runTestIntro}</Text>
      <BsArrowReturnLeft {...iconProps} />
      <Text {...textProps} margin={{ vertical: "medium" }}>
        {copy.runTestIntro2} <code>⌘</code>
        &nbsp;(or <code>Ctrl</code>) + <code>Enter</code>.
      </Text>
      <Box alignSelf="center">
        <WolfButton color="blue" />
      </Box>
      <NextButton step={step} />
    </Layout>
  );
}
