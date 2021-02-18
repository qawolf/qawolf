import { Icon } from "grommet-icons";
import flatten from "lodash/flatten";
import { IconType } from "react-icons";
import {
  RiCodeSSlashFill,
  RiMedalFill,
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
    docs: [
      { href: `${routes.docs}/run-on-schedule`, name: "Run on Schedule" },
      {
        href: `${routes.docs}/run-on-vercel-deployment`,
        name: "Run on Vercel Deployment",
      },
      {
        href: `${routes.docs}/run-on-netlify-deployment`,
        name: "Run on Netlify Deployment",
      },
    ],
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
  {
    IconComponent: RiMedalFill,
    color: "#AA61F2",
    docs: [
      {
        href: `${routes.docs}/reuse-helper-code`,
        name: "Reuse Helper Code",
      },
      {
        href: `${routes.docs}/test-receiving-email`,
        name: "Test Receiving Email",
      },
      {
        href: `${routes.docs}/call-an-api`,
        name: "Call an API",
      },
      {
        href: `${routes.docs}/test-localhost`,
        name: "Test localhost",
      },
    ],
    name: "Advanced",
  },
];

export const flattenedDocs = flatten(docs.map(({ docs }) => docs));
