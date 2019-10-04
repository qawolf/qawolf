import { loadEvents } from "@qawolf/fixtures";
import { buildJob } from "./buildJob";
import { buildTest, formatStep } from "./buildTest";

describe.skip("buildTest", () => {
  test("builds a test from a job", async () => {
    const events = await loadEvents("login");
    const job = buildJob(events, "test job");
    const testString = buildTest(job);
    console.log(testString);
    throw new Error("TODO");
  });
});

describe("formatStep", () => {
  test("formats click on link step", () => {
    const step = {
      action: "click" as "click",
      locator: {
        tagName: "a",
        textContent: "contact"
      }
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual("click contact link");
  });

  test("formats click on submit input step", () => {
    const step = {
      action: "click" as "click",
      locator: {
        inputType: "submit",
        name: "signin",
        tagName: "input",
        textContent: "sign in"
      }
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual('click sign in input[type="submit"]');
  });

  test("formats scroll down action", () => {
    const step = {
      action: "scroll" as "scroll",
      locator: { xpath: "scroll" },
      scrollDirection: "down" as "down"
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual("scroll down");
  });

  test("formats scroll up action", () => {
    const step = {
      action: "scroll" as "scroll",
      locator: { xpath: "scroll" },
      scrollDirection: "up" as "up"
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual("scroll up");
  });

  test("formats type into text input", () => {
    const step = {
      action: "type" as "type",
      locator: {
        id: "input1",
        inputType: "text",
        labels: ["username"],
        name: "user",
        placeholder: "Jane Doe",
        tagName: "input"
      },
      value: "spirit"
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual(
      'enter "spirit" into username input[type="text"]'
    );
  });

  test("formats type into password input", () => {
    const step = {
      action: "type" as "type",
      locator: {
        id: "input2",
        inputType: "password",
        placeholder: "secret",
        tagName: "input"
      },
      value: "supersecret"
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual(
      'enter "supersecret" into secret input[type="password"]'
    );
  });

  test("removes newline characters", () => {
    const step = {
      action: "type" as "type",
      locator: {
        id: "input1",
        inputType: "text",
        labels: ["\nusername\n\r"],
        name: "user",
        placeholder: "Jane Doe",
        tagName: "input"
      },
      value: "spirit"
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual(
      'enter "spirit" into username input[type="text"]'
    );
  });

  test("remove excessive whitespace", () => {
    const step = {
      action: "type" as "type",
      locator: {
        id: "input1",
        inputType: "text",
        labels: ["    username    "],
        name: "user",
        placeholder: "Jane Doe",
        tagName: "input"
      },
      value: "spirit"
    };

    const formattedStep = formatStep(step);
    expect(formattedStep).toEqual(
      'enter "spirit" into username input[type="text"]'
    );
  });
});

// import { $xText } from "./browser/Browser";
// import { redirectJob, windowsJob } from "./fixtures/job";

// // TODO migrate this to test TestFactory

// test("BrowserRunner re-runs steps after navigation", async () => {
//   const runner = new BrowserRunner();
//   await runner.run(redirectJob);

//   const page = await runner.browser.page();
//   await page.waitForNavigation();

//   const header = await $xText(page, '//*[@id="content"]/div/h3');
//   expect(header).toEqual("Status Codes");
//   await runner.close();
// }, 10000);

// test("BrowserRunner works for multiple windows", async () => {
//   const runner = new BrowserRunner();
//   await runner.run(windowsJob);

//   const pageOneHeader = await $xText(
//     await runner.browser.page(0),
//     '//*[@id="content"]/div/h3'
//   );
//   expect(pageOneHeader).toEqual("Opening a new window");

//   const pageTwo = await runner.browser.page(1);
//   expect(await $xText(pageTwo, "/html/body/div/h3")).toEqual("New Window");

//   const pageThree = await runner.browser.page(2);
//   expect(await $xText(pageThree, "/html/body/div/h3")).toEqual("New Window");

//   await runner.close();
// }, 10000);
