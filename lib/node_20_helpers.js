const { test,expect, launch } = require("../lib/qawHelpers");

/**
 * @typedef {import("playwright").Browser} Browser
 */
/**
 * @typedef {import("playwright").BrowserContext} Context
 */
/**
 * @typedef {import("playwright").Page} Page
 */
/**
 * Navigates to the Homegenius URL
 *
 * @returns {Promise<{browser: Browser, context: Context, page: Page}>} - An object containing references to the browser, context, and the page after login.
 */
export async function goToHomegenius(options = {}) {
  const url = process.env.URL || options.url || process.env.URL_HOMEGENIUS;
  let browser;
  let context;
  if (options.mobile) {
    // Navigate to DEFAULT_URL
    const mobile = await launch({
      ...options,
      viewport: { height: 1280, width: 800 }, // iPad size
      ignoreHTTPSErrors: true,
    });
    browser = mobile.browser;
    context = mobile.context;
  } else {
    // Navigate to DEFAULT_URL
    const regular = await launch({
      ...options,
      ignoreHTTPSErrors: true,
    });
    browser = regular.browser;
    context = regular.context;
  }
  await context.grantPermissions(["geolocation"], { origin: url });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });

  // Accept Cookies if visible
  try {
    await page
      .getByRole(`button`, { name: `Accept Cookies` })
      .click({ timeout: 20 * 1000 });
  } catch {
    console.log(`No cookies popup visible`);
  }

  return { browser, context, page };
}

/**
 * @typedef {import("playwright").Browser} Browser
 */
/**
 * @typedef {import("playwright").BrowserContext} Context
 */
/**
 * @typedef {import("playwright").Page} Page
 */
/**
 * Navigates to the Homogenius URL
 *
 * @returns {Promise<{browser: Browser, context: Context, page: Page}>} - An object containing references to the browser, context, and the page after login.
 */
export async function goToHomegeniusQA(options = {}) {
  // Navigate to DEFAULT_URL
  const { browser, context } = await launch({
    ...options,
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  await page.goto(process.env.URL_QA_HOMEGENIUS, {
    waitUntil: "domcontentloaded",
  });

  return { browser, context, page };
}

/**
 * @typedef {import("playwright").Browser} Browser
 */
/**
 * @typedef {import("playwright").BrowserContext} Context
 */
/**
 * @typedef {import("playwright").Page} Page
 */
/**
 * Navigates to the Homogenius URL, and logs in a user
 *
 * @returns {Promise<{browser: Browser, context: Context, page: Page}>} - An object containing references to the browser, context, and the page after login.
 */
export async function logInHomegeniusUser(options = {}) {
  // Go to Homogenius site
  const { page, browser, context } = await goToHomegenius(options);

  // Close the new feature popup
  try {
      await page.locator('span:text("close")')
      .click();
  } catch {
    console.error();
  }

  // Click the "Sign In" button
  const [page2] = await Promise.all([
    page.waitForEvent("popup"),
    page.locator(`#login-btn`).click(),
  ]);

  // Fill in "Email"
  await page2
    .locator(`[aria-label="Email Address"]`)
    .fill(options.email || process.env.DEFAULT_USER);

  // Fill in "Password"
  await page2
    .locator(`[aria-label="Password"]`)
    .fill(options.password || process.env.DEFAULT_PASS);

  // Click "Sign in"
  await page2.locator(`#next`).click();

  // Assertion - We see "Account" in the upper right hand corner
  await expect(page.locator(`button:has-text("Account")`)).toBeVisible();

  return { page, browser, context };
}

/**
 * @typedef {import("playwright").Browser} Browser
 */
/**
 * @typedef {import("playwright").BrowserContext} Context
 */
/**
 * @typedef {import("playwright").Page} Page
 */
/**
 * Navigates to the Homogenius URL, and logs in a user
 *
 * @returns {Promise<{browser: Browser, context: Context, page: Page}>} - An object containing references to the browser, context, and the page after login.
 */
export async function logInHomegeniusQAUser(options = {}) {
  // Go to Homogenius site
  const { page, browser, context } = await goToHomegeniusQA(options);

  // Click the "Sign In" button
  const [page2] = await Promise.all([
    page.waitForEvent("popup"),
    page.locator(`#login-btn`).click(),
  ]);

  // Fill in "Email"
  await page2
    .locator(`[aria-label="Email Address"]`)
    .fill(options.email || process.env.DEFAULT_USER);

  // Fill in "Password"
  await page2
    .locator(`[aria-label="Password"]`)
    .fill(options.password || process.env.DEFAULT_PASS);

  // Click "Sign in"
  await page2.locator(`#next`).click();

  // Assertion - We see "Account" in the upper right hand corner
  await expect(page.locator(`button:has-text("Account")`)).toBeVisible();

  return { page, browser, context };
}

// clean up unclaim a property from account
/**
 * @params page
 * @params {searchAddress}
 */
export async function unclaimProperty(page, searchAddress) {
  // Click on Claim a Home
  await page
    .locator(`[data-testid="undecorate"] #nav-hyperlink-Claim\\ a\\ Home`)
    .click();
  // Fill in Address
  await page
    .locator(`[placeholder="Enter an Address"]`)
    .first()
    .fill(searchAddress.searchAddress);
  // Click on Claim
  await page
    .locator(`li:has-text("${searchAddress.addressLineOne}")`)
    .first()
    .click();
  try {
    await expect(page.locator(`h6:text("Claim this home")`)).toBeVisible({
      timeout: 10 * 1000,
    });
    await page.locator(`h6:text("Claim this home") + button`).click();
    return;
  } catch {
    // Return if the claim home button is visible (Doesnt need to be unclaimed)
    if (
      await page.getByRole(`button`, { name: `Claim Home` }).first().isVisible()
    )
      return;
    // Click on the meat icon next to Claimed View
    await page
      .locator(`[aria-label="Claimed property options menu button"]`)
      .click();
    // Click on Release Claim
    await page.locator(`div:text("Release Claim")`).click();
    // Click on Yes, release property
    await page.locator(`button:text("Yes, release property")`).click();
    console.log(`${searchAddress.addressLineOne} unclaimed`);
  }
}

// claim a property to account
/**
 * @params page
 * @params {searchAddress}
 */
export async function claimProperty(page, searchAddress) {
  // Click on Claim a Home
  await page
    .locator(`[data-testid="undecorate"] #nav-hyperlink-Claim\\ a\\ Home`)
    .click();

  // Fill in Address
  await page
    .locator(`[placeholder="Enter an Address"]`)
    .first()
    .fill(searchAddress.searchAddress);

  await expect(async () => {
    // Click the search bar until we see the results
    await page
      .locator(`[placeholder="Enter an Address"]`)
      .first()
      .click({ timeout: 10_000 });

    // Expect the search results to appear
    await expect(page.locator(`ul li:visible`).first()).toBeVisible({
      timeout: 10_000,
    });
  }).toPass({ timeout: 60_000 });

  // Click on Claim
  await page
    .locator(`li:has-text("${searchAddress.addressLineOne}")`)
    .first()
    .click();

  // Click on I own this home
  await page.locator(`#Own`).click();

  // Click on Yes, add it to my profile
  await page.locator(`button:text("Yes, add it to my profile")`).click();

  // Close the helper modal
  await page.waitForSelector(`button:text("Skip and Close")`);
  await page
    .locator(`main button span span:text("close"):visible`)
    .first()
    .click({ delay: 5000 });

  // Click on Skip and Close
  await page.locator(`button:text("Skip and Close")`).click();

  // Soft Assert property was successfully claimed
  await expect(
    page.locator(`p:text("This property has been successfully claimed.")`)
  ).toBeVisible();
  await expect(
    page.locator(
      `p:text("Now that it is claimed, you can come back and make edits later.")`
    )
  ).toBeVisible();

  // Close the modal
  await page.locator(`button:text("Close")`).click();
}

export function getMimeType(filePath) {
  const extension = filePath.split(".").pop().toLowerCase();
  const mimeTypes = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    bmp: "image/bmp",
    webp: "image/webp",
    pdf: "application/pdf",
    txt: "text/plain",
    csv: "text/csv",
    json: "application/json",
  };

  return mimeTypes[extension] || "application/octet-stream";
}

/** Helper to assist with uploading files
 * @param {Page} page - A page with the selector you want to drag the file onto
 * @param {String} elementSelector - The selector of the element you want to drag a file onto
 * @param {String} filePath - The path to the file
 */
export async function dragAndDropFile(page, elementSelector, filePath) {
  const { readFile } = await import("node:fs/promises");
  const rawBuffer = await readFile(filePath);
  const buffer = rawBuffer.toString("base64");

  // Get the MIME type using the custom export function
  const fileType = getMimeType(filePath);

  // Prepare the data to transfer
  const dataTransfer = await page.evaluateHandle(
    async ({ bufferData, fileName, fileType }) => {
      const dt = new DataTransfer();

      const blobData = await fetch(bufferData).then((res) => res.blob());

      const file = new File([blobData], fileName, { type: fileType });
      dt.items.add(file);
      return dt;
    },
    {
      bufferData: `data:${fileType};base64,${buffer}`,
      fileName: filePath.split("/").pop(),
      fileType: fileType,
    }
  );

  // Now dispatch the event
  await page.dispatchEvent(elementSelector, "drop", { dataTransfer });
}

/** Helper to assert edit home facts modal
 * @param {Page} page
 */
export async function assertEditHomeFactsModal(page) {
  // Assert modal appeared with background opaque
  await expect(
    page.locator(
      `[height="auto"]:has-text("Edit Home Facts or Images") ~ button`
    )
  ).toHaveCSS("background-color", "rgb(0, 0, 0)");

  // Assert Header should have Edit Home Facts or Images
  await expect(
    page.locator(`div:text("Edit Home Facts or Images")`)
  ).toBeVisible();

  // Assert X Button
  await expect(
    page.locator(
      `div:text("Edit Home Facts or Images") button:has-text("close")`
    )
  ).toBeVisible();

  // Assert gray line separate title and message body
  await expect(page.locator(`div:text("Edit Home Facts or Images")`)).toHaveCSS(
    "border-color",
    "rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgb(184, 184, 184)"
  );
  await expect(page.locator(`div:text("Edit Home Facts or Images")`)).toHaveCSS(
    "border-width",
    "0px 0px 1px"
  );

  // Assert caution sign
  await expect(page.locator('span:text("warning")')).toHaveScreenshot(
    "warningSign",
    { maxDiffPixelRatio: 0.05 }
  );

  // Assert caution message
  await expect(
    page.locator(
      `p:text("Any changes made to your home facts or images will clear your selected comparables and you will be provided with an updated comparables list for your selection.")`
    )
  ).toBeVisible();

  // Assert gray line to separate the body and the footer
  await expect(
    page.locator(`div:text("Edit Home Facts or Images") ~ div:has(button)`)
  ).toHaveCSS(
    "border-color",
    "rgb(184, 184, 184) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0)"
  );
  await expect(
    page.locator(`div:text("Edit Home Facts or Images") ~ div:has(button)`)
  ).toHaveCSS("border-width", "1px 0px 0px");

  // Assert two buttons in the footer, cancel and continue button
  await expect(
    page.locator(
      `div:text("Edit Home Facts or Images") ~ div:has(button:text("Cancel"))`
    )
  ).toBeVisible();
  await expect(
    page.locator(
      `div:text("Edit Home Facts or Images") ~ div:has(button:text("Continue"))`
    )
  ).toBeVisible();
}

export async function assertConfirmSelectModal(page) {
  // Assert modal appeared with background opaque
  await expect(
    page.locator(
      `[height="auto"]:has-text("Confirm Select New Comparables") ~ button`
    )
  ).toHaveCSS("background-color", "rgb(0, 0, 0)");

  // Assert Header should have Confirm Select New Comparables
  await expect(
    page.locator(`div:text("Confirm Select New Comparables")`)
  ).toBeVisible();

  // Assert X Button
  await expect(
    page.locator(
      `div:text("Confirm Select New Comparables") button:has-text("close")`
    )
  ).toBeVisible();

  // Assert gray line separate title and message body
  await expect(
    page.locator(`div:text("Confirm Select New Comparables")`)
  ).toHaveCSS(
    "border-color",
    "rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgb(184, 184, 184)"
  );
  await expect(
    page.locator(`div:text("Confirm Select New Comparables")`)
  ).toHaveCSS("border-width", "0px 0px 1px");

  // Assert caution sign
  await expect(page.locator('span:text("warning")')).toHaveScreenshot(
    "warningSign",
    { maxDiffPixelRatio: 0.01 }
  );

  // Assert caution message
  await expect(
    page.locator(
      `p:text("Selecting new comparables will clear your current selections and you will be provided with an updated list of comparables.")`
    )
  ).toBeVisible();

  // Assert gray line to separate the body and the footer
  await expect(
    page.locator(`div:text("Confirm Select New Comparables") ~ div:has(button)`)
  ).toHaveCSS(
    "border-color",
    "rgb(184, 184, 184) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0)"
  );
  await expect(
    page.locator(`div:text("Confirm Select New Comparables") ~ div:has(button)`)
  ).toHaveCSS("border-width", "1px 0px 0px");

  // Assert two buttons in the footer, cancel and continue button
  await expect(
    page.locator(
      `div:text("Confirm Select New Comparables") ~ div:has(button:text("Cancel"))`
    )
  ).toBeVisible();
  await expect(
    page.locator(
      `div:text("Confirm Select New Comparables") ~ div:has(button:text("Continue"))`
    )
  ).toBeVisible();
}

export async function assertConfirmRemoveModal(page) {
  // Assert modal appeared with background opaque
  await expect(
    page.locator(
      `[height="auto"]:has-text("Confirm Remove Comparables") ~ button`
    )
  ).toHaveCSS("background-color", "rgb(0, 0, 0)");

  // Assert Header should have Confirm Remove Comparables
  await expect(
    page.locator(`div:text("Confirm Remove Comparables")`)
  ).toBeVisible();

  // Assert X Button
  await expect(
    page.locator(
      `div:text("Confirm Remove Comparables") button:has-text("close")`
    )
  ).toBeVisible();

  // Assert gray line separate title and message body
  await expect(
    page.locator(`div:text("Confirm Remove Comparables")`)
  ).toHaveCSS(
    "border-color",
    "rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgb(184, 184, 184)"
  );
  await expect(
    page.locator(`div:text("Confirm Remove Comparables")`)
  ).toHaveCSS("border-width", "0px 0px 1px");

  // Assert caution message
  await expect(
    page.locator(
      `p:text('By clicking "remove" you will remove all selected comparables and your mygeniusprice will be updated.')`
    )
  ).toBeVisible();

  // Assert gray line to separate the body and the footer
  await expect(
    page.locator(`div:text("Confirm Remove Comparables") ~ div:has(button)`)
  ).toHaveCSS(
    "border-color",
    "rgb(184, 184, 184) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0)"
  );
  await expect(
    page.locator(`div:text("Confirm Remove Comparables") ~ div:has(button)`)
  ).toHaveCSS("border-width", "1px 0px 0px");

  // Assert two buttons in the footer, cancel and continue button
  await expect(
    page.locator(
      `div:text("Confirm Remove Comparables") ~ div:has(button:text("Cancel"))`
    )
  ).toBeVisible();
  await expect(
    page.locator(
      `div:text("Confirm Remove Comparables") ~ div:has(button:text("Remove"))`
    )
  ).toBeVisible();
}

export async function goToSearchPage(page, mlsNumber = "879876") {
  // // if find a home bugged out, go to search directly
  // // Take current url
  // const url = await page.url()
  // console.log(url)

  // // Go to home search and wait for load
  // await page.goto(`${url}home-search`);
  // await page.waitForSelector(`:text("Total Listings")`)

  // Click "Find a home"
  await page
    .locator(`[data-testid="undecorate"] #nav-hyperlink-Find\\ a\\ Home`)
    .click();

  // Search mlsNumber
  await page
    .locator(
      `p:has-text("Search active listings or claim your home and view value estimates and owner tools") + div input[id^="downshift"]`
    )
    .fill(mlsNumber);

  // Wait for search to load properly
  await page.waitForSelector(`div ul li:visible`);

  // Click the correct result
  await page
    .locator(`li:visible p:has-text("${mlsNumber}")`)
    .first()
    .click({ delay: 3000 });

  // Assert that the MLSID appears on the page
  await expect(
    page.locator(`p:has-text("MLS ID: ${mlsNumber}")`)
  ).toBeVisible();

  // Click back to search result
  await page.locator(`button:has-text("Search")`).click();

  // Wait for result
  await page.waitForSelector(`p:text("Total Listings")`);
  return page;
}

// Upload Multiple Images
// Pass in the selector to click on the button Ex: 'button:has-text("Upload")'
// Filepaths - an array of filepaths [`/root/team-storage/uploadImage${i}.jpg`, ...]
export async function uploadMultipleImages(page, elementSelector, filepaths) {
  const { readFile } = await import("node:fs/promises");
  const filesData = await Promise.all(
    filepaths.map(async (filePath) => {
      try {
        const rawBuffer = await readFile(filePath);
        const buffer = rawBuffer.toString("base64");
        // Directly set the MIME type for .jpg files
        const fileType = "image/jpeg";
        console.log(`File: ${filePath}, FileType: ${fileType}`);
        return {
          bufferData: `data:${fileType};base64,${buffer}`,
          fileName: filePath.split("/").pop(),
          fileType: fileType,
        };
      } catch (err) {
        console.error(`Error reading file ${filePath}:`, err);
        throw err;
      }
    })
  );

  try {
    // Prepare the data to transfer
    const dataTransfer = await page.evaluateHandle(async (files) => {
      const dt = new DataTransfer();
      for (const { bufferData, fileName, fileType } of files) {
        const blobData = await fetch(bufferData).then((res) => res.blob());
        const file = new File([blobData], fileName, { type: fileType });
        console.log(`Adding file: ${fileName}, FileType: ${fileType}`);
        dt.items.add(file);
      }
      return dt;
    }, filesData);

    // Now dispatch the event
    await page.dispatchEvent(elementSelector, "drop", { dataTransfer });
  } catch (err) {
    console.error("Error during drag and drop operation:", err);
  }
}

/**
 * Navigates to the Titlegenius URL
 *
 * @returns {Promise<{browser: Browser, context: Context, page: Page}>} - An object containing references to the browser, context, and the page after login.
 */
export async function goToTitlegenius(options = {}) {
  const url = options.url || process.env.URL_TITLEGENIUS;
  // Navigate to DEFAULT_URL
  const { browser, context } = await launch({
    ...options,
    ignoreHTTPSErrors: true,
  });
  await context.grantPermissions(["geolocation"], {
    origin: process.env.URL_TITLEGENIUS,
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });

  return { browser, context, page };
}

/**
 * Navigates to the Homogenius URL, and logs in a user
 *
 * @returns {Promise<{browser: Browser, context: Context, page: Page}>} - An object containing references to the browser, context, and the page after login.
 */
export async function logInTitlegeniusUser(options = {}) {
  // Go to Homogenius site
  const { page, browser, context } = await goToTitlegenius(options);

  // Click the "Sign In" button
  await page.locator(`[href="/login"]`).click(),
    // Fill in "Email"
    await page
      .locator(`[id="signInName"]`)
      .fill(options.email || process.env.TITLEGENIUS_LISTINGAGENT);

  // Fill in "Password"
  await page
    .locator(`[id="password"]`)
    .fill(options.password || process.env.TITLEGENIUS_LISTINGAGENT_PASS);

  // Click "Sign in"
  await page.locator(`#next`).click();

  // // Assertion - We see "Account" in the upper right hand corner
  // await expect(page.locator(`button:has-text("Account")`)).toBeVisible()

  return { page, browser, context };
}

// Log into Mi ONline
export async function logInMiOnline(options = {}) {
  const { context, browser } = await launch({
    ...options,
    ignoreHTTPSErrors: true,
    args: ["--kiosk-printing"],
  });

  const page = await context.newPage();
  await page.goto(process.env.URL_MIO, { waitUntil: "domcontentloaded" });

  // Logging in to MIO
  // Login succeeded
  await page
    .locator(
      `[name="loginPage:siteLogin:loginComponent:loginForm"] #loginPage\\:siteLogin\\:loginComponent\\:loginForm\\:username`
    )
    .fill(process.env.MIONLINE_USER1);
  await page.locator(`[type="password"]`).fill(process.env.MIONLINE_PASS);
  await page.locator(`#loginButton`).click();

  // Assert that we are logged in
  await expect(
    page.getByRole(`link`, { name: `Profile`, exact: true })
  ).toBeVisible({ timeout: 180_000 });
  await expect(page.getByRole("link", { name: "Home" })).toBeVisible();

  return { page, browser, context };
}

/**
 * Opens a PDF file in the Mozilla PDF viewer using a provided Playwright context.
 * If the file doesn't have a `.pdf` extension, it will rename the file by appending `.pdf`.
 *
 * @async
 * @export function openPdfInMozillaViewer
 * @param {object} [context] - The Playwright browser context. If not provided, a new context will be created.
 * @param {string} filePath - The file path to the PDF document. If the file extension is not `.pdf`, it will be renamed.
 * @returns {Promise<object>} - Resolves to an object containing the `page` for aliasing or further use.
 * @example1
 * const { context } = await launchBrowser();
 * const [download] = await Promise.all([
 *  page.waitForEvent("download"),
 *  page.getByLabel(`save`).click(),
 * ]);
 * const filePath = await download.path();
 * const { page: pdfPage } = await openPdfInMozillaViewer(context, filePath);
 */
export async function openPdfInMozillaViewer(context, filePath) {
  // Appends ".pdf" to file name if it does not exist to improve capabitility with PDF viewer
  if (!filePath.toLowerCase().endsWith(".pdf")) {
    const { rename } = await import("node:fs/promises");
    const newName = filePath + ".pdf";
    await rename(filePath, newName);
    filePath = newName;
  }

  // Pass in `null` to open in a new WINDOW; by default opens in new TAB
  if (!context) context = await launch().then((returnObj) => returnObj.context);

  // Navigate to pdf viewer page
  const page = await context.newPage();
  await page.goto("https://mozilla.github.io/pdf.js/web/viewer.html");

  // Create event listener to watch for a "file upload pop up"
  page.once(
    "filechooser",
    (chooser) =>
      void chooser.setFiles(filePath).catch((err) => console.log(err))
  ); // "void" syntax to prevent linter errors caused by bug which will be fixed in Playwright v1.44

  // Wait for header bar to load
  await page.locator(`#toolbarContainer`).waitFor();

  // Click ">>" to open secondary menu
  await page.getByRole(`button`, { name: `Tools` }).click();

  // Click "Open" option
  await page.locator(`#secondaryOpenFile`).click();

  // Return page for aliasing
  return { page };
}

export async function cleanUpSavedHomes(page, address) {
  // Click on Account
  await page.getByRole(`button`, { name: `ACCOUNT` }).click();

  // Click on Saved Homes
  await page.locator(`a:text("Saved Homes")`).click();

  // Check how many cleanups for saved home
  await page.waitForTimeout(5000);
  await page.waitForSelector(`p:text("Saved Homes")`);
  let cleanUpCount = await page
    .locator(`[data-testid="undecorate"]:has-text("${address}")`)
    .count();
  for (let i = 0; i < cleanUpCount; i++) {
    // Click on the first heart containing the address
    await page
      .locator(
        `[data-testid="undecorate"]:has-text("${address}") span:text("favorite")`
      )
      .first()
      .click();
    // Reload Page
    await page.reload();
  }
}

// Use to check if results in listing match filters applied
export async function isResultVisible(page, selector) {
  try {
    await page.locator(selector).waitFor({ state: "visible", timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

// Pass in an address and helper will make return address with out any abbreviations
export function expandStreetAbbreviations(address) {
  const abbreviations = {
    "\\bSt\\b": "Street",
    "\\bRd\\b": "Road",
    "\\bLn\\b": "Lane",
    "\\bAve\\b": "Avenue",
    "\\bBlvd\\b": "Boulevard",
    "\\bDr\\b": "Drive",
    "\\bCt\\b": "Court",
    "\\bPl\\b": "Place",
    "\\bSq\\b": "Square",
    "\\bHwy\\b": "Highway",
    "\\bPkwy\\b": "Parkway",
    "\\bTer\\b": "Terrace",
    "\\bCir\\b": "Circle",
    "\\bTrl\\b": "Trail",
    "\\bWay\\b": "Way",
  };

  let result = address;
  for (const [abbr, full] of Object.entries(abbreviations)) {
    const regex = new RegExp(abbr, "gi"); // case-insensitive
    result = result.replace(regex, full);
  }
  return result;
}

// goToHomegenius
// goToHomegeniusQA
// logInHomegeniusUser
// logInHomegeniusQAUser
// unclaimProperty
// claimProperty
// dragAndDropfile
// assertEditHomeFactsModal
// goToSearchPage
// uploadMultipleImages
// goToTitlegenius
// logInTitlegeniusUser
// logInMiOnline
// isResultVisible
