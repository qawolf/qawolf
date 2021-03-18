import { useContext } from "react";

import { routes } from "../../../lib/routes";
import { copy } from "../../../theme/copy";
import Button from "../../shared/AppButton";
import ArrowLeft from "../../shared/icons/ArrowLeft";
import { StateContext } from "../../StateContext";

export default function BackButton(): JSX.Element {
  const { dashboardUri } = useContext(StateContext);

  return (
    <Button
      IconComponent={ArrowLeft}
      a11yTitle={copy.backToDashboard}
      href={dashboardUri || routes.tests}
      margin={{ right: "xxxsmall" }}
      type="ghost"
    />
  );
}
