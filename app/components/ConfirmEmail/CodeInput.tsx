import { Box } from "grommet";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { breakpoints, edgeSize } from "../../theme/theme-new";

import CodeSegment from "./CodeSegment";
import Separator from "./Separator";

type Props = {
  error?: string;
  onSubmit: (code: string) => void;
};

const DEFAULT_STATE = new Array(6).fill("");

const StyledBox = styled(Box)`
  flex-direction: column;

  @media screen and (min-width: ${breakpoints.small.value}px) {
    flex-direction: row;
  }
`;

const StyledCodeSegment = styled(CodeSegment)`
  margin-top: ${edgeSize.xsmall};

  @media screen and (min-width: ${breakpoints.small.value}px) {
    margin-top: 0;
  }
`;

export default function CodeInput({ error, onSubmit }: Props): JSX.Element {
  const [code, setCode] = useState(DEFAULT_STATE);
  const submittedCodeRef = useRef(DEFAULT_STATE.join(""));

  // submit code if all letters filled in
  // we need to check against the ref because onSubmit changes
  // after submitting, which causes a double submit otherwise
  useEffect(() => {
    const loginCode = code.join("");
    if (code.some((char) => !char) || loginCode === submittedCodeRef.current)
      return;

    submittedCodeRef.current = loginCode;
    onSubmit(loginCode);
  }, [code, onSubmit]);

  // clear current code if invalid code entered
  useEffect(() => {
    if (!error || !error.includes("try again")) return;

    setCode(DEFAULT_STATE);
    submittedCodeRef.current = DEFAULT_STATE.join("");
    // focus first letter input
    document.getElementById("0-code")?.focus();
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const index = Number(e.target.id[0]);
    const char = e.target.value.toUpperCase();

    setCode((prev) => {
      const newCode = Array.from(prev);
      newCode[index] = char;

      return newCode;
    });

    // move to next input if a letter just entered
    if (char && index < 5) {
      const nextInput = document.getElementById(`${index + 1}-code`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleDelete = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key !== "Backspace" || !document.activeElement) return;
    e.preventDefault(); // do not bubble this event to handleChange

    const index = Number(document.activeElement.id[0]);
    const char = (document.activeElement as HTMLInputElement).value;
    // clear current letter if possible
    if (char) {
      setCode((prev) => {
        const newCode = Array.from(prev);
        newCode[index] = "";

        return newCode;
      });
      // otherwise current input is empty, so we move to the
      // previous input if possible and clear its letter
    } else if (index > 0) {
      const prevInput = document.getElementById(`${index - 1}-code`);
      if (prevInput) prevInput.focus();

      setCode((prev) => {
        const newCode = Array.from(prev);
        newCode[index - 1] = "";

        return newCode;
      });
    }
  };
  // fill in the code on a paste event
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
    const chars = e.clipboardData.getData("Text").replace("-", "");

    setCode((prev) => {
      const newCode = Array.from(prev);
      newCode.forEach((_, index) => {
        newCode[index] = chars[index] || "";
      });

      return newCode;
    });
  };

  return (
    <StyledBox
      align="center"
      margin={{ top: "large" }}
      onKeyDown={handleDelete}
    >
      <CodeSegment
        code={code}
        onChange={handleChange}
        onPaste={handlePaste}
        startIndex={0}
      />
      <Separator />
      <StyledCodeSegment
        code={code}
        onChange={handleChange}
        onPaste={handlePaste}
        startIndex={3}
      />
    </StyledBox>
  );
}
