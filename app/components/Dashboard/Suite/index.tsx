import { Box } from "grommet";
import { useContext, useState } from "react";

import { useSuite } from "../../../hooks/queries";
import { RunStatus } from "../../../lib/types";
import Spinner from "../../shared-new/Spinner";
import { StateContext } from "../../StateContext";
import Header from "./Header";

type Props = { suiteId: string };

export default function Suite({ suiteId }: Props): JSX.Element {
  const { teamId } = useContext(StateContext);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<RunStatus | null>(null);

  const { data } = useSuite({ id: suiteId }, { includeRuns: true, teamId });
  const suite = data?.suite;

  const innerHtml = suite ? (
    <>
      <Header
        search={search}
        setSearch={setSearch}
        setStatus={setStatus}
        status={status}
        suite={suite}
      />
    </>
  ) : (
    <Spinner />
  );

  return (
    <Box
      pad={{ bottom: "medium", horizontal: "medium", top: "large" }}
      width="full"
    >
      {innerHtml}
    </Box>
  );
}
