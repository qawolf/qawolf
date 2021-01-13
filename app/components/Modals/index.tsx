import { useContext } from "react";

import { state } from "../../lib/state";
import { StateContext } from "../StateContext";
import ApiKeys from "./ApiKeys";
import ConfirmDeleteGroup from "./ConfirmDeleteGroup";
import ConfirmDeleteTests from "./ConfirmDeleteTests";
import Deployment from "./Deployment";
import EnvVariables from "./EnvVariables";
import TeamSettings from "./TeamSettings";

export default function Modals(): JSX.Element {
  const { modal } = useContext(StateContext);
  const { group, integration, name, teamId, tests } = modal || {};

  const closeModal = () => state.setModal({ name: null });

  if (name === "apiKeys") {
    return <ApiKeys closeModal={closeModal} />;
  }

  if (name === "deleteGroup" && group) {
    return <ConfirmDeleteGroup closeModal={closeModal} group={group} />;
  }

  if (name === "deleteTest" && tests) {
    return <ConfirmDeleteTests closeModal={closeModal} tests={tests} />;
  }

  if (name === "deployment" && group && integration) {
    return (
      <Deployment
        closeModal={closeModal}
        group={group}
        integration={integration}
      />
    );
  }

  if (name === "envVariables" && group) {
    return <EnvVariables closeModal={closeModal} group={group} />;
  }

  if (name === "teamSettings" && teamId) {
    return <TeamSettings closeModal={closeModal} teamId={teamId} />;
  }

  return null;
}
