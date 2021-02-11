import { RadioButtonGroup } from "grommet";
import { ChangeEvent } from "react";

import { copy } from "../../../../theme/copy";
import Text from "../../../shared-new/Text";

import { labelTextProps, repeatMinutesOptions } from "../helpers";

type Props = {
  repeatMinutes: number;
  setRepeatMinutes: (repeatMinutes: number) => void;
};

export default function ScheduleFields({
  repeatMinutes,
  setRepeatMinutes,
}: Props): JSX.Element {
  const handleScheduleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setRepeatMinutes(Number(e.target.value));
  };

  return (
    <>
      <Text {...labelTextProps} margin={{ bottom: "small", top: "medium" }}>
        {copy.frequency}
      </Text>
      <RadioButtonGroup
        direction="row"
        gap="medium"
        name="schedule"
        onChange={handleScheduleChange}
        options={repeatMinutesOptions}
        value={repeatMinutes}
      />
    </>
  );
}
