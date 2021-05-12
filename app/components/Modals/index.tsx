import { useRouter } from "next/router";
import { useContext } from "react";

import { routes } from "../../lib/routes";
import { state } from "../../lib/state";
import { StateContext } from "../StateContext";
import ConfirmBack from "./ConfirmBack";
import CreateSuite from "./CreateSuite";
import CreateTest from "./CreateTest";
import DeleteTests from "./DeleteTests";
import Environments from "./Environments";
import Tags from "./Tags";
import Triggers from "./Triggers";

export default function Modals(): JSX.Element {
  const { pathname } = useRouter();

  const { modal } = useContext(StateContext);
  const { name, testIds } = modal || {};

  const closeModal = () => state.setModal({ name: null });

  const isTest = pathname.includes(`${routes.test}/`); // include slash to not match dashboard

  const isGetStarted = pathname.includes(routes.getStarted);
  const isSettings = pathname.includes(routes.settings);
  const isSuites = pathname.includes(routes.suites);
  const isTests = pathname.includes(routes.tests);

  const isDashboard = isGetStarted || isSettings || isSuites || isTests;

  if (isTest && name === "confirmBack") {
    return <ConfirmBack closeModal={closeModal} />;
  }

  if (isTests && name === "createSuite" && testIds) {
    return <CreateSuite closeModal={closeModal} testIds={testIds} />;
  }

  if ((isGetStarted || isTests) && name === "createTest") {
    return <CreateTest closeModal={closeModal} />;
  }

  if (isTests && name === "deleteTests" && testIds) {
    return <DeleteTests closeModal={closeModal} testIds={testIds} />;
  }

  if ((isDashboard || isTest) && name === "environments") {
    return <Environments closeModal={closeModal} />;
  }

  if ((isDashboard || isTest) && name === "tags" && testIds) {
    return <Tags closeModal={closeModal} testIds={testIds} />;
  }

  if ((isDashboard || isTest) && name === "triggers") {
    return <Triggers closeModal={closeModal} />;
  }

  return null;
}
