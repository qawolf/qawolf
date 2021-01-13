import { Box } from "grommet";

import { timeToText } from "../../../lib/helpers";
import { EnvironmentVariable } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { overflowStyle } from "../../../theme/theme";
import Text from "../../shared/Text";
import DeleteEnvVariable from "./DeleteEnvVariable";

type Props = { environmentVariables: EnvironmentVariable[] };

export const BASIS = "30%"; // a little less than 1/4 to leave space for delete button

const boxProps = { basis: BASIS, flex: false };
const textProps = { color: "black", size: "medium" };

export default function ListItems({
  environmentVariables,
}: Props): JSX.Element {
  const itemsHtml = environmentVariables.map((variable) => {
    const created = timeToText(variable.created_at);

    return (
      <Box
        align="center"
        direction="row"
        fill="horizontal"
        flex={false}
        key={variable.id}
        margin={{ top: "small" }}
      >
        <Box {...boxProps}>
          <Text {...textProps} style={overflowStyle}>
            {variable.name}
          </Text>
        </Box>
        <Box {...boxProps}>
          <Text {...textProps} style={{ fontStyle: "italic" }}>
            {copy.encrypted}
          </Text>
        </Box>
        <Box {...boxProps}>
          <Text {...textProps}>{created}</Text>
        </Box>
        <Box align="end" fill="horizontal">
          <DeleteEnvVariable environmentVariableId={variable.id} />
        </Box>
      </Box>
    );
  });

  return <Box overflow="auto">{itemsHtml}</Box>;
}
