import { BsArrowReturnLeft } from "react-icons/bs";

import {
  iconProps,
  textProps,
} from "../../../components/Playground/Intro/helpers";
import Layout from "../../../components/Playground/Intro/Layout";
import NextButton from "../../../components/Playground/Intro/NextButton";
import Text from "../../../components/shared/Text";
import { copy } from "../../../theme/copy";

const step = 4;

export default function Intro4(): JSX.Element {
  return (
    <Layout step={step}>
      <Text {...textProps}>{copy.runSelectedCode}</Text>
      <BsArrowReturnLeft {...iconProps} />
      <Text {...textProps} margin={{ top: "medium" }}>
        {copy.runSelectedCode2}
      </Text>
      <NextButton step={step} />
    </Layout>
  );
}
