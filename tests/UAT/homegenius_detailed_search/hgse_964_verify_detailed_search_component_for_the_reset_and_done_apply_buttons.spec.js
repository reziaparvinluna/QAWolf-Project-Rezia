const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_964_verify_detailed_search_component_for_the_reset_and_done_apply_buttons", async () => {
 // Step 1. HGSE-964 [Verify Detailed Search] Component for the Reset and Done/Apply Buttons
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Step 1
  // LOGIN-HGCOM-3050
  // Logged successfully.
  const {page,context} = await logInHomegeniusUser()
  
  /** Click the 'Find a Home' link in the navigation menu */
  await page.getByRole("link", { name: "Find a Home", exact: true }).click();
  await page.waitForTimeout(5000);
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Step 2
  // Search a address as per requirement
  // Navigated to detailed search page
  
  // Fill in two letters
  await page
    .getByPlaceholder("Address, city, neighborhood,")
    .first()
    .fill('Ne');
  
  // Click on New York
  await page.getByRole(`button`, { name: `New York` }).click({ delay: 100 });
  
  // Click on Search
  await page.getByRole(`button`, { name: `Search` }).first().click({delay: 5000});
  
  
  // Step 3
  // On Detail Search page
  // Done/Apply & Reset/Reset Filters button should be available for each menu 
  // drawer of the Detailed Search Panel below.
  // 1) Search with AI->Advance Filters
  
  // Click on Search With AI 
  await page.getByRole(`button`, { name: `SEARCH WITH AI` }).click();
  
  // Soft Assert Start Over and Apply button
  await expect(page.locator(`button:text("Start Over")`)).not.toBeVisible();
  await expect(page.locator(
    `div:has(button:text("Advanced Filters")) + div:has(button:text("Apply"))`
  )).toBeVisible();
  
  // Click on x to close
  await page.locator(`h3:text("Search with AI") + button`).click();
  
  // 2) For Sale
  // Click on For Sale
  await page.getByRole(`button`, { name: `FOR SALE expand_more` }).click();
  // Soft Assert Start Over and Apply button
  await expect(page.getByRole(`button`, { name: `Reset` })).toBeVisible();
  await expect(page.getByRole(`button`, { name: `Done` })).toBeVisible();
  // Click on For Sale
  await page.getByRole(`button`, { name: `FOR SALE expand_less` }).click({force: true});
  
  // 3) Price
  // Click on Price
  await page.getByRole(`button`, { name: `Price expand_more` }).click();
  // Soft Assert Start Over and Apply button
  await expect(page.getByRole(`button`, { name: `Reset` })).toBeVisible();
  await expect(page.getByRole(`button`, { name: `Done` })).toBeVisible();
  // Click on Price
  await page.getByRole(`button`, { name: `Price expand_less` }).click({force: true});
  
  // 4) Beds & Baths
  // Click on Beds & Baths
  await page.getByRole(`button`, { name: `Beds & Baths expand_more` }).click();
  // Soft Assert Start Over and Apply button
  await expect(page.getByRole(`button`, { name: `Reset` })).toBeVisible();
  await expect(page.getByRole(`button`, { name: `Done` })).toBeVisible();
  // Click on Beds & Baths
  await page.getByRole(`button`, { name: `Beds & Baths expand_less` }).click({force: true});
  
  // 5) More
  // Click on More
  await page.getByRole(`button`, { name: `More expand_more` }).click();
  // Soft Assert Start Over and Apply button
  await expect(page.getByRole(`button`, { name: `Reset Filters` })).toBeVisible();
  await expect(page.getByRole(`button`, { name: `Apply` })).toBeVisible();
  // Click on More
  await page.getByRole(`button`, { name: `More expand_less` }).click({force: true});
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // Step 4
  // When Selecting Done
  // That will be the action that updates the search results. System does not need 
  // to update search results while the menu is open.
  // While open Detailed Menu and Selecting Done, it should close the menu and save 
  // the selections made
  
  // Click on For Sale dropdown
  await page.getByRole(`button`, { name: `FOR SALE expand_more` }).click();
  
  // Click on For Rent
  await page.getByRole(`button`, { name: `For Rent` }).click();
  
  // Click on Done
  await page.getByRole(`button`, { name: `Done` }).click();
  
  // Assert modal is closed
  await expect(page.locator(
    `div:has-text("For Sale") + div:has-text("For Rent")`
  )).not.toBeVisible();
  
  // Assert For Rent Listings are showing
  await expect(page.locator(
    `[type="LARGE_CARD"] div + div:text("For Rent")`
  )).toHaveCount(30, {timeout: 60_000});
  
  // Step 5
  // When Selecting Reset
  // It should clear all selected options within the menu drawer and close the menu 
  // and apply changes.
  
  // Click on the For Rent dropdown
  await page.getByRole(`button`, { name: `FOR RENT expand_more` }).click();
  
  // Click on Reset
  await page.getByRole(`button`, { name: `Reset` }).click();
  
  // Assert modal is closed
  await expect(page.locator(
    `div:has-text("For Sale") + div:has-text("For Rent")`
  )).not.toBeVisible();
  
  // Assert For Rent Listings not showing
  await expect(page.locator(
    `[type="LARGE_CARD"] div + div:text("For Rent")`
  )).toHaveCount(0);
  
  // Step 6
  // For all Filters
  // Reset should go back to selecting For Sale default option.
  const propertyCount = await page.locator(`[data-testid="undecorate"]:has-text("$")`).count()
  for (let i = 0; i < propertyCount; i++){
    try {
      await expect(page.locator(
        `[data-testid="undecorate"]:has-text("$") >> nth=${i}`
      )).toContainText("For Sale", {timeout: 500})
    } catch {
      try {
        await expect(page.locator(
          `[data-testid="undecorate"]:has-text("$") >> nth=${i}`
        )).toContainText("Pending", {timeout: 500})
      } catch {
        await expect(page.locator(
          `[data-testid="undecorate"]:has-text("$") >> nth=${i}`
        )).toContainText("Coming Soon", {timeout: 500})
      }
    }
  }
  
});