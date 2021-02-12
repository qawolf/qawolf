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

const noModalRoutes = [routes.gitHubIntegration];

export default function Modals(): JSX.Element {
  const { asPath } = useRouter();

  const { modal } = useContext(StateContext);
  const { name, teamId, testIds, tests } = modal || {};

  const closeModal = () => state.setModal({ name: null });

  if (noModalRoutes.some((r) => asPath.includes(r))) {
    return null;
  }

  if (name === "createTest") {
    return <CreateTest closeModal={closeModal} />;
  }

  if (name === "deleteTest" && tests) {
    return <ConfirmDeleteTests closeModal={closeModal} tests={tests} />;
  }

  if (name === "environments") {
    return <Environments closeModal={closeModal} />;
  }

  if (name === "teamSettings" && teamId) {
    return <TeamSettings closeModal={closeModal} teamId={teamId} />;
  }

  if (name === "triggers" && testIds) {
    return <Triggers closeModal={closeModal} testIds={testIds} />;
  }

  return null;
}
