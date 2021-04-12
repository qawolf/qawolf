import isNil from "lodash/isNil";
import { useContext } from "react";

import { useRunCount } from "../../../../hooks/queries";
import { StateContext } from "../../../StateContext";

export default function Usage(): JSX.Element {
  const { teamId } = useContext(StateContext);

  const { data } = useRunCount({ team_id: teamId });
  const runCount = isNil(data?.runCount) ? null : data.runCount;

  return null;
}
