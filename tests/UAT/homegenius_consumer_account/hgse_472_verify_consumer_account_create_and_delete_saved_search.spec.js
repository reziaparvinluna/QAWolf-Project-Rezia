const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_472_verify_consumer_account_create_and_delete_saved_search", async () => {
 // Step 1. HGSE472 - Verfify Consumer Account - Create Saved Search
  //--------------------------------
  // Arrange:
  //--------------------------------
  const searchkeyword = "santa clara"
  const savedSearchName = "newSearchName"
  console.log(savedSearchName)
  
  // Login to Homeogenius UAT-Portal
  const {page,context} = await logInHomegeniusUser({slowMo:500})
  
  // Click account
  await page.locator(`#login-btn`).click();
  
  // Go to save searches
  await page.locator(`[href$="consumer-account/saved-searches"]`).click();
  
  // assert on the page
  await expect(page.locator(`h1:has-text("saved searches")`)).toBeVisible();
  
  // cleanup
  while (await page.locator(`div:has(>p:has-text("${savedSearchName}")) + div button:has-text("delete")`).first().isVisible()) {
    // Get list name and delete
    await page.locator(`div:has(>p:has-text("${savedSearchName}")) + div button:has-text("delete")`).first().click();
    // Assert modal has right description
    await expect(page.locator(`p:has-text('deleting')`)).toContainText(`${savedSearchName}`);
    // Assert modal opened up
    await expect(page.locator(`h6:has-text("delete saved search")`)).toBeVisible();
    // Assert delete option is available
    await expect(page.locator(`button:has-text("cancel"):visible + button:has-text("delete"):visible`)).toBeVisible();
    // Click delete
    await page.locator(`button:has-text("delete"):visible`).last().click();
    // Assert prompt
    await expect(page.locator(`#toast-container :text("Saved search deleted")`)).toBeVisible();
    await expect(page.locator(`#toast-container :text("Saved search deleted")`)).not.toBeVisible();
    // Assert saved search no longer exists
    // assert on the page
    await expect(page.locator(`h1:has-text("saved searches")`)).toBeVisible();
  }
  
  // Assert no saved searches are visible
  await expect(page.locator(`div:has(h3:has-text("manage saved searches"))+div div[overflow="visible"]:has-text("${savedSearchName}")`).first()).not.toBeVisible();
  //--------------------------------
  // Act:
  //--------------------------------
  // Create a saved search
  // Click search
  await page.locator(`[height="314"] button:has-text("search")`).click();
  await page.waitForSelector(`:text("Total Listings")`)
  
  // Search for a location
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).fill(searchkeyword);
  await page.locator(`button:has-text("${searchkeyword}")`).first().click();
  await page.waitForSelector(`:text("Total Listings")`)
  await page.waitForTimeout(5000);
  
  // save search
  await page.locator(`span:has-text("save")`).first().click();
  await page.locator(`div`).filter({ hasText: /^Name your search$/ }).click();
  await page.getByRole(`textbox`, { name: `Name your search` }).fill(savedSearchName);
  
  // Click the "Save" button
  await page.getByRole(`button`, { name: `Save`, exact: true }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert toaster
  await expect(page.locator(`#toast-container :text("search saved")`)).toBeVisible();
  await expect(page.locator(`#toast-container :text("search saved")`)).not.toBeVisible();
  
  
  
 // Step 2. HGSE472 - Verify Consumer Account - Delete Saved Search
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  //--------------------------------
  // Act cancel:
  //--------------------------------
  
  // Click account
  await page.locator(`#login-btn`).click();
  // Go to save searches
  await page.locator(`[href$="consumer-account/saved-searches"]`).click();
  // assert on the page and saved search is visible
  await expect(page.locator(`h1:has-text("saved searches")`)).toBeVisible();
  await expect(page.locator(`div:has(>h3:has-text("manage saved searches"))+div div[overflow="visible"] p:text-is("${savedSearchName}")`)).toBeVisible();
  
  // Get list name and delete
  await page.locator(`div:has-text("${savedSearchName}") button:has-text("delete")`).first().click();
  
  // Assert modal has right description
  await expect(page.locator(`p:has-text('deleting')`)).toContainText(`${savedSearchName}`);
  
  // Assert modal opened up
  await expect(page.locator(`h6:has-text("delete saved search")`)).toBeVisible();
  
  // Assert delete option is available
  await expect(page.locator(`button:has-text("cancel"):visible + button:has-text("delete"):visible`)).toBeVisible();
  
  // Click cancel
  await page.locator(`button:has-text("cancel"):visible`).click();
  
  //--------------------------------
  // Assert cancel:
  //--------------------------------
  // Assert modal closed
  await expect(page.locator(`h6:has-text("delete saved search")`)).not.toBeVisible();
  
  // Assert delete and cancel option not available
  await expect(page.locator(`button:has-text("cancel"):visible`)).not.toBeVisible();
  await expect(page.locator(`button:has-text("cancel"):visible + button:has-text("delete"):visible`)).not.toBeVisible();
  
  // assert on the page
  await expect(page.locator(`h1:has-text("saved searches")`)).toBeVisible();
  
  //--------------------------------
  // Act delete:
  //--------------------------------
  // Get list name and delete
  await page.locator(`div:has-text("${savedSearchName}") button:has-text("delete")`).first().click();
  
  // Assert modal has right description
  await expect(page.locator(`p:has-text('deleting')`)).toContainText(`${savedSearchName}`);
  
  // Assert modal opened up
  await expect(page.locator(`h6:has-text("delete saved search")`)).toBeVisible();
  
  // Assert delete option is available
  await expect(page.locator(`button:has-text("cancel"):visible + button:has-text("delete"):visible`)).toBeVisible();
  
  // Click delete
  await page.locator(`button:has-text("delete"):visible`).last().click();
  
  //--------------------------------
  // Assert delete:
  //--------------------------------
  // Assert prompt
  await expect(page.locator(`#toast-container :text("Saved search deleted")`)).toBeVisible();
  await expect(page.locator(`#toast-container :text("Saved search deleted")`)).not.toBeVisible();
  
  // Assert saved search no longer exists
  // assert on the page
  await expect(page.locator(`h1:has-text("saved searches")`)).toBeVisible();
  await expect(page.locator(`div:has(h3:has-text("manage saved searches"))+div div[overflow="visible"] p:text-is("${savedSearchName}")`)).not.toBeVisible();
  
});