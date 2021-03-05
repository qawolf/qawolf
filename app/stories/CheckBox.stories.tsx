import { Meta, Story } from "@storybook/react/types-6-0";
import { Box, ThemeContext } from "grommet";
import React from "react";

import CheckBox, { Props } from "../components/shared-new/CheckBox";
import Rocket from "../components/shared-new/icons/Rocket";
import Text from "../components/shared-new/Text";
import { colors, edgeSize } from "../theme/theme-new";
import theme from "./theme";

export default {
  title: "CheckBox",
  component: CheckBox,
  argTypes: {},
} as Meta;

const Template: Story<Props> = (props) => {
  return (
    <ThemeContext.Extend value={theme}>
      <CheckBox {...props} />
    </ThemeContext.Extend>
  );
};

const labelHtml = (
  <>
    <Box align="center" direction="row">
      <Rocket color={colors.primary} size={edgeSize.small} />
      <Text color="gray9" margin={{ left: "xxsmall" }} size="component">
        My Trigger
      </Text>
    </Box>
  </>
);

export const Basic = Template.bind({});
Basic.args = {
  checked: true,
  indeterminate: false,
};

export const Label = Template.bind({});
Label.args = {
  checked: true,
  indeterminate: false,
  label: labelHtml,
};
