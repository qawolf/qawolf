import { Box } from "grommet";
import { ChangeEvent, useState } from "react";

import { labelTextProps } from "../../components/Modals/Triggers/helpers";
import TextInput from "../../components/shared/AppTextInput";
import CheckBox from "../../components/shared/CheckBox";
import Header from "../../components/shared/playground/Header";
import RadioButtonGroup from "../../components/shared/RadioButtonGroup";
import Text from "../../components/shared/Text";
import { edgeSize } from "../../theme/theme";

export default function FormInputs(): JSX.Element {
  const [isBarkChecked, setIsBarkChecked] = useState(false);
  const [isHowlChecked, setIsHowlChecked] = useState(true);

  const [wolfName, setWolfName] = useState("");
  const [wolfType, setWolfType] = useState("");

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setWolfName(e.target.value);
  };

  const handleTypeChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setWolfType(e.target.value);
  };

  return (
    <Box align="center">
      <Header label="Wolf survey" />
      <Box align="start">
        <Text
          {...labelTextProps}
          margin={{ ...labelTextProps.margin, top: "0" }}
        >
          Name
        </Text>
        <TextInput
          onChange={handleNameChange}
          placeholder="Wolf name"
          value={wolfName}
          width="full"
        />
        <Text {...labelTextProps}>Type</Text>
        <RadioButtonGroup
          direction="row"
          gap={edgeSize.small}
          name="wolf-type"
          onChange={handleTypeChange}
          options={[
            { label: "Arctic", value: "arctic" },
            { label: "Gray", value: "gray" },
            { label: "Red", value: "red" },
          ]}
          value={wolfType}
        />
        <Text {...labelTextProps}>Coat pattern</Text>
        <select
          id="pattern"
          name="wolf-coat-pattern"
          style={{ height: edgeSize.large, width: "100%" }}
        >
          <option disabled value="">
            Choose coat pattern
          </option>
          <option value="patches">Patches</option>
          <option value="solid">Solid</option>
          <option value="spots">Spots</option>
        </select>
        <Text {...labelTextProps}>Skills</Text>
        <CheckBox
          checked={isHowlChecked}
          id="howl"
          label={
            <Text color="gray9" size="component">
              Howling
            </Text>
          }
          onClick={() => setIsHowlChecked((prev) => !prev)}
        />
        <Box height={edgeSize.small} />
        <CheckBox
          checked={isBarkChecked}
          id="bark"
          label={
            <Text color="gray9" size="component">
              Barking
            </Text>
          }
          onClick={() => setIsBarkChecked((prev) => !prev)}
        />
      </Box>
    </Box>
  );
}
