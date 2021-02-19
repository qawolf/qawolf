import { Box } from "grommet";
import { ChangeEvent, useRef } from "react";
import { copy } from "../../../../theme/copy";
import { borderSize, colors, edgeSize } from "../../../../theme/theme-new";
import Text from "../../../shared-new/Text";
import TextInput from "../../../shared-new/AppTextInput";
import SearchIcon from "../../../shared-new/icons/Search";
import { useOnHotKey } from "../../../../hooks/onHotKey";

type Props = {
  search: string;
  setSearch: (search: string) => void;
};

const width = "240px";

export default function Search({ search, setSearch }: Props): JSX.Element {
  const ref = useRef<HTMLInputElement>(null);

  const handleHotKey = (e: KeyboardEvent): void => {
    // do not use shortcut if already typing in input
    if (document.activeElement === ref.current) return;

    e.preventDefault();
    ref?.current.focus();
  };

  useOnHotKey({ hotKey: "/", onHotKey: handleHotKey });

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
        width={width}
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
          right: edgeSize.xxsmall,
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
