import { Box } from "grommet";
import { Icon, Slack } from "grommet-icons";
import { ChangeEvent } from "react";

import { Integration } from "../../../../lib/types";
import {
  border,
  colors,
  edgeSize,
  overflowStyle,
} from "../../../../theme/theme";
import Email from "../../../shared/icons/Email";
import RadioButton from "../../../shared/RadioButton";
import Text from "../../../shared/Text";

type Props = {
  integration?: Integration;
  isChecked?: boolean;
  label: string;
  noIcon?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  value: string;
};

export const emailValue = "email";

export default function Alert({
  integration,
  isChecked,
  label,
  noIcon,
  onChange,
  value,
}: Props): JSX.Element {
  const a11yTitle = `select ${
    integration ? integration.slack_channel : emailValue
  }`;

  let IconComponent: Icon | null = null;
  if (!noIcon) IconComponent = integration ? Slack : Email;

  const labelHtml = (
    <Box align="center" direction="row" margin={{ left: "xxsmall" }}>
      {!!IconComponent && (
        <IconComponent
          color={integration ? "plain" : colors.gray9}
          size={edgeSize.small}
        />
      )}
      <Text
        color="gray9"
        margin={noIcon ? undefined : { left: "xxsmall" }}
        size="component"
      >
        {label}
      </Text>
    </Box>
  );

  return (
    <Box
      align="center"
      border={{ ...border, side: "top" }}
      direction="row"
      justify="between"
      pad={{ vertical: "small" }}
    >
      <RadioButton
        a11yTitle={a11yTitle}
        checked={isChecked}
        label={labelHtml}
        name="alert"
        onChange={onChange}
        value={value}
      />
      {!!integration && (
        <Text color="gray7" size="component" style={overflowStyle}>
          {integration.slack_channel}
        </Text>
      )}
    </Box>
  );
}
