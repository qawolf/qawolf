import { useContext } from "react";

import { state } from "../../lib/state";
import { StateContext } from "../StateContext";
import ApiKeys from "./ApiKeys";
import ConfirmDeleteTests from "./ConfirmDeleteTests";
import ConfirmDeleteTrigger from "./ConfirmDeleteTrigger";
import CreateTest from "./CreateTest";
import Deployment from "./Deployment";
import Environments from "./Environments";
import TeamSettings from "./TeamSettings";
import Triggers from "./Triggers";

export default function Modals(): JSX.Element {
  const { modal } = useContext(StateContext);
  const { integration, name, teamId, tests, trigger } = modal || {};

  const closeModal = () => state.setModal({ name: null });

  if (name === "apiKeys") {
    return <ApiKeys closeModal={closeModal} />;
  }

  if (name === "createTest") {
    return <CreateTest closeModal={closeModal} />;
  }

  if (name === "deleteTest" && tests) {
    return <ConfirmDeleteTests closeModal={closeModal} tests={tests} />;
  }

  if (name === "deleteTrigger" && trigger) {
    return <ConfirmDeleteTrigger closeModal={closeModal} trigger={trigger} />;
  }

  if (name === "deployment" && integration && trigger) {
    return (
      <Deployment
        closeModal={closeModal}
        integration={integration}
        trigger={trigger}
      />
    );
  }

  if (name === "environments") {
    return <Environments closeModal={closeModal} />;
  }

  if (name === "teamSettings" && teamId) {
    return <TeamSettings closeModal={closeModal} teamId={teamId} />;
  }

  if (name === "triggers") {
    return <Triggers closeModal={closeModal} />;
  }

  return null;
}
