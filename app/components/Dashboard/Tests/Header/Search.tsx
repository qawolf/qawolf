import { Box } from "grommet";
import { ChangeEvent, useRef } from "react";

import { useOnHotKey } from "../../../../hooks/onHotKey";
import { copy } from "../../../../theme/copy";
import { borderSize, colors, edgeSize } from "../../../../theme/theme-new";
import TextInput from "../../../shared-new/AppTextInput";
import SearchIcon from "../../../shared-new/icons/Search";
import Text from "../../../shared-new/Text";

type Props = {
  search: string;
  setSearch: (search: string) => void;
};

export default function Search({ search, setSearch }: Props): JSX.Element {
  const ref = useRef<HTMLInputElement>(null);

  const handleHotKey = (e: KeyboardEvent): void => {
    e.preventDefault();
    ref?.current.focus();
  };

  // if we type a slash in an input, we don't want that to focus search
  useOnHotKey({ hotKey: "/", ignoreInput: true, onHotKey: handleHotKey });

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearch(e.target.value);
  };

  return (
    <Box style={{ position: "relative" }}>
      <SearchIcon
        color={colors.gray5}
        size={edgeSize.small}
        style={{
          left: edgeSize.xxsmall,
          position: "absolute",
          top: edgeSize.xxsmall,
        }}
      />
      <TextInput
        onChange={handleChange}
        pad={{ left: edgeSize.large, right: edgeSize.xlarge }}
        placeholder={copy.search}
        ref={ref}
        value={search}
      />
      <Box
        align="center"
        background="gray1"
        border={{ color: "gray3", size: borderSize.xsmall }}
        height={edgeSize.medium}
        justify="center"
        round={borderSize.small}
        style={{
          position: "absolute",
          right: edgeSize.xxxsmall,
          top: edgeSize.xxxsmall,
        }}
        width={edgeSize.medium}
      >
        <Text color="gray5" size="component">
          /
        </Text>
      </Box>
    </Box>
  );
}
