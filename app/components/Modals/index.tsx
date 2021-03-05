import { useRouter } from "next/router";
import { useContext } from "react";

import { routes } from "../../lib/routes";
import { state } from "../../lib/state";
import { StateContext } from "../StateContext";
import CreateTest from "./CreateTest";
import DeleteGroup from "./DeleteGroup";
import DeleteTests from "./DeleteTests";
import EditTestsGroup from "./EditTestsGroup";
import Environments from "./Environments";
import Triggers from "./Triggers";

export default function Modals(): JSX.Element {
  const { pathname } = useRouter();

  const { modal } = useContext(StateContext);
  const { group, name, testIds, tests } = modal || {};

  const closeModal = () => state.setModal({ name: null });

  const isTest = pathname.includes(`${routes.test}/`); // include slash to not match dashboard

  const isSettings = pathname.includes(routes.settings);
  const isSuites = pathname.includes(routes.suites);
  const isTests = pathname.includes(routes.tests);
  const isDashboard = isSettings || isSuites || isTests;

  if (isTests && name === "createTest") {
    return <CreateTest closeModal={closeModal} />;
  }

  if (isDashboard && name === "deleteGroup" && group) {
    return <DeleteGroup closeModal={closeModal} group={group} />;
  }

  if (isTests && name === "deleteTests" && tests) {
    return <DeleteTests closeModal={closeModal} tests={tests} />;
  }

  if (isTests && name === "editTestsGroup" && tests) {
    return <EditTestsGroup closeModal={closeModal} tests={tests} />;
  }

  if ((isDashboard || isTest) && name === "environments") {
    return <Environments closeModal={closeModal} />;
  }

  if ((isDashboard || isTest) && name === "triggers" && testIds) {
    return <Triggers closeModal={closeModal} testIds={testIds} />;
  }

  return null;
}
