import { useContext, useState } from "react";

import { useCreateInvites } from "../../../../hooks/mutations";
import { StateContext } from "../../../StateContext";
import InviteInput from "./InviteInput";

export default function Invite(): JSX.Element {
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

  return (
    <InviteInput
      addEmail={addEmail}
      email={email}
      emails={emails}
      removeEmail={removeEmail}
      setEmail={setEmail}
    />
  );
}
