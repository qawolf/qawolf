import { Box } from "grommet";

import { copy } from "../../../../theme/copy";
import Button from "../../../shared/AppButton";
import Share from "../../../shared/icons/Share";
import Text from "../../../shared/Text";
import {
  buttonLabels,
  completeButtonLabels,
  containerProps,
  details,
  docsHref,
  Section as SectionType,
} from "../helpers";
import Header from "./Header";

type Props = {
  buttonHref?: string;
  isComplete: boolean;
  isDisabled?: boolean;
  isOpen: boolean;
  onButtonClick?: () => void;
  onToggleOpen: (section: SectionType) => void;
  section: SectionType;
};

export default function Section({
  buttonHref,
  isComplete,
  isDisabled,
  isOpen,
  onButtonClick,
  onToggleOpen,
  section,
}: Props): JSX.Element {
  const buttonLabel =
    (isComplete && completeButtonLabels[section]) || buttonLabels[section];

  return (
    <Box {...containerProps}>
      <Header
        isComplete={isComplete}
        isOpen={isOpen}
        onClick={onToggleOpen}
        section={section}
      />
      {isOpen && (
        <Box pad={{ bottom: "medium", horizontal: "medium" }}>
          <Text color="gray9" size="componentParagraph">
            {details[section]}
          </Text>
          <Box align="center" direction="row" margin={{ top: "medium" }}>
            <Button
              href={buttonHref}
              isDisabled={isDisabled}
              label={buttonLabel}
              margin={{ right: "small" }}
              onClick={onButtonClick}
              type={isComplete ? "secondary" : "primary"}
            />
            <Button
              IconComponent={Share}
              href={docsHref[section]}
              iconPosition="right"
              label={copy.learnMore}
              openNewPage
              type="ghost"
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
