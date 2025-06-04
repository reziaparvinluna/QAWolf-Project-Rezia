import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_258_verify_basic_search_with_mls_id", async () => {
 // Step 1. HGSE-258 - Verify Basic Search with MLS ID
  // Constants and Helpers
  
  const mlsNumber = "879876"
  const address = "877 Eastwell Drive"
  const cityStateZip = "El Paso, TX 79928"
  
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  // Login to Homeogenius UAT-Portal
  const {page,context} = await logInHomegeniusUser()
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Click "Find a home"
  await page.locator(`[data-testid="undecorate"] #nav-hyperlink-Find\\ a\\ Home`).click();
  
  // Search mlsNumber
  await page.locator(`p:has-text("Search active listings or claim your home and view value estimates and owner tools") + div input[id^="downshift"]`).fill(mlsNumber);
  
  // Wait for search to load properly
  await page.waitForSelector(`div ul li:visible`)
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // Assert that there is only one result
  await expect(page.locator(`div ul li:visible`)).toHaveCount(1)
  
  // Click the correct result
  await page.locator(`li:visible p:has-text("${mlsNumber}") + p:has-text("${address}")`).first().click({delay:3000})
  
  // Assert that the MLSID appears on the page
  await expect(page.locator(`p:has-text("MLS ID: ${mlsNumber}")`)).toBeVisible()
  
  // Assert that the "property-details" is in the URL
  await expect(page).toHaveURL(/property-details/)
  
  // Assert that the address is correct
  await expect(page.locator(`p:has-text("${address}") + p:has-text("${cityStateZip}")`)).toBeVisible()
  
});