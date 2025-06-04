const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_563_property_details_off_market_saved_homes_page_mapping_claimed_home_and_saved_home_data", async () => {
 // Step 1. HGSE-563 - [Property Details Off Market] Saved Homes Page-Mapping Claimed Home and Saved Home Data
  // Constants
  // NOTE: May or may not need these for step 2
  // 1420 S OUTAGAMIE ST.
  // APPLETON
  // 7740 COUNTRY CREEK DR
  // NIWOT, CO 80503
  const OFF_MARKET_PROPERTY_STREET = "456 Green St";
  const OFF_MARKET_PROPERTY_CITY = "Brownsville, PA 15417";
  const OFF_MARKET_PROPERTY_ADDRESS = `${OFF_MARKET_PROPERTY_STREET} ${OFF_MARKET_PROPERTY_CITY}`;
  const OFF_MARKET_PROPERTY = {
    addressLineOne: OFF_MARKET_PROPERTY_STREET,
    searchAddress: OFF_MARKET_PROPERTY_ADDRESS,
  };
  
  /*
    DEFAULT_PROPERTY_VALUES 
    LOT_SIZE: "6970",
    SQFT: "1229",
    YEAR_BUILT: "1876",
  */
  const NEW_PROPERTY_VALUES = {
    LOT_SIZE: "7000",
    SQFT: "1400",
    YEAR_BUILT: "1900",
  };
  
  const email = `yong@qawolf.com`
  const password = "Secret123456!"
  
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  // Step 1
  // Navigate to homegenius and log in
  const { page } = await logInHomegeniusUser({
    email,
    password,
    args: ["--deny-permission-prompts"],
  });
  
  // Clean up: Reset property to default values to enable test
  await unclaimProperty(page, OFF_MARKET_PROPERTY);
  
  // Navigate back to home page
  await page.getByRole(`link`, { name: `homegenius-logo` }).click();
  
  // Step 2
  // Search for an Off market home and navigate to the listing with one of the following addresses:
  // Click list item generated from search
  // Step 3
  // Click on ellipses and Claim Property
  // Step 4
  // Click "Yes, add it to my profile"
  await claimProperty(page, OFF_MARKET_PROPERTY);
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Step 5
  // Update the details and click on update
  // Click "Edit" button in top right
  // Wait a bit for the home to be claimed
  await page.waitForTimeout(10000)
  await page.getByRole(`button`, { name: `edit Edit` }).click();
  
  // Wait for the modal to pop up witht he "Continue" button
  await page.getByRole(`button`, { name: `Continue` }).waitFor();
  
  // Click Continue
  await page.getByRole(`button`, { name: `Continue` }).click();
  
  // Fill in "Lot Size" to update it to new expected value
  await page.locator(`#lotSize`).fill(NEW_PROPERTY_VALUES.LOT_SIZE);
  
  // Fill in "SQFT" to update it to new expected value
  await page.locator(`#sqft`).fill(NEW_PROPERTY_VALUES.SQFT);
  
  // Fill in "Year Built" to update it to new expected value
  await page.locator(`#yearBuilt`).fill(NEW_PROPERTY_VALUES.YEAR_BUILT);
  
  // Click "Next" button to save changes
  await page.getByRole(`button`, { name: `Next` }).click();
  
  await page.getByText(`Processing updates to the`).waitFor();
  await page.getByText(`Processing updates to the`)
    .waitFor(
      { state: "hidden",
        timeout: 120_000 
      }
    );
  
  // Click "Done"
  await page.getByRole(`button`, { name: `Done` }).click();
  
  // Click "Continue to property view"
  await page.getByRole(`button`, { name: `Continue to property view` }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Validate :
  // Property details should show up
  // Expect property address to be visible
  await expect(page.getByText(OFF_MARKET_PROPERTY_STREET)).toBeVisible();
  await expect(page.getByText(OFF_MARKET_PROPERTY_CITY)).toBeVisible();
  
  // Expect "sqft" to reflect new value
  await expect(
    page.getByText(
      `square_foot${Number(NEW_PROPERTY_VALUES.SQFT).toLocaleString()} sqft`,
    ),
  ).toBeVisible();
  
  // Expect "sqft Lot" to reflect new value
  await expect(
    page.getByText(
      `fence${Number(NEW_PROPERTY_VALUES.LOT_SIZE).toLocaleString()} sqft Lot`,
    ),
  ).toBeVisible();
  
  // Expect "sqft Lot" to reflect new value
  await expect(
    page.getByText(`calendar_todayBuilt in ${NEW_PROPERTY_VALUES.YEAR_BUILT}`),
  ).toBeVisible();
  
  // Expect unedited details to be consistent
  await expect(page.getByText(`homeSingle Family`)).toBeVisible();
  await expect(page.getByText(`king_bed2 Bedrooms`)).toBeVisible();
  await expect(page.getByText(`king_bed2 Bedrooms`)).toBeVisible();
  await expect(page.getByText(`warehouse1 Car Garage`)).toBeVisible();
  
 // Step 2. HGSE-563 - [Property Details Off Market] Saved Homes View and Scroll
  //--------------------------------
  // Arrange:
  //--------------------------------
  // N/A
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Step 6
  // Navigate to Saved homes
  // Click on "ACCOUNT" button
  await page.getByRole(`button`, { name: `ACCOUNT` }).click();
  
  // Click on "Saved Homes" menu option
  await page.getByRole(`link`, { name: `Saved Homes` }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Validate: 
  // • The page should scroll to the top when a user navigates between the saved home pages
  // • The beginning of the saved / claimed homes should be under the headers for the user to VIeW
  // • Page will remain scrollable under the headers
  
  // Manually scroll to the bottom
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  
  // Wait briefly for UI to stabilize after scrolling
  await page.waitForTimeout(2000);  
  
  // Now click your button
  await page.getByRole(`button`, { name: `chevron_right` }).click();
  
  // Pause for the UI
  await page.waitForTimeout(2000)
  
  // Ensure the page has scrolled to the top
  expect(await page.evaluate(() => window.scrollY === 0)).toBeTruthy();
  
  // Ensure the "Saved Homes" section is positioned under the header
  await expect(page.locator('p:text-is("Saved Homes"):below(button:has-text("Claimed homes"))')).toBeVisible(); 
  
  // Ensure the Saved Homes section is visible
  await expect(page.getByText(`Saved Homes`).nth(1)).toBeVisible();
  await expect(page.getByText(`Saved Homes`).nth(1)).toBeInViewport();
  
  // Ensure the page is scrollable under the header
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  const clientHeight = await page.evaluate(() => document.body.clientHeight);
  expect(scrollHeight).toBeGreaterThan(clientHeight);
  
  // Ensure buttons are visible in the viewport
  await expect(page.getByRole('button', { name: 'Saved Homes' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Saved Homes' })).toBeInViewport();
  
  await expect(page.getByRole('button', { name: 'Claimed Homes' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Claimed Homes' })).toBeInViewport();
  
  // Hover over saved homes
  await page.getByText(`Saved Homes`).nth(1).hover();
  // Pause for the UI
  await page.waitForTimeout(2000)
  
  // Click back and assert the same as above
  await page.getByRole(`button`, { name: `chevron_left` }).first().click();
  
  // Pause for the UI
  await page.waitForTimeout(2000)
  
  // Ensure the page has scrolled to the top
  expect(await page.evaluate(() => window.scrollY === 0)).toBeTruthy();
  
  // Ensure the "Saved Homes" section is positioned under the header
  await expect(page.locator('p:text-is("Saved Homes"):below(button:has-text("Claimed homes"))')).toBeVisible(); 
  
  // Ensure the Saved Homes section is visible
  await expect(page.getByText(`Saved Homes`).nth(1)).toBeVisible();
  await expect(page.getByText(`Saved Homes`).nth(1)).toBeInViewport();
  
  // Ensure the page is scrollable under the header
  expect(scrollHeight).toBeGreaterThan(clientHeight);
  
  // Ensure buttons are visible in the viewport
  await expect(page.getByRole('button', { name: 'Saved Homes' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Saved Homes' })).toBeInViewport();
  
  await expect(page.getByRole('button', { name: 'Claimed Homes' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Claimed Homes' })).toBeInViewport();
  
  // Step 7
  // Find the house that was claimed in step 2 and click on the listing
  await page.getByRole(`button`, { name: `Claimed Homes` }).click();
  
  // Click on the listing
  await page.getByRole(`link`, { name: OFF_MARKET_PROPERTY_STREET }).click();
  
  // Assert we are on the property details page
  await expect(page.getByText(OFF_MARKET_PROPERTY_STREET)).toBeVisible();
  await expect(page.getByText(OFF_MARKET_PROPERTY_CITY)).toBeVisible();
  
  // Assert the URL has /propert-details
  await expect(page).toHaveURL(/.*property-details.*/);
  
  // Unclaim the property
  await page.getByLabel(`Claimed property options menu`).click();
  await page.getByText(`Release Claim`).click();
  await page.getByRole(`button`, { name: `Yes, release property` }).click();
  
});