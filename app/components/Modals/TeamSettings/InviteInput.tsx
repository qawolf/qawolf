import { Box, Keyboard, TextInput } from "grommet";
import { MailOption } from "grommet-icons";

import { copy } from "../../../theme/copy";
import { edgeSize, fontSize } from "../../../theme/theme";
import Button from "../../shared/Button";
import Email from "./Email";

type Props = {
  addEmail: (email: string) => void;
  email: string;
  emails: string[];
  isLoading: boolean;
  onClick: () => void;
  removeEmail: (email: string) => void;
  setEmail: (email: string) => void;
};

const INPUT_PAD = `calc(${edgeSize.small} + ${edgeSize.xsmall})`;
const MIN_WIDTH = "160px";

export default function InviteInput({
  addEmail,
  email,
  emails,
  isLoading,
  onClick,
  removeEmail,
  setEmail,
}: Props): JSX.Element {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleEnter = () => {
    if (!email.length) return;
    addEmail(email);
    setEmail("");
  };

  const emailsHtml = emails.map((email, i) => {
    return <Email email={email} key={i} removeEmail={removeEmail} />;
  });

  return (
    <>
      <Keyboard onEnter={handleEnter}>
        <Box
          align="center"
          border={{ color: "borderGray" }}
          direction="row"
          margin={{ top: "medium" }}
          pad={{ horizontal: "small" }}
          round="small"
          wrap
        >
          {emailsHtml}
          <Box flex style={{ minWidth: MIN_WIDTH }}>
            <TextInput
              onChange={handleChange}
              placeholder={copy.placeholderInvite}
              plain
              style={{
                fontSize: fontSize.medium,
                fontWeight: "normal",
                padding: `${INPUT_PAD} 0`,
              }}
              value={email}
            />
          </Box>
        </Box>
      </Keyboard>
      <Button
        IconComponent={MailOption}
        disabled={isLoading}
        onClick={onClick}
        margin={{ top: "medium" }}
        message={copy.sendInvites}
      />
    </>
  );
}
