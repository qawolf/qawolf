import { Box } from "grommet";
import { BsArrowReturnLeft } from "react-icons/bs";

import { textProps } from "../../../components/Playground/Intro/helpers";
import Layout from "../../../components/Playground/Intro/Layout";
import Button from "../../../components/shared/Button";
import WolfButton from "../../../components/shared/icons/WolfButton";
import Text from "../../../components/shared/Text";
import { copy } from "../../../theme/copy";
import { colors, edgeSize } from "../../../theme/theme";

export default function Intro2(): JSX.Element {
  return (
    <Layout step={2}>
      <Text {...textProps}>{copy.runTestIntro}</Text>
      <BsArrowReturnLeft color={colors.gray9} size={edgeSize.xxlarge} />
      <Text {...textProps} margin={{ vertical: "medium" }}>
        {copy.runTestIntro2} <code>⌘</code>
        &nbsp;(or <code>Ctrl</code>) + <code>Enter</code>.
      </Text>
      <Box alignSelf="center">
        <WolfButton color="blue" />
      </Box>
      <Box alignSelf="center" margin={{ top: "medium" }}>
        <Button
          label={copy.next}
          size="medium"
          type="outlineDark"
          width="160px"
        />
      </Box>
    </Layout>
  );
}
