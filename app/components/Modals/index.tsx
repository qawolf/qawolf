import { useRouter } from "next/router";
import { useContext } from "react";

import { routes } from "../../lib/routes";
import { state } from "../../lib/state";
import { StateContext } from "../StateContext";
import ConfirmDeleteTests from "./ConfirmDeleteTests";
import CreateTest from "./CreateTest";
import Environments from "./Environments";
import TeamSettings from "./TeamSettings";
import Triggers from "./Triggers";

export default function Modals(): JSX.Element {
  const { asPath } = useRouter();

  const { modal } = useContext(StateContext);
  const { name, teamId, testIds, tests } = modal || {};

  const closeModal = () => state.setModal({ name: null });

  const isDashboard = asPath.includes(routes.tests);
  const isTest = asPath.includes(`${routes.test}/`); // include slash to not match dashboard

  if (isDashboard && name === "createTest") {
    return <CreateTest closeModal={closeModal} />;
  }

  if (isDashboard && name === "deleteTest" && tests) {
    return <ConfirmDeleteTests closeModal={closeModal} tests={tests} />;
  }

  if ((isDashboard || isTest) && name === "environments") {
    return <Environments closeModal={closeModal} />;
  }

  if (isDashboard && name === "teamSettings" && teamId) {
    return <TeamSettings closeModal={closeModal} teamId={teamId} />;
  }

  if ((isDashboard || isTest) && name === "triggers" && testIds) {
    return <Triggers closeModal={closeModal} testIds={testIds} />;
  }

  return null;
}
