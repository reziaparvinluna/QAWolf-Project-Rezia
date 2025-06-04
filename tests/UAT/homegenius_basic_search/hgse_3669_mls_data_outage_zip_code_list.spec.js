import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_3669_mls_data_outage_zip_code_list", async () => {
 // Step 1. HGSE-3669 MLS Data Outage - Zip Code List
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  // 1) Login to QA/UAT/PROD
  // https://qa-portal.homegeniusrealestate.com/
  // https://uat-portal.homegeniusrealestate.com/
  // Application is launched
  
  // Login
  const { page, context } = await logInHomegeniusUser();
  
  // Click Find a home
  await page.getByRole(`link`, { name: `Find a Home`, exact: true }).click();
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // 2) Search with the zip code
  // 80031
  await page
    .locator(
      `[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`,
    )
    .first()
    .fill(`80031`);
  await page.locator(`[type="button"]`).first().click({ delay: 1000 });
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // 1. Apply Missing Data
  // Message: True
  // 2. Apply AVM Insufficient
  // Data: False
  
  // UI Outcome should be like below.
  // 1. Search results with the Zip Code will NOT display message - HGSE-2831;
  await expect(page.locator(`:text("Missing Data")`)).not.toBeVisible();
  await expect(
    page.locator(
      `:text("Certain listings may not be displayed in your searched area due to missing data or listing restrictions. We are working to provide the broadest data coverage possible.")`,
    ),
  ).not.toBeVisible();
  
  // Click into the first property
  await page
    .locator(`[data-testid="undecorate"] .card-media-container`)
    .first()
    .click();
  
  // 2. AVM will NOT be displayed on all properties for Property Details Page.
  await expect(page.locator(`:text("Missing Data")`)).not.toBeVisible();
  await expect(
    page.locator(
      `:text("Certain listings may not be displayed in your searched area due to missing data or listing restrictions. We are working to provide the broadest data coverage possible.")`,
    ),
  ).not.toBeVisible();
  
  // Go back to search
  await page.getByRole(`button`, { name: `arrow_back Search` }).click();
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Clear the search
  await page.getByRole(`list`).getByRole(`button`, { name: `close` }).click();
  
  // 3) Search with the zip code *80602*
  await page
    .locator(
      `[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`,
    )
    .first()
    .fill(`80602`);
  // Wait for the "homePlaces" text to be visible
  await page.getByText(`homePlaces`).waitFor(`:text("Places)`);
  await page.getByRole(`button`, { name: `80602 CO` }).click();
  
  // Click into the first location
  await page
    .locator(`[data-testid="undecorate"] a .card-media-container`)
    .first()
    .click();
  // Assert that the page has loaded by checking for "All Photos" / "Map View" container
  await expect(
    page
      .locator(`div`)
      .filter({ hasText: /^photo_libraryAll PhotosmapMap View$/ })
      .first(),
  ).toBeVisible();
  
  
  try {
    // Close the pop up on the bottom left
    await page
      .getByRole(`button`, { name: `close` })
      .click({ timeout: 3_000 });
  } catch {
    console.log("Pop up was not present");
  }
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // 1. Apply Missing Data Message: True
  // 2. Apply AVM Insufficient Data: True
  
  // Expect:
  
  // UI Outcome should be like below.
  // 1. Search results with the Zip Code will display message - HGSE-2831;
  // 2. AVM will not be displayed and will be replaced with "Insufficient Data" on all properties in the Zip Code - HGSE-2835.
  // 4) Search with the zip code *80503*
  // 1. Apply Missing Data Message: False
  // 2. Apply AVM Insufficient Data: True
  
  // Expect:
  
  // UI Outcome should be like below.
  
  // 1. Search results with the Zip Code will NOT display message - HGSE-2831;
  
  // 2. AVM will not be displayed and will be replaced with "Insufficient Data" on all properties in the Zip Code - HGSE-2835.
  
  // User only sees the data outage message in the results page when the zip code(s) provided in the search have the "Apply Missing Data Message" = TRUE flag.
  
  // 5) Login into Co-branding site
  
  // Step-1 to Step-4 should work on Co-branding site as well.
  
  // https://qa-portal.homegeniusrealestate.com/flheadertest/find-a-home
  
  // https://uat-portal.homegeniusrealestate.com/flheadertest/find-a-home
  
});