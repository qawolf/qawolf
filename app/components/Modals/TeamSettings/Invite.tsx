import * as EmailValidator from "email-validator";
import { useContext, useState } from "react";

import { useCreateInvites } from "../../../hooks/mutations";
import { User } from "../../../lib/types";
import { StateContext } from "../../StateContext";
import InviteInput from "./InviteInput";

type Props = { users: User[] };

export default function Invite({ users }: Props): JSX.Element {
  const { teamId } = useContext(StateContext);

  const [emails, setEmails] = useState<string[]>([]);
  const [email, setEmail] = useState("");

  const [createInvites, { loading }] = useCreateInvites();

  const addEmail = (newEmail: string) => {
    setEmails((prev) => {
      return [...prev, newEmail];
    });
  };

  const removeEmail = (removeEmail: string) => {
    setEmails((prev) => {
      const removeIndex = prev.indexOf(removeEmail);
      const newEmails = [...prev];

      if (removeIndex >= 0) {
        newEmails.splice(removeIndex, 1);
      }

      return newEmails;
    });
  };

  const handleClick = () => {
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

  return (
    <InviteInput
      addEmail={addEmail}
      email={email}
      emails={emails}
      isLoading={loading}
      onClick={handleClick}
      removeEmail={removeEmail}
      setEmail={setEmail}
    />
  );
}
