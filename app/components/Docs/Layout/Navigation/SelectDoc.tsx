import { Box } from "grommet";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { RiArrowDownSLine } from "react-icons/ri";
import styled from "styled-components";

import { colors, edgeSize, text, width } from "../../../../theme/theme";
import Text from "../../../shared/Text";
import { docs, flattenedDocs } from "../../docs";

const StyledDiv = styled.div`
  @media screen and (min-width: ${width.content}) {
    display: none;
  }
`;

const StyledLabel = styled.label`
  position: absolute;
  right: ${edgeSize.medium};
  top: calc(50% - ${text.xxsmall.height} / 2);
`;

const StyledSelect = styled.select`
  font-size: 16px; // prevents zoom on mobile
  opacity: 0;
`;

const id = "select-doc";

export default function SelectDoc(): JSX.Element {
  const { pathname, push } = useRouter();

  const labelRef = useRef<HTMLLabelElement>(null);
  const [width, setWidth] = useState<number | undefined>(undefined);

  // use label width to style select tag
  useEffect(() => {
    if (labelRef.current) {
      setWidth(labelRef.current.clientWidth);
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    push(e.target.value);
  };

  const selectedDoc = flattenedDocs.find(({ href }) => href === pathname);
  const label = selectedDoc?.name || "";

  const optGroupsHtml = docs.map((doc, i) => {
    const optionsHtml = doc.docs.map(({ href, name }) => {
      return (
        <option key={href} value={href}>
          {name}
        </option>
      );
    });

    return (
      <optgroup key={i} label={doc.name}>
        {optionsHtml}
      </optgroup>
    );
  });

  return (
    <StyledDiv>
      <StyledLabel htmlFor={id} ref={labelRef}>
        <Box align="center" direction="row">
          <Text
            color="textDark"
            margin={{ right: edgeSize.xxxsmall }}
            size="xxsmall"
            weight="medium"
          >
            {label}
          </Text>
          <RiArrowDownSLine color={colors.textDark} size={edgeSize.small} />
        </Box>
      </StyledLabel>
      <StyledSelect
        id={id}
        onChange={handleChange}
        // ensure width is not 0
        style={{ height: text.xxsmall.height, width: width || undefined }}
        value={pathname}
      >
        {optGroupsHtml}
      </StyledSelect>
    </StyledDiv>
  );
}
