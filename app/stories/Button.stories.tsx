// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from "@storybook/react/types-6-0";
import { ThemeContext } from "grommet";
import React from "react";

import Button, { Props } from "../components/shared-new/AppButton";
import Rocket from "../components/shared-new/icons/Rocket";
import Trash from "../components/shared-new/icons/Trash";
import theme from "./theme";

export default {
  title: "Button",
  component: Button,
  argTypes: {
    hoverType: {
      control: {
        type: "select",
        options: ["danger", null],
      },
    },
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

export const IconOnly = Template.bind({});
IconOnly.args = {
  IconComponent: Trash,
  hoverType: "danger",
  type: "ghost",
};

export const IconAndText = Template.bind({});
IconAndText.args = {
  IconComponent: Rocket,
  label: "Click me",
  type: "primary",
};

export const Primary = Template.bind({});
Primary.args = {
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
