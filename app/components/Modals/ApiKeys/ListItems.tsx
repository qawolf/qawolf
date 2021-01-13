import { Box } from "grommet";

import { timeToText } from "../../../lib/helpers";
import { ApiKey } from "../../../lib/types";
import { overflowStyle } from "../../../theme/theme";
import Text from "../../shared/Text";
import DeleteApiKey from "./DeleteApiKey";

type Props = { apiKeys: ApiKey[] };

export const BASIS = "22%"; // a little less than 1/4 to leave space for delete button

const boxProps = { basis: BASIS, flex: false };
const textProps = { color: "black", size: "medium" };

export default function ListItems({ apiKeys }: Props): JSX.Element {
  const itemsHtml = apiKeys.map((apiKey) => {
    const created = timeToText(apiKey.created_at);
    const lastUsed = apiKey.last_used_at
      ? timeToText(apiKey.last_used_at)
      : "-";

    return (
      <Box
        align="center"
        direction="row"
        fill="horizontal"
        flex={false}
        key={apiKey.id}
        margin={{ top: "small" }}
      >
        <Box {...boxProps}>
          <Text {...textProps} style={overflowStyle}>
            {apiKey.name}
          </Text>
        </Box>
        <Box {...boxProps}>
          <Text {...textProps} isCode size="small">
            {`qawolf_...${apiKey.token_end}`}
          </Text>
        </Box>
        <Box {...boxProps}>
          <Text {...textProps}>{lastUsed}</Text>
        </Box>
        <Box {...boxProps}>
          <Text {...textProps}>{created}</Text>
        </Box>
        <Box align="end" fill="horizontal">
          <DeleteApiKey apiKeyId={apiKey.id} />
        </Box>
      </Box>
    );
  });

  return <Box overflow="auto">{itemsHtml}</Box>;
}
