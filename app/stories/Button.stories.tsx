import React from "react";
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from "@storybook/react/types-6-0";

import Button, { Props } from "../components/shared-new/AppButton";
import { ThemeContext } from "grommet";
import Edit from "../components/shared-new/icons/Edit";
import theme from "./theme";

export default {
  title: "Button",
  component: Button,
  argTypes: {
    type: {
      control: {
        type: "select",
        options: [
          "primary",
          "secondary",
          "ghost",
          "danger",
          "dark",
          "tertiary",
        ],
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
  IconComponent: Edit,
  label: "Click me",
  type: "primary",
};

export const Secondary = Template.bind({});
Secondary.args = {
  label: "Click me",
  type: "secondary",
};

export const Ghost = Template.bind({});
Ghost.args = {
  label: "Click me",
  type: "ghost",
};

export const Danger = Template.bind({});
Danger.args = {
  label: "Click me",
  type: "danger",
};

export const Dark = Template.bind({});
Dark.args = {
  label: "Click me",
  type: "dark",
};
