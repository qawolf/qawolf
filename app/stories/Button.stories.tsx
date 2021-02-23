import React from "react";
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from "@storybook/react/types-6-0";

import Button, { Props } from "../components/shared-new/AppButton";
import { ThemeContext } from "grommet";
import { theme } from "../theme/theme-new";

export default {
  title: "Button",
  component: Button,
  argTypes: {
    type: {
      control: {
        type: "select",
        options: ["primary", "secondary", "ghost"],
      },
    },
  },
} as Meta;

const Template: Story<Props> = (props) => {
  return (
    <ThemeContext.Extend value={theme}>
      <Button {...props} />
    </ThemeContext.Extend>
  );
};

export const Primary = Template.bind({});
Primary.args = {
  label: "Click me",
  type: "primary",
};
