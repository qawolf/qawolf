import * as EmailValidator from "email-validator";
import { Box } from "grommet";
import { useContext, useState } from "react";

import { useCreateInvites } from "../../../../hooks/mutations";
import { User } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import Button from "../../../shared/AppButton";
import { StateContext } from "../../../StateContext";
import InviteInput from "./InviteInput";

type Props = { users: User[] };

export default function Invite({ users }: Props): JSX.Element {
  const { teamId } = useContext(StateContext);

  const [emails, setEmails] = useState<string[]>([]);
  const [email, setEmail] = useState("");

  const [createInvites, { loading }] = useCreateInvites();

  const addEmail = (newEmail: string): void => {
    setEmails((prev) => {
      return [...prev, newEmail];
    });
  };

  const removeEmail = (emailToRemove: string): void => {
    setEmails((prev) => {
      const removeIndex = prev.indexOf(emailToRemove);
      const updatedEmails = [...prev];

      if (removeIndex > -1) updatedEmails.splice(removeIndex, 1);

      return updatedEmails;
    });
  };

  const handleClick = (): void => {
    if (!teamId) return;
    // de-duplicate emails, including current input value
    const uniqueEmails = Array.from(new Set([...emails, email]));
    // filter out invalid emails and emails of existing team members
    const userEmails = new Set(users.map((user) => user.email));
    const filteredEmails = uniqueEmails.filter((uniqueEmail) => {
      return (
        EmailValidator.validate(uniqueEmail) && !userEmails.has(uniqueEmail)
      );
    });

    if (!filteredEmails.length) return;

    createInvites({
      variables: { emails: filteredEmails, team_id: teamId },
    }).then((response) => {
      if (!(response || {}).data) return;
      setEmails([]);
      setEmail("");
    });
  };

  const isDisabled = loading || (!emails.length && !email.length);

  return (
    <Box align="center" direction="row">
      <InviteInput
        addEmail={addEmail}
        email={email}
        emails={emails}
        removeEmail={removeEmail}
        setEmail={setEmail}
      />
      <Button
        isDisabled={isDisabled}
        label={copy.sendInvites}
        margin={{ left: "small" }}
        onClick={handleClick}
        type="primary"
      />
    </Box>
  );
}
