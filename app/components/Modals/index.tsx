import { useContext } from "react";

import { state } from "../../lib/state";
import { StateContext } from "../StateContext";
import ApiKeys from "./ApiKeys";
import ConfirmDeleteTests from "./ConfirmDeleteTests";
import CreateTest from "./CreateTest";
import Environments from "./Environments";
import TeamSettings from "./TeamSettings";
import Triggers from "./Triggers";

export default function Modals(): JSX.Element {
  const { modal } = useContext(StateContext);
  const { name, teamId, testIds, tests } = modal || {};

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
