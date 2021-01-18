import { Icon } from "grommet-icons";
import flatten from "lodash/flatten";
import { IconType } from "react-icons";
import {
  RiCodeSSlashFill,
  RiNotification2Fill,
  RiRocketFill,
} from "react-icons/ri";

import { routes } from "../../lib/routes";
import Paw from "../shared-new/icons/Paw";

export type Doc = {
  href: string;
  name: string;
};

export type Section = {
  IconComponent: Icon | IconType;
  color: string;
  docs: Doc[];
  name: string;
};

export const docs: Section[] = [
  {
    IconComponent: Paw,
    color: "primaryFill",
    name: "Overview",
    docs: [
      { href: `${routes.docs}/what-is-qa-wolf`, name: "What is QA Wolf?" },
      { href: `${routes.docs}/community`, name: "Community" },
    ],
  },
  {
    IconComponent: RiCodeSSlashFill,
    color: "#77D9C8",
    docs: [
      { href: `${routes.docs}/create-a-test`, name: "Create a Test" },
      {
        href: `${routes.docs}/convert-actions-to-code`,
        name: "Convert Actions to Code",
      },
      {
        href: `${routes.docs}/use-environment-variables`,
        name: "Use Environment Variables",
      },
      { href: `${routes.docs}/add-an-assertion`, name: "Add an Assertion" },
    ],
    name: "Create Tests",
  },
  {
    IconComponent: RiRocketFill,
    color: "#F2D479",
    docs: [{ href: `${routes.docs}/schedule-tests`, name: "Schedule Tests" }],
    name: "Run Tests",
  },
  {
    IconComponent: RiNotification2Fill,
    color: "#F26185",
    docs: [
      {
        href: `${routes.docs}/send-slack-alerts`,
        name: "Send Slack Alerts",
      },
      {
        href: `${routes.docs}/send-email-alerts`,
        name: "Send Email Alerts",
      },
    ],
    name: "Alert Your Team",
  },
];

export const flattenedDocs = flatten(docs.map(({ docs }) => docs));
