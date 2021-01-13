import { Box, TextInput } from "grommet";
import { Search } from "grommet-icons";
import { Dispatch, SetStateAction, useRef } from "react";

import { copy } from "../../../../theme/copy";
import { colors, edgeSize, fontSize, iconSize } from "../../../../theme/theme";

type Props = {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
};

const WIDTH = "256px";

export default function SearchInput({ search, setSearch }: Props): JSX.Element {
  const ref = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleClick = () => {
    if (!ref.current) return;
    ref.current.focus();
  };

  return (
    <Box
      align="center"
      background="white"
      border={{ color: "borderGray" }}
      direction="row"
      onClick={handleClick}
      pad="small"
      round="small"
      style={{ cursor: "text" }}
      width={WIDTH}
    >
      <TextInput
        onChange={handleChange}
        placeholder={copy.searchTests}
        plain
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={ref as any}
        style={{
          fontSize: fontSize.medium,
          fontWeight: "normal",
          padding: edgeSize.xsmall,
        }}
        value={search}
      />
      <Box background="fadedBlue" flex={false} pad="small" round="xsmall">
        <Search color={colors.white} size={iconSize} />
      </Box>
    </Box>
  );
}
