import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_720_hide_secondary_address_recommendation_when_there_is_exact_match_found", async () => {
 // Step 1. HGSE-720 Hide secondary address recommendation when there is exact match found
  //--------------------------------
  // Arrange:
  //--------------------------------
  const searchAddress = {
    searchAddress: "8766 Voyager Trl, Harbor Springs, MI 49740",
    addressLineOne: "8766 Voyager Trl",
    addressLineTwo : "Harbor Springs, MI 49740",
    addressLineAssert : "Harbor Springs MI",
    city: "Harbor Springs",
    state:"MI",
    zip:"49740"
  }
  
  //--------------------------------------Step 1------------------------------------
  //--------------------------------------------------------------------------------
  // Login to Application by entering valid userid & a Password
  // https://qa-portal.homegeniusrealestate.com/home-search
  // Application is launched
  const { browser, context, page } = await logInHomegeniusUser();
  
  //--------------------------------
  // Act & Assert:
  //--------------------------------
  
  //--------------------------------------Step 2------------------------------------
  //--------------------------------------------------------------------------------
  // Navigate to search and enter an address excluding City & Statea>The application should only display one recommendation to the user when an exact address match is found in search suggestions
  await goToSearchPage(page);
  
  // Fill in Address
  await page.locator(
    `[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`
  ).fill(searchAddress.addressLineOne);
  
  // That exact match should be the only one that appears in the search suggestions, and it should be in bold text.
  await expect(async () => {
    expect(await page.locator(`ul li:visible`).count()).toEqual(1);
  }).toPass({timeout: 30_000})
  // Assert Address match
  await expect(page.locator(
    `li:has-text("${searchAddress.addressLineOne}${searchAddress.addressLineAssert}")`
  )).toBeVisible()
  
  //--------------------------------------Step 5------------------------------------
  //--------------------------------------------------------------------------------
  // When there is an exact match to searched address & ZIPCODE, there will be
  // When there is an exact match to searched ZIPCODE, it shows only 1 ZIPCODE recommendation and hiding the secondary ZIPCODE (places)
  //--------------------------------------Step 6------------------------------------
  //--------------------------------------------------------------------------------
  // For addresses when when City/State is entered exact address match is recognized
  // Validate on Chrome, Firefox & Edge BrowsersScenarios 1-6 should work on all the browsers
  // For addresses when City/State is entered exact address match should be recognized
  
  // Fill in Address and Zip code
  await page.locator(
    `[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`
  ).fill(`${searchAddress.addressLineOne}, ${searchAddress.addressLineTwo}`);
  
  // Assert there are 1 suggetion
  await expect(async () => {
    expect(await page.locator(`ul li:visible`).count()).toEqual(1);
  }).toPass({timeout: 30_000})
  // Assert Address match
  await expect(page.locator(
    `li:has-text("${searchAddress.addressLineOne}${searchAddress.addressLineAssert}")`
  )).toBeVisible()
  
 // Step 2. Show secondary address recommendation when there is not an exact match found
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  
  
  //--------------------------------
  // Act & Assert:
  //--------------------------------
  
  //--------------------------------------Step 3------------------------------------
  //--------------------------------------------------------------------------------
  // The application should display the top 5 closest match recommendations when no exact address match is found
  // The application displayed the top 5 closest match recommendations when no exact address match is found
  
  // Fill in Address with no exact match
  await page.locator(
    `[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`
  ).fill(`8888 Voyager Trl`);
  
  // Assert there are 5 suggetions
  await expect(async () => {
    expect(await page.locator(`ul li:visible`).count()).toEqual(5);
  }).toPass({timeout: 30_000})
  
  //--------------------------------------Step 4------------------------------------
  //--------------------------------------------------------------------------------
  // If we have an exact match by entering only a ZipCode, the application should still display partially matched addresses
  // When we have an exact match for a ZipCode, the application displayed partially matched addresses
  
  // Fill in Zip code
  await page.locator(
    `[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`
  ).fill(searchAddress.zip);
  
  // Assert Zip Search result display
  await expect(page.locator(
    `div:has(p:text("Places")) ~ ul li button p:has-text("${searchAddress.zip}") + p:text("${searchAddress.state}")`
  )).toBeVisible();
  
  // Assert partially matched address displaying
  await expect(async () => {
    expect(await page.locator(`div:has(p:text("Addresses")) ~ ul li`).count()).toBeGreaterThanOrEqual(3);
  }).toPass({timeout: 30_000})
  
  
  
});