import { Step, Workflow } from "@qawolf/types";

export const loginSteps: Step[] = [
  {
    action: "scroll",
    index: 0,
    pageId: 0,
    target: { xpath: "/html" },
    value: { x: 0, y: 366 }
  },
  {
    action: "click",
    index: 1,
    pageId: 0,
    target: {
      href: `http://localhost:5000/login`,
      innerText: "form authentication",
      tagName: "a",
      xpath: "//*[@id='content']/ul/li[18]/a"
    }
  },
  {
    action: "type",
    index: 2,
    pageId: 0,
    target: {
      id: "username",
      inputType: "text",
      name: "username",
      tagName: "input",
      xpath: "//*[@id='username']"
    },
    value: "tomsmith"
  },
  {
    action: "click",
    index: 3,
    pageId: 0,
    target: {
      innerText: "login",
      inputType: null,
      tagName: "i",
      xpath: "//*[@id='login']/button/i"
    }
  },
  {
    action: "type",
    index: 4,
    pageId: 0,
    target: {
      id: "username",
      inputType: "text",
      name: "username",
      tagName: "input",
      xpath: "//*[@id='username']"
    },
    value: "tomsmith"
  },
  {
    action: "type",
    index: 5,
    pageId: 0,
    target: {
      id: "password",
      inputType: "password",
      name: "password",
      tagName: "input",
      xpath: "//*[@id='password']"
    },
    value: "SuperSecretPassword!"
  },
  {
    action: "click",
    index: 6,
    pageId: 0,
    target: {
      tagName: "i",
      innerText: "login",
      xpath: "//*[@id='login']/button/i"
    }
  }
];

export const loginWorkflow: Workflow = {
  name: "login",
  size: "desktop",
  steps: loginSteps,
  url: "http://localhost:5000/"
};
