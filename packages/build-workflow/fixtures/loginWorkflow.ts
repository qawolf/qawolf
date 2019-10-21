import { BrowserStep, Workflow } from "@qawolf/types";

export const loginSteps: BrowserStep[] = [
  {
    action: "scroll",
    index: 0,
    pageId: 0,
    scrollDirection: "down",
    scrollTo: 366,
    target: { xpath: "scroll" }
  },
  {
    action: "click",
    index: 1,
    pageId: 0,
    target: {
      href: `http://localhost:5000/login`,
      tagName: "a",
      textContent: "form authentication",
      xpath: "//*[@id='content']/ul/li[18]/a"
    }
  },
  {
    action: "input",
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
      inputType: null,
      tagName: "i",
      textContent: "login",
      xpath: "//*[@id='login']/button/i"
    }
  },
  {
    action: "input",
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
    action: "input",
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
      textContent: "login",
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
