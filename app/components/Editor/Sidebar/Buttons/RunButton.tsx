import { Selection } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import Button from "../../../shared/AppButton";
import Edit from "../../../shared/icons/Edit";
import Play from "../../../shared/icons/Play";

type Props = {
  className?: string;
  isDisabled: boolean;
  isRun: boolean;
  isRunLoading: boolean;
  onAction: () => void;
  width: string;
  selection: Selection;
};

export default function RunButton({
  className,
  isDisabled,
  isRun,
  isRunLoading,
  onAction,
  selection,
  width,
}: Props): JSX.Element {
  const testLabel = selection
    ? copy.runLines(selection.endLine - selection.startLine + 1)
    : copy.runTest;
  const runLabel = isRunLoading ? copy.loading : copy.editTest;

  return (
    <Button
      IconComponent={isRun ? Edit : Play}
      className={className}
      isDisabled={isDisabled}
      justify="center"
      label={isRun ? runLabel : testLabel}
      onClick={onAction}
      type={isRun ? "dark" : "primary"}
      width={isRun ? "100%" : width}
    />
  );
}
