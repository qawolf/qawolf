import { routes } from "../../lib/routes";
import { copy } from "../../theme/copy";
import ProductSection from "./ProductSection";

const valueProps = [
  { detail: copy.zeroSetupDetail, message: copy.zeroSetup },
  { detail: copy.skipBoilerplateDetail, message: copy.skipBoilerplate },
  { detail: copy.codeLoveDetail, message: copy.codeLove },
];

export default function Create(): JSX.Element {
  return (
    <ProductSection
      detail={copy.createTagline}
      href={routes.signUp}
      label={copy.createFirstTest}
      message={copy.create}
      valueProps={valueProps}
      videoSrc="/create_test.mp4"
    />
  );
}
