import { Box } from "grommet";
import { ChangeEvent, useEffect, useRef, useState } from "react";

import { copy } from "../../../../theme/copy";
import { edgeSize } from "../../../../theme/theme-new";
import Button from "../../../shared-new/AppButton";
import TextInput from "../../../shared-new/AppTextInput";
import Text from "../../../shared-new/Text";
import { labelTextProps } from "../helpers";

type Props = {
  deployBranches: string | null;
  setDeployBranches: (branches: string | null) => void;
};

const buttonWidth = "78px";

const branchButtonProps = {
  justify: "center" as const,
  margin: { right: "xxsmall" },
  type: "secondary" as const,
  width: buttonWidth,
};

export default function DeployBranches({
  deployBranches,
  setDeployBranches,
}: Props): JSX.Element {
  const ref = useRef<HTMLInputElement>(null);

  const [isAllBranches, setIsAllBranches] = useState(!!deployBranches);

  // clear select branches if needed
  useEffect(() => {
    if (isAllBranches && deployBranches) setDeployBranches(null);
  }, [deployBranches, isAllBranches, setDeployBranches]);

  const handleDeployBranchesChange = (
    e: ChangeEvent<HTMLInputElement>
  ): void => {
    setDeployBranches(e.target.value);
  };

  const handleSelectClick = (): void => {
    setIsAllBranches(false);
    // wait for input to stop being disabled then focus it
    setTimeout(() => ref.current?.focus(), 100);
  };

  return (
    <>
      <Text {...labelTextProps}>{copy.gitHubBranches}</Text>
      <Box align="center" direction="row">
        <Button
          {...branchButtonProps}
          isSelected={isAllBranches}
          label={copy.all}
          onClick={() => setIsAllBranches(true)}
        />
        <Button
          {...branchButtonProps}
          isSelected={!isAllBranches}
          label={copy.select}
          onClick={handleSelectClick}
        />
        <TextInput
          isDisabled={isAllBranches}
          onChange={handleDeployBranchesChange}
          placeholder={copy.branchesPlaceholder}
          ref={ref}
          value={deployBranches || ""}
          width={`calc(100% - 2 * (${buttonWidth} + ${edgeSize.xxsmall}))`}
        />
      </Box>
    </>
  );
}
