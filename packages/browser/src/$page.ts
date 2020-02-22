import { Page } from "playwright";

const waitForPage = async (pageOrIndex?: number | Page) => {
  if (!pageOrIndex) return waitForPage(0);

  const page = pageOrIndex as Page;
  if (page && page.click) {
    // TODO wait for requests...
    return page;
  }

  const index = pageOrIndex as number;
  // TODO find page in registry
};

export const $page = (pageOrIndex?: number | Page) => {
  // $page() resolves the Page
  // $page().helper() resolves an ElementHandle
  const pagePromise = waitForPage(pageOrIndex);

  // Decorate the promise with chained helpers scoped to the Page
  pagePromise.$ = async () => {
    const page = await waitForPage(pageOrIndex);
    // TODO $
  };

  pagePromise.click = async () => {
    const page = await waitForPage(pageOrIndex);
    // TODO click
  };

  return pagePromise;
};

// With "$" users can switch between vanilla Playwright and our helper methods
// $page.$ (qawolf) -> page.$ (vanilla)
$page.$ = async () => $page().$();

$page.click = async () => $page().click();
