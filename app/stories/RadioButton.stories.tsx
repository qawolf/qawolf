import { Meta, Story } from "@storybook/react/types-6-0";
import { Box, ThemeContext } from "grommet";
import React from "react";

import Folder from "../components/shared/icons/Folder";
import RadioButton, { Props } from "../components/shared/RadioButton";
import Text from "../components/shared/Text";
import { colors, edgeSize } from "../theme/theme";
import theme from "./theme";

export default {
  title: "RadioButton",
  component: RadioButton,
  argTypes: {},
} as Meta;

const Template: Story<Props> = (props) => {
  return (
    <ThemeContext.Extend value={theme}>
      <RadioButton {...props} />
    </ThemeContext.Extend>
  );
};

const labelHtml = (
  <>
    <Box align="center" direction="row" margin={{ left: "xxsmall" }}>
      <Folder color={colors.gray9} size={edgeSize.small} />
      <Text color="gray9" margin={{ left: "xxsmall" }} size="component">
        My Group
      </Text>
    </Box>
  </>
);

export const Basic = Template.bind({});
Basic.args = {
  checked: true,
};

export const TextLabel = Template.bind({});
TextLabel.args = {
  checked: true,
  label: "Click me",
};

export const Label = Template.bind({});
Label.args = {
  checked: true,
  label: labelHtml,
};
