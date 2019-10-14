import { BrowserStep, Job } from "@qawolf/types";

export const loginSteps: BrowserStep[] = [
  {
    action: "scroll",
    target: { xpath: "scroll" },
    pageId: 0,
    scrollDirection: "down",
    scrollTo: 334
  },
  {
    action: "click",
    target: {
      href: `http://localhost:5000/login`,
      tagName: "a",
      textContent: "form authentication",
      xpath: "//*[@id='content']/ul/li[18]/a"
    },
    pageId: 0
  },
  {
    action: "input",
    target: {
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
    target: {
      inputType: "submit",
      tagName: "button",
      textContent: " login",
      xpath: "//*[@id='login']/button"
    },
    pageId: 0
  },
  {
    action: "input",
    target: {
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
    action: "input",
    target: {
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
    target: {
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
