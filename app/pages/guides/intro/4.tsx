import { Box } from "grommet";
import Image from "next/image";

import { textProps } from "../../../components/Guides/CreateATest/helpers";
import Layout from "../../../components/Guides/CreateATest/Layout";
import NextButton from "../../../components/Guides/CreateATest/NextButton";
import Text from "../../../components/shared/Text";
import { copy } from "../../../theme/copy";
import { edgeSize } from "../../../theme/theme";

const step = 4;

export default function Intro4(): JSX.Element {
  return (
    <Layout step={step}>
      <Text {...textProps}>{copy.runSelectedCode}</Text>
      <Text {...textProps} margin={{ vertical: "medium" }}>
        {copy.runSelectedCode2}
      </Text>
      <Box alignSelf="center" width="480px">
        <Image height={60} src="/playground/highlight-line.png" width={850} />
        <Box height={edgeSize.xxsmall} />
        <Image height={132} src="/playground/run-1-line.png" width={958} />
      </Box>
      <NextButton step={step} />
    </Layout>
  );
}
