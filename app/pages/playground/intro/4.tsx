import { BsArrowUpLeft } from "react-icons/bs";

import ClickButton from "../../../components/Playground/Intro/ClickButton";
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
      <BsArrowUpLeft {...iconProps} />
      <Text {...textProps}>{copy.toggleCreateCode3}</Text>
      <ClickButton />
      <NextButton step={step} />
    </Layout>
  );
}
