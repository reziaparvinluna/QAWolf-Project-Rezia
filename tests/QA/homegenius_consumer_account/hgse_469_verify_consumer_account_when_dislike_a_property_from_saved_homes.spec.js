const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser } = require("../../../lib/node_20_helpers");

test("hgse_469_verify_consumer_account_when_dislike_a_property_from_saved_homes", async () => {
 // Step 1. HGSE-469 - [Verify Consumer Account) When Dislike a Property from Saved Homes
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  const mlsNumber = "879876"
  const address = "877 Eastwell Drive"
  const cityStateZip = "El Paso, TX 79928"
  const searchkeyword = "santa clara"
  
  // Step 1
  // Login to Homeogenius UAT-Portal
  const {page,context} = await logInHomegeniusUser()
  
  // Click "Find a home"
  await page.locator(`[data-testid="undecorate"] #nav-hyperlink-Find\\ a\\ Home`).click();
  
  // Search mlsNumber
  await page.locator(`p:has-text("Search active listings or claim your home and view value estimates and owner tools") + div input[id^="downshift"]`).fill(mlsNumber);
  await page.waitForTimeout(500)
  await page.keyboard.press("Space")
  
  // Wait for search to load properly
  await page.waitForSelector(`div ul li:visible`)
  
  // Click the correct result
  await page.locator(`li:visible p:has-text("${mlsNumber}")`).first().click({delay:3000})
  
  // Assert that the MLSID appears on the page
  await expect(page.locator(`p:has-text("MLS ID: ${mlsNumber}")`)).toBeVisible()
  
  // Go to seach page
  await page.locator(`button:has-text("Search"):visible`).first().click()
  await page.waitForSelector(`:text("Total Listings")`)
  
  // Step 2
  // Search for a location
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).fill(searchkeyword);
  await page.locator(`button:has-text("${searchkeyword}")`).first().click();
  
  // Step 3 
  // Verify we see search page 
  await expect(page.locator(`[data-testid="map"]`)).toBeVisible();
  await expect(page.locator(`[data-testid="undecorate"] [href*="/property-details"] >>nth=0 `)).toBeVisible();
  
  // Wait for the search results to update
  await page.getByRole('link', { name: searchkeyword}).nth(1).waitFor();
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Step 4
  // like 1st property
  await expect(page.locator(`[data-testid="undecorate"] [name="favorite"] >> nth=0`)).toHaveCSS('color', 'rgb(0, 0, 0)');
  await page.locator(`[data-testid="undecorate"] [name="favorite"] >> nth=0`).click();
  await expect(page.locator(`[data-testid="undecorate"] [name="favorite"] >> nth=0`)).toHaveCSS('color', 'rgb(31, 31, 255)');
  
  // like 2nd property
  await expect(page.locator(`[data-testid="undecorate"] [name="favorite"] >> nth=2`)).toHaveCSS('color', 'rgb(0, 0, 0)');
  await page.locator(`[data-testid="undecorate"] [name="favorite"] >> nth=2`).click();
  await expect(page.locator(`[data-testid="undecorate"] [name="favorite"] >> nth=2`)).toHaveCSS('color', 'rgb(31, 31, 255)');
  
  // Step 5 
  // Refresh page 
  await page.reload();
  
  // Step 6 
  // Soft assert drop down 
  await page.locator(`#login-btn`).click();
  await expect(page.getByRole(`link`, { name: `Saved Homes` })).toBeVisible();
  await expect(page.locator(`[href$="consumer-account/saved-searches"]`)).toBeVisible();
  await expect(page.locator(`[href$="consumer-account"]`)).toBeVisible();
  
  
 // Step 2. Verify Price, address, beds, baths, sqft, listing status, mls logo, status (new, pending)
  // Step 7 
  // Assert header/Account header mls data 
  // Price, address, beds, baths, sqft, listing status, mls logo, status (new, pending)
  //--------------------------------
  // Assert:
  //--------------------------------
  // go to saved homes
  await page.getByRole(`link`, { name: `Saved Homes` }).click();
  await page.waitForSelector(`[data-testid="undecorate"] :text("favorite") >> nth=0`);
  
  // count number of saved homes
  expect(await page.locator(`[data-testid="undecorate"] :text("favorite")`).count()).toBeGreaterThanOrEqual(1)
  const numLikedProperty = await page.locator(`[data-testid="undecorate"] :text("favorite")`).count()
  console.log("Number of Saved Homes", numLikedProperty)
  
  // unlike 1st property
  await page.locator(`[data-testid="undecorate"]:has-text("${searchkeyword}") :text("favorite") >> nth=0`).hover();
  await expect(page.locator(`[data-testid="undecorate"]:has-text("${searchkeyword}") :text("favorite") >> nth=0`)).toHaveCSS('color', 'rgb(31, 31, 255)');
  await page.locator(`[data-testid="undecorate"]:has-text("${searchkeyword}") :text("favorite") >> nth=0`).click();
  await expect(page.locator(`[data-testid="undecorate"]:has-text("${searchkeyword}") :text("favorite") >> nth=0`)).toHaveCSS('color', 'rgb(255, 255, 255)');
  
  // Pause
  await page.waitForTimeout(5000)
  
  // unlike 2nd property
  await page.locator(`[data-testid="undecorate"]:has-text("${searchkeyword}") :text("favorite") >> nth=1`).hover();
  await expect(page.locator(`[data-testid="undecorate"]:has-text("${searchkeyword}") :text("favorite") >> nth=1`)).toHaveCSS('color', 'rgb(31, 31, 255)');
  await page.locator(`[data-testid="undecorate"]:has-text("${searchkeyword}") :text("favorite") >> nth=1`).click();
  await expect(page.locator(`[data-testid="undecorate"]:has-text("${searchkeyword}") :text("favorite") >> nth=1`)).toHaveCSS('color', 'rgb(255, 255, 255)');
  
  // Pause
  await page.waitForTimeout(5000)
  
  // assert new liked is reduced by 2
  await page.reload()
  await page.waitForTimeout(10_000);
  expect(await page.locator(`[data-testid="undecorate"] :text("favorite")`).count()).toBeGreaterThanOrEqual(1)
  const newNumLikedProperty = await page.locator(`[data-testid="undecorate"] :text("favorite")`).count()
  expect(newNumLikedProperty).toEqual(numLikedProperty-2)
  
});