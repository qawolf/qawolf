import { Context } from "@apollo/client";
import axios from "axios";
import * as EmailValidator from "email-validator";

import environment from "../environment";
import { JoinMailingListMutation } from "../types";

const mailingListId = "1249c998-7038-4577-9d7e-94b0398f1c99";

export const joinMailingListResolver = async (
  _: Record<string, unknown>,
  { email }: JoinMailingListMutation,
  { logger }: Context
): Promise<boolean> => {
  const log = logger.prefix("joinMailingListResolver");

  try {
    if (!EmailValidator.validate(email)) {
      return false;
    }

    await axios.put(
      "https://api.sendgrid.com/v3/marketing/contacts",
      { contacts: [{ email }], list_ids: [mailingListId] },
      {
        headers: {
          authorization: `Bearer ${environment.SENDGRID_API_KEY}`,
          "content-type": "application/json",
        },
      }
    );

    return true;
  } catch (error) {
    log.alert("error", error.message);
    return false;
  }
};
