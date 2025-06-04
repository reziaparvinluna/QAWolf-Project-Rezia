import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_429_verify_property_details_listed_price_amp_value_details", async () => {
 // Step 1. HGSE-429 - Verify Property Details Listed: Price &amp: Value Details
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  //--------------------------------------Step 1 -----------------------------------
  //--------------------------------------------------------------------------------
  // LOGIN-HGCOM-3050
  // Logged successfully.
  // Login
  const { page, context } = await logInHomegeniusUser();
  
  /** Click the 'Find a Home' link in the navigation menu */
  await page.getByRole("link", { name: "Find a Home", exact: true }).click();
  await page.waitForTimeout(10_000);
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  //--------------------------------------Step 2 -----------------------------------
  //--------------------------------------------------------------------------------
  // Search a property on Basic Search Bar as per requirement
  // Application will re-direct the user to search result page, where it should display
  // a search result property cards.
  
  // Fill in two letters
  await page.getByPlaceholder("Address, city, neighborhood,").first().pressSequentially("Ne", { delay: 100 });
  
  await page.waitForTimeout(1_000);
  // Click on New York
  await page.getByRole('option', { name: 'New York' }).click({ delay: 1000, force:true })
  
  // Click on Search
  await page
    .getByRole(`button`, { name: `Search` })
    .first()
    .click({ delay: 5000 });
  
  //--------------------------------------Step 3 -----------------------------------
  //--------------------------------------------------------------------------------
  // Users click anywhere on search result property cards
  // Then application should launch a new tab, and within that tab, a property detail
  // page should appear.
  
  // Grab the information on the first 2 properties for later assertion
  const address = await page
    .locator(
      `[data-testid="undecorate"]:has-text("$") >> nth=1 >> [type="LARGE_CARD"] >> nth=0`,
    )
    .innerText();
  const addressAssert = address.split("\n");
  const address2 = await page
    .locator(
      `[data-testid="undecorate"]:has-text("$") >> nth=2 >> [type="LARGE_CARD"] >> nth=0`,
    )
    .innerText();
  const addressAssert2 = address2.split("\n");
  
  // Format the property if needed
  if (addressAssert[0]?.includes("Rd")) {
    addressAssert[0] = addressAssert[0].replace("Rd", "Road");
  }
  
  // Click on the First property listed
  await page.locator(`[data-testid="undecorate"]:has-text("$") >> nth=1`).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  //--------------------------------------Step 4 -----------------------------------
  //--------------------------------------------------------------------------------
  // Verify at property overiew page it will display a header row with the following filtering options.
  // Property details page header include below filter options.
  // Overview
  // Property Details
  // HomegeniusIQ
  // Market Trends
  // Similar Properties
  
  // Assert the header row buttons are visible
  await expect(page.locator(`button:text("Overview")`)).toBeVisible();
  await expect(
    page.getByRole(`button`, { name: `Property Details` }),
  ).toBeVisible();
  // If there is a warning in the hgIQ property condition score, then there will not be a homegeniusIQ tab
  if (!(await page.getByRole(`button`, { name: `warning` }).first().isVisible())) {
    await expect(page.locator(`button:text("homegeniusIQ")`)).toBeVisible();
  }
  await expect(page.locator(`button:text("History")`)).toBeVisible();
  await expect(page.locator(`button:text("Market Information")`)).toBeVisible();
  // This assertion and associated bug removed on 5/5/25 per Yong Lin's confirmation that
  // it is not expected to be visible on all properties.
  // await expect(page.locator(`button:text("Similar Properties")`)).toBeVisible();
  
  //--------------------------------------Step 5 -----------------------------------
  //--------------------------------------------------------------------------------
  // Verify header row must contain left and right arrows to navigate to other filtering options.
  // Header row should contain left & right arrow to navigate next/previous property on the search list
  
  // Click on the next Arrow
  await page.getByRole(`button`, { name: `arrow_forward` }).click();
  
  // Assert 2nd property is now displaying
  await expect(
    page.locator(
      `p:text("${expandStreetAbbreviations(addressAssert2[0])}") + p:text("${addressAssert2[1]}")`,
    ),
  ).toBeVisible({timeout: 60 * 1000});
  
  // Click on the previous Arrow
  await page.getByRole(`button`, { name: `arrow_back`, exact: true }).click();
  
  // Assert 1st property is now displaying
  await expect(
    page.locator(`p:text("${addressAssert[0]}") + p:text("${addressAssert[1]}")`),
  ).toBeVisible();
  
});