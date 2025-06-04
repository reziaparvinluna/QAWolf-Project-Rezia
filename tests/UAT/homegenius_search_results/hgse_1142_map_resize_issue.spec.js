const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_1142_map_resize_issue", async () => {
 // Step 1. HGSE-1142 - Map resize normal window to tablet, scroll down, and click on filter dropdown
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const city = "Denver";
  const tabletView = { height: 1280, width: 800 };
  
  //--------------------------------------Step 1------------------------------------
  //--------------------------------------------------------------------------------
  // Navigate to home page
  // Type city such as “Denver” and select the city and apply the search
  // Once on the home-search page and after map has loaded resize the window between common desktop, tablet and mobile screen sizes.
  // The search should remain at the original searched location between resizes
  
  // Login to Homeogenius UAT-Portal
  const { page, context } = await logInHomegeniusUser({ slowMo: 500 });
  await page.waitForTimeout(4000);
  
  // Click on Find a Home
  await page
    .locator(`[data-testid="undecorate"] #nav-hyperlink-Find\\ a\\ Home`)
    .click();
  await page.waitForTimeout(3000);
  
  // Fill in the City to Search
  await page
    .locator(
      `[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`,
    )
    .first()
    .pressSequentially(city, { delay: 100 });
  
  // Click on Search
  await page.waitForTimeout(3000);
  await page.getByRole(`button`, { name: `Search` }).first().click();
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Change View Point from normal view to tablet view
  await page.waitForTimeout(3000);
  await page.setViewportSize(tabletView);
  
  //--------------------------------------Step 2------------------------------------
  //--------------------------------------------------------------------------------
  // scenario 2
  // Navigate to search results page &
  // Scroll down all the way to the bottom of the page
  // Scrolled to the bottom of the search results page
  
  // Soft Assert we are not scrolled to the bottom
  await page.waitForTimeout(3000);
  await expect(
    page.getByRole(`img`, { name: `homegenius logo white` }),
  ).not.toBeInViewport();
  
  // Scroll bottom of page
  await page.mouse.wheel(0, 10000);
  
  //--------------------------------------Step 3------------------------------------
  //--------------------------------------------------------------------------------
  // Navigate and open/select a filter dropdown or any drop down
  // The page should not scroll back to the top
  
  await page.waitForTimeout(4000);
  
  // Open filters
  await page.getByRole(`button`, { name: `Filters` }).click();
  
  // Click on Single Family
  await page.getByLabel(`Single-family`).click({ delay: 2000 });
  
  // Close Filters
  await page
    .locator(`div`)
    .filter({ hasText: /^Filtersclose$/ })
    .getByRole(`button`)
    .click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert we did not scroll up
  await expect(page.getByLabel(`Clear map boundaries`)).toBeInViewport();
  
  await page.waitForTimeout(5000);
  
 // Step 2. HGSE-1142 - Map resize normal window to mobile, scroll down, and click on filter dropdown
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const mobileView = { height: 800, width: 360 };
  
  // Change back to normal window view
  await page.setViewportSize({ width: 1280, height: 800 });
  
  // Go back to main page
  await page.waitForTimeout(5000);
  await page.goto(process.env.URL_HOMEGENIUS);
  
  // Click on Find a Home
  await page
    .locator(`[data-testid="undecorate"] #nav-hyperlink-Find\\ a\\ Home`)
    .click();
  await page.waitForTimeout(5000);
  
  // Fill in the City to Search
  await page
    .locator(
      `[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`,
    )
    .first()
    .fill(city);
  
  // Click on Search
  await page.waitForTimeout(5000);
  await page.getByRole(`button`, { name: `Search` }).first().click();
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Click on Map Toggle
  await page.getByRole(`checkbox`).click();
  
  // Change View Point from normal view to tablet view
  await page.waitForTimeout(3000);
  await page.setViewportSize(mobileView);
  
  //--------------------------------------Step 2------------------------------------
  //--------------------------------------------------------------------------------
  // scenario 2
  // Navigate to search results page &
  // Scroll down all the way to the bottom of the page
  // Scrolled to the bottom of the search results page
  
  // Soft Assert we are not scrolled to the bottom
  await expect(
    page.getByRole(`img`, { name: `homegenius logo white` }),
  ).not.toBeInViewport();
  
  // Scroll bottom of page
  await page.mouse.wheel(0, 100000, { steps: 10 });
  
  //--------------------------------------Step 3------------------------------------
  //--------------------------------------------------------------------------------
  // Navigate and open/select a filter dropdown or any drop down
  // The page should not scroll back to the top
  
  // Expand filter
  await page
    .locator(`div`)
    .filter({ hasText: /^expand_more$/ })
    .nth(1)
    .click();
  
  // Select single family
  await page.getByLabel(`Single-family`).click();
  
  // Close filters
  await page.getByRole(`button`, { name: `close` }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert we did not scroll up
  await expect(
    page.getByRole(`link`, { name: `Privacy Policy` }),
  ).toBeInViewport();
  
});