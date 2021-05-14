import { useContext } from "react";

import { routes } from "../../../lib/routes";
import { state } from "../../../lib/state";
import { copy } from "../../../theme/copy";
import Button from "../../shared/AppButton";
import ArrowLeft from "../../shared/icons/ArrowLeft";
import { StateContext } from "../../StateContext";
import { TestContext } from "../contexts/TestContext";

export default function BackButton(): JSX.Element {
  const { dashboardUri } = useContext(StateContext);
  // const { hasChanges } = useContext(TestContext);
  const hasChanges = false; // TODO: update

  const href = hasChanges ? undefined : dashboardUri || routes.tests;

  const handleClick = hasChanges
    ? (): void => state.setModal({ name: "confirmBack" })
    : undefined;

  return (
    <Button
      IconComponent={ArrowLeft}
      a11yTitle={copy.backToDashboard}
      href={href}
      margin={{ right: "xxxsmall" }}
      onClick={handleClick}
      type="ghost"
    />
  );
}
