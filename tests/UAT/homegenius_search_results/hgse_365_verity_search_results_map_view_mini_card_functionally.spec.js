const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_365_verity_search_results_map_view_mini_card_functionally", async () => {
 // Step 1. HGSE-365 - [Verity Search Results) Map View Mini Card Functionally
  //--------------------------------
  // Arrange:
  //--------------------------------
  const cityState = `Pinckney, MI`;
  const pinAddress1 = "740 E Main St";
  const pinAddress2 = "209 E Unadilla Street";
  
  //--------------------------------------Step 1------------------------------------
  //--------------------------------------------------------------------------------
  // LOGIN-HGCOM-3050
  // Logged successfully
  
  // Login to Homeogenius UAT-Portal
  const {page,context} = await logInHomegeniusUser()
  
  // Click on Find a Home
  await page.locator(`[data-testid="undecorate"] #nav-hyperlink-Find\\ a\\ Home`).click();
  
  //--------------------------------------Step 2------------------------------------
  //--------------------------------------------------------------------------------
  // Enter city in basic search bar and click go button
  // Detailed search page should be open where map should be present on left side of 
  // page
  
  // Wait for Page to load
  await page.waitForSelector(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`)
  
  // Fill in city State
  await page.locator(
    `[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`
  ).first().click();
  await page.locator(
    `[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`
  ).first().fill(cityState);
  
  // Click on Search
  await page.getByRole(`button`, { name: `Search` }).first().click({delay: 3000});
  
  // Close the helper modal 
  await page.getByRole(`button`, { name: `close` }).nth(1).click({delay: 3000});
  
  // Zoom in 1 time
  await page.getByLabel(`Zoom in`).click();
  
  //--------------------------------
  // Act & Assert:
  //--------------------------------
  
  //--------------------------------------Step 3------------------------------------
  //--------------------------------------------------------------------------------
  // Hover mouse over marker
  // Mini property card should be appear on map
  
  console.log(pinAddress1)
  await expect(async () => {
    // Hover to a pin
    await page.mouse.move(435, 220);
    await page.mouse.move(435, 220);
  
    // Assert Mini card is visible
    await expect(page.locator(
      `#map-card-container [data-testid="undecorate"]:has-text("${pinAddress1}")`
    )).toBeVisible({timeout: 10_000});
  }).toPass({timeout: 30_000})
  
  //--------------------------------------Step 4------------------------------------
  //--------------------------------------------------------------------------------
  // Click anywhere on map
  // Mini property card should be disappear
  
  await expect(async () => {
    // Hover to a pin
    await page.mouse.move(0, 0);
  
    // Assert Mini card is visible
    await expect(page.locator(
      `#map-card-container [data-testid="undecorate"]:has-text("${pinAddress1}")`
    )).toBeVisible({timeout: 10_000});
  }).toPass({timeout: 30_000})
  
  //--------------------------------------Step 5------------------------------------
  //--------------------------------------------------------------------------------
  // Mouse hover over on another marker
  // Mini property card should be appear on map
  
  const regexPinAddress2 = createFlexibleAddressRegex(pinAddress2);
  
  await expect(async () => {
    // Hover over the pin (repeat if needed to trigger UI)
    await page.mouse.move(251, 153);
    await page.mouse.move(251, 153);
  
    // Assert Mini card is still visible
    await expect(page.locator('#map-card-container [data-testid="undecorate"]', {
      hasText: regexPinAddress2
    })).toBeVisible({timeout: 10_000});
  }).toPass({ timeout: 30_000 });
  
  
  
  
  //--------------------------------------Step 6------------------------------------
  //--------------------------------------------------------------------------------
  // Click on marker
  // Mini property card is open the entire card will be selectable link
  
  // // Click to a pin
  // await page.mouse.click(620, 370);
  
  await expect(async () => {
    // Hover out of the pin
    await page.mouse.move(0, 0);
  
    // Assert Mini card is still visible
    await expect(page.locator('#map-card-container [data-testid="undecorate"]', {
      hasText: regexPinAddress2
    })).toBeVisible({timeout: 10_000});
  }).toPass({timeout: 30_000})
  
  //--------------------------------------Step 7------------------------------------
  //--------------------------------------------------------------------------------
  // Click on mini property card
  // property card details should be available
  
  // Click on the card
  await page.locator('#map-card-container [data-testid="undecorate"]', {
      hasText: regexPinAddress2
    }).click();
  
    page.locator('p:text', {
      hasText: regexPinAddress2
    })
  
  // Assert Property Detail Page
  await expect(page.locator('p', { hasText: regexPinAddress2 }))
    .toBeVisible();
  
  await expect(page.locator(
    `button:text("Property Details")`
  )).toBeVisible(); 
  
  expect(page.url()).toContain('/property-details/')
  
  
  
});