import { BrowserStep, Job } from "../types";

export const loginSteps: BrowserStep[] = [
  {
    action: "scroll",
    locator: { xpath: "scroll" },
    pageId: 0,
    scrollDirection: "down",
    scrollTo: 334
  },
  {
    action: "click",
    locator: {
      href: `http://localhost:5000/login`,
      tagName: "a",
      textContent: "form authentication",
      xpath: "//*[@id='content']/ul/li[18]/a"
    },
    pageId: 0
  },
  {
    action: "type",
    locator: {
      id: "username",
      inputType: "text",
      name: "username",
      tagName: "input",
      xpath: "//*[@id='username']"
    },
    pageId: 0,
    value: "tomsmith"
  },
  {
    action: "click",
    locator: {
      inputType: "submit",
      tagName: "button",
      textContent: " login",
      xpath: "//*[@id='login']/button"
    },
    pageId: 0
  },
  {
    action: "type",
    locator: {
      id: "username",
      inputType: "text",
      name: "username",
      tagName: "input",
      xpath: "//*[@id='username']"
    },
    pageId: 0,

    value: "tomsmith"
  },
  {
    action: "type",
    locator: {
      id: "password",
      inputType: "password",
      name: "password",
      tagName: "input",
      xpath: "//*[@id='password']"
    },
    pageId: 0,
    value: "SuperSecretPassword!"
  },
  {
    action: "click",
    locator: {
      tagName: "i",
      textContent: " login",
      xpath: "//*[@id='login']/button/i"
    },
    pageId: 0
  }
];

export const loginJob: Job = {
  name: "login",
  size: "desktop",
  steps: loginSteps,
  url: "http://localhost:5000/"
};
