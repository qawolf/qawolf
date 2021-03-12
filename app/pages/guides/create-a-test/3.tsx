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

const step = 3;

export default function CreateATest3(): JSX.Element {
  return (
    <Layout step={step}>
      <BsArrowUpLeft {...iconProps} />
      <Text {...textProps}>{copy.toggleCreateCode}</Text>
      <ClickButton />
      <Text {...textProps}>{copy.toggleCreateCode2}</Text>
      <Text {...textProps} margin={{ top: "medium" }}>
        {copy.toggleCreateCode3}
      </Text>
      <NextButton step={step} />
    </Layout>
  );
}
