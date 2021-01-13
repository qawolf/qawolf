import { routes } from "../../lib/routes";
import { copy } from "../../theme/copy";
import ProductSection from "./ProductSection";

const valueProps = [
  { detail: copy.easyCiDetail, message: copy.easyCi },
  { detail: copy.easyDebugDetail, message: copy.easyDebug },
  { detail: copy.alertTeamDetail, message: copy.alertTeam },
];

export default function Run(): JSX.Element {
  return (
    <ProductSection
      detail={copy.runTagline}
      href={routes.docs}
      isSecondary
      label={copy.readDocs}
      message={copy.run}
      valueProps={valueProps}
      videoSrc="/run_test.mp4"
    />
  );
}
