import { Box } from "grommet";
import { useRouter } from "next/router";

import { useCreateSuite } from "../../../../hooks/mutations";
import { routes } from "../../../../lib/routes";
import { Trigger } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { edgeSize } from "../../../../theme/theme";
import PlayButton from "../../../shared/PlayButton";
import TriggerName from "./TriggerName";

type Props = {
  selectedIds: string[];
  trigger: Trigger;
};

export default function Header({ selectedIds, trigger }: Props): JSX.Element {
  const { replace } = useRouter();
  const [createSuite, { loading }] = useCreateSuite();

  const handleClick = () => {
    createSuite({
      variables: { test_ids: selectedIds, trigger_id: trigger.id },
    }).then((response) => {
      const { data } = response || {};
      if (!data?.createSuite) return;

      replace(`${routes.tests}/${data.createSuite}`);
    });
  };

  return (
    <Box
      align="center"
      direction="row"
      flex={false}
      height={edgeSize.large}
      justify="between"
    >
      <Box align="center" direction="row">
        <TriggerName trigger={trigger} />
      </Box>
      <PlayButton
        disabled={loading}
        message={copy.runGroup(selectedIds.length)}
        onClick={handleClick}
      />
    </Box>
  );
}
