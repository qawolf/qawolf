import { Icon } from "grommet-icons";
import flatten from "lodash/flatten";
import { IconType } from "react-icons";
import { IoTrailSign } from "react-icons/io5";
import { RiPlugFill, RiRocketFill } from "react-icons/ri";

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
      { href: `${routes.docs}/why-qa-wolf`, name: "Why QA Wolf?" },
      {
        href: `${routes.docs}/your-testing-strategy`,
        name: "Your Testing Strategy",
      },
    ],
  },
  {
    IconComponent: RiRocketFill,
    color: "#C54BDE",
    docs: [
      { href: `${routes.docs}/create-a-test`, name: "Create a Test" },
      {
        href: `${routes.docs}/convert-actions-to-code`,
        name: "Convert Actions to Code",
      },

      {
        href: `${routes.docs}/run-tests-on-a-schedule`,
        name: "Run Tests on a Schedule",
      },
      {
        href: `${routes.docs}/run-tests-on-vercel-deployment`,
        name: "Run Tests on Vercel Deployment",
      },
      {
        href: `${routes.docs}/run-tests-on-netlify-deployment`,
        name: "Run Tests on Netlify Deployment",
      },
      {
        href: `${routes.docs}/run-tests-with-api`,
        name: "Run Tests with API",
      },
      {
        href: `${routes.docs}/send-slack-alerts`,
        name: "Send Slack Alerts",
      },
      {
        href: `${routes.docs}/send-email-alerts`,
        name: "Send Email Alerts",
      },
    ],
    name: "Get Started",
  },
  {
    IconComponent: IoTrailSign,
    color: "#56BBD6",
    docs: [
      { href: `${routes.docs}/add-an-assertion`, name: "Add an Assertion" },
      {
        href: `${routes.docs}/use-environment-variables`,
        name: "Use Environment Variables",
      },
      {
        href: `${routes.docs}/reuse-helper-code`,
        name: "Reuse Helper Code",
      },
      {
        href: `${routes.docs}/receive-an-email`,
        name: "Receive an Email",
      },
      {
        href: `${routes.docs}/call-an-api`,
        name: "Call an API",
      },
      {
        href: `${routes.docs}/use-localhost`,
        name: "Use localhost",
      },
    ],
    name: "Guides",
  },
  {
    IconComponent: RiPlugFill,
    color: "#8BC22D",
    docs: [
      {
        href: `${routes.docs}/globals`,
        name: "Globals",
      },
      {
        href: `${routes.docs}/assert-element`,
        name: "assertElement",
      },
      {
        href: `${routes.docs}/assert-text`,
        name: "assertText",
      },
      {
        href: `${routes.docs}/get-inbox`,
        name: "getInbox",
      },
      {
        href: `${routes.docs}/launch`,
        name: "launch",
      },
    ],
    name: "API",
  },
];

export const flattenedDocs = flatten(docs.map(({ docs }) => docs));
