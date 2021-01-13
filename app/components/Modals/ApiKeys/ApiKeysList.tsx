import { Box } from "grommet";

import { ApiKey } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import TableHeader from "../../shared/TableHeader";
import Text from "../../shared/Text";
import ListItems, { BASIS } from "./ListItems";

type Props = { apiKeys: ApiKey[] | null };

const LABELS = [copy.name, copy.key, copy.lastUsed, copy.created];

export default function ApiKeysList({ apiKeys }: Props): JSX.Element {
  const innerHtml = !apiKeys?.length ? (
    <Text color="black" size="medium" weight="bold">
      {!apiKeys ? copy.loading : copy.apiKeysEmpty}
    </Text>
  ) : (
    <Box fill="horizontal">
      <TableHeader basis={BASIS} labels={LABELS} />
      <ListItems apiKeys={apiKeys} />
    </Box>
  );

  return (
    <Box align="center" margin={{ vertical: "large" }}>
      {innerHtml}
    </Box>
  );
}
