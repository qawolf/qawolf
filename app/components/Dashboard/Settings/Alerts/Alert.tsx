import { Box } from "grommet";
import { Slack } from "grommet-icons";
import { ChangeEvent } from "react";

import { Integration } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
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
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  selectedValue: string;
};

export const emailValue = "email";

export default function Alert({
  integration,
  onChange,
  selectedValue,
}: Props): JSX.Element {
  const value = integration?.id || emailValue;

  const a11yTitle = `select ${
    integration ? integration.slack_channel : emailValue
  }`;

  const IconComponent = integration ? Slack : Email;
  const label = integration?.team_name || copy.email;

  const labelHtml = (
    <Box align="center" direction="row" margin={{ left: "xxsmall" }}>
      <IconComponent
        color={integration ? "plain" : colors.gray9}
        size={edgeSize.small}
      />
      <Text color="gray9" margin={{ left: "xxsmall" }} size="component">
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
        checked={value === selectedValue}
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
