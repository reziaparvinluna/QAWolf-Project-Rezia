const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_778_search_results_presence_of_mini_card_as_the_search_filter_is_modified", async () => {
 // Step 1. HGSE-778 Search Results-Presence of Mini Card as the Search/ Filter is Modified
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Login to Homeogenius UAT-Portal
  const { page, context } = await logInHomegeniusUser()
  
  // Take current url
  const url = page.url()
  console.log(url)
  
  // Constants
  const searchAddress = {
    address1: "Main Street District Dallas TX",
    address2: "Main Street Downtown Grand Haven MI"
  }
  
  // Go to home search and wait for load
  await page.goto(`${url}home-search`);
  // await page.waitForSelector(`:text("Total Listings")`)
  
  // Close helper modal
  await page.locator(`span:text("close"):visible`).last().click();
  
  // Pause
  await page.waitForTimeout(5000)
  
  //--------------------------------
  // Act & Assert:
  //--------------------------------
  //--------------------------------------Step 1------------------------------------
  //--------------------------------------------------------------------------------
  // make a search
  // Fill in first address
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).fill(searchAddress.address1);
  
  // Click on Main Street Suggestion
  await page.locator(`button:has-text("Dallas") >> nth=1`).click();
  
  // search results and pins should be displayed on map
  await expect(async () => {
    await expect(page.locator(
      `[id="deckgl-wrapper"]`
    )).toHaveScreenshot('pins1', {maxDiffPixelRatio: 0.03})
  }).toPass({timeout: 10_000})
  
  //--------------------------------------Step 2------------------------------------
  //--------------------------------------------------------------------------------
  // click on a map pin
  await expect(async () => {
    await page.mouse.click(210, 400)
  
    // mini card should be displayed
    await expect(page.locator(
      `[id="map-card-container"]`
    )).toBeVisible({ timeout: 5 * 1000 });
  }).toPass({ timeout: 30 * 1000 })
  
  // Click on the first pill x button to clear search
  await page.locator(`button:text("Main Street District, Dallas TX") + button span:text("close")`).click();
  
  //--------------------------------------Step 3------------------------------------
  //--------------------------------------------------------------------------------
  // Make another search
  // Fill in second address
  await expect(page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`)).toHaveValue("");
  await page.waitForTimeout(5000);
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).fill(searchAddress.address2);
  
  // Click on first suggestion places
  await page.locator(`button:has-text("Grand Haven")`).first().click();
  
  // Search results for this search and map pins should be displayed
  await expect(async () => {
    await expect(page.locator(
      `[id="deckgl-wrapper"]`
    )).toHaveScreenshot('pins2', {maxDiffPixelRatio: 0.03})
  }).toPass({timeout: 30_000})
  
  //--------------------------------------Step 4------------------------------------
  //--------------------------------------------------------------------------------
  // Check the presence of mini card
  // mini card should disappear as the map pins related to serach in step1 is disappeared
  await expect(page.locator(
    `[id="map-card-container"]`
  )).not.toBeVisible({delay: 10_000});
  
  //--------------------------------------Step 5------------------------------------
  //--------------------------------------------------------------------------------
  // click on a pin
  await page.mouse.click(190, 374);
  
  // mini card related to the pin should be displayed
  await expect(page.locator(
    `[data-testid="undecorate"] [alt="11 S 1st St 304"]`
  )).toBeVisible();
  
  // Per Subha, add a step to close out the mini card
  await page.mouse.click(600, 470);
  
  //--------------------------------------Step 6------------------------------------
  //--------------------------------------------------------------------------------
  // Apply Filters such that the pin related to the mini card is removed
  // pins and cards should be filtered out according to the filters applied
  
  // Click on More
  await page.getByRole(`button`, { name: `More expand_more` }).click();
  
  await page.waitForTimeout(2000);
  
  await expect(async () => {
    // Click on the Max square feet dropdown
    await page.locator(`div p:has-text("Square Feet") + div [role="combobox"]`).last().click();
  
    // Click on 2000
    await page.getByRole(`option`, { name: `2000` }).click({ timeout: 3 * 1000 });
  }).toPass({ timeout: 30 * 1000 })
  
  // Click on Apply
  await page.getByRole(`button`, { name: `Apply` }).click();
  
  //--------------------------------------Step 7------------------------------------
  //--------------------------------------------------------------------------------
  // Check the presence of mini card that was in step 7
  // it should closed, Not opened as it looks when you click on it & the pins are filtered out
  await expect(page.locator(
    `[data-testid="undecorate"] [alt="17 S 2nd Street Unit 1"]`
  )).not.toBeVisible();
  
  //--------------------------------------Step 8------------------------------------
  //--------------------------------------------------------------------------------
  // Click on a pin
  await page.mouse.click(190, 374);
  
  // mini card related to the map pin should be displayed
  // await expect(page.getByRole(`link`, { name: `9 S 3rd Street Unit 302 $299,` }).locator(`a`)).toBeVisible();
  
  // Pause for page - flakiness below
  await page.waitForTimeout(10_000)
  
  //--------------------------------------Step 9------------------------------------
  //--------------------------------------------------------------------------------
  // Click on a search result card
  // await page.locator(`[type="LARGE_CARD"]:text("9 S 3rd Street")`).click();
  await page.locator(`[data-testid="undecorate"] [alt="11 S 1st St 304"]`).click();
  
  // Property details page should be displayed
  await expect(page.getByText(`11 S 1st Street Unit 304`, { exact: true })).toBeVisible();
  
  //--------------------------------------Step 10-----------------------------------
  //--------------------------------------------------------------------------------
  // Click on Go To search
  await page.getByRole(`button`, { name: `arrow_back Search` }).click();
  
  // Search page should be displayed
  
  // Assert Pill is visible
  await expect(page.locator(
    `[title="Main Street Downtown, Grand Haven MI"]`
  )).toBeVisible();
  
  // Assert page URL
  expect(page.url()).toContain('/home-search/')
  
  //--------------------------------------Step 11-----------------------------------
  //--------------------------------------------------------------------------------
  // Check the mini card
  // Mini card should disappear/closed (not opened like when it is clicked on)
  await expect(page.getByRole(`link`, { name: `9 S 3rd Street Unit 204 $599,` }).locator(`a`)).not.toBeVisible();
  
  
  
  
});