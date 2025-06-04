import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_3016_reset_button_on_search_with_ai_panel_and_desktop_and_tablet_design_for_advanced_filters", async () => {
 // Step 1. HGSE-3016 Reset button on Search with AI panel and Desktop Tablet for Advanced Filters
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const words = faker.random.words(50);
  
  // 1) Login to https://qa-portal.homegeniusrealestate.com/
  const {page, context} = await logInHomegeniusUser()
  
  // Click on Fina a Home
  await page.getByRole(`link`, { name: `Find a Home`, exact: true }).click();
  
  // Fill in New York
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).first().fill(`New York`);
  
  // Click on New york
  await page.getByRole(`button`, { name: `New York`, exact: true }).click({ delay: 1000 });
  
  // Click on Search
  await page.getByRole(`button`, { name: `Search` }).first().click({delay: 3000});
  
  // Close the helper modal
  await page.getByRole(`button`, { name: `close` }).last().click({delay: 3000});
  
  //--------------------------------
  // Act:
  //--------------------------------
  // 2) Search Search with AI panel on Desktop and Tablet
  // For Desktop and Tablet only when there is 1+ Advanced filters applied:
  
  // Click on Search With AI
  await page.getByRole(`button`, { name: `SEARCH WITH AI` }).click();
  
  // Fill in a Room Type
  await page.getByRole(`combobox`, { name: `Room Type` }).fill(`Kitchen`);
  
  // Fill in Descriptons for Room
  await page.getByRole(`textbox`, { name: `e.g., white cabinets, wood` }).fill(words);
  
  // Click on Advanced Filters
  await page.getByRole(`button`, { name: `Advanced Filters` }).click();
  
  // Click on Bathrooms dropdown
  await page.locator(`p:text("Bathrooms") + div >> nth=0`).click();
  
  // Click on Excellent
  await page.getByRole(`option`, { name: `Excellent` }).getByRole(`checkbox`).click();
  
  // Click on Bedrooms dropdown
  await page.locator(`p:text("Bedrooms") + div >> nth=0`).click();
  
  // Click on Excellent
  await page.getByRole(`option`, { name: `Excellent` }).getByRole(`checkbox`).click();
  
  // Click on Apply(2)
  await page.getByRole(`button`, { name: `Apply (2)` }).click();
  
  // 3) Check "Reset Filters" button
  // Search with AI panel.
  
  // Click on Search With AI
  await page.getByRole(`button`, { name: `SEARCH WITH AI` }).click();
  
  // 4) Verify a checkmark style on the "Advanced Filters" button
  // Verify display a checkmark style on the "Advanced Filters" button on 
  // the bottom of the open Search with AI Panel
  
  // Assert Advanced Filter checkmark button
  await expect(page.locator(
    `button:text("Advanced Filters") span span:has-text("check")`
  )).toBeVisible();
  
  // 5) Check If there is 1+ filter applied, items 1 and 2 above will be true.
  // It doesn't matter how the Advanced filters were applied (i.e., through 
  // an applied photo and/or through manual used of the Advanced Filters menu). 
  // If there is 1+ filter applied, items 1 and 2 above will be true.
  
  // Click on Advanced Filters
  await page.getByRole(`button`, { name: `Advanced Filters` }).click();
  
  // Assert Apply(2) button
  await expect(page.getByRole(`button`, { name: `Apply (2)` })).toBeVisible();
  
  // Click back button next to Advanced Filters heading
  await page.locator(
    `div:has-text("Advanced Filters") button:has-text("chevron_left")`
  ).click();
  
  // 6) Click on the "Reset Filters" button
  // When the user clicks on the "Reset Filters" button, all Advanced 
  // filters will be removed, even those which may have been applied manually.
  // 7) Clicks on "Reset Filters" the Search with AI window will close
  // When the user clicks on "Reset Filters" the Search with AI window 
  // will close and the search will run with any remaining, non-advanced filters.
  
  // Click on Advanced Filters
  await page.getByRole(`button`, { name: `Advanced Filters` }).click();
  
  // Click Reset
  await page.getByRole(`button`, { name: `Reset` }).click();
  
  // Assert Search with AI modal close
  await expect(page.getByRole(`heading`, { name: `Search with AI` })).not.toBeVisible();
  
  // 8) Clicks on "start over" on the Photos tab
  // When the user clicks on "start over" on the Photos tab, all Advanced 
  // filters will be removed, even those which may have been applied manually.
  
  // Click on Search With AI
  await page.getByRole(`button`, { name: `SEARCH WITH AI` }).click();
  
  // Click on Start Over
  await page.getByRole(`button`, { name: `Start Over` }).click();
  
  // Click on Confirm
  await page.getByRole(`button`, { name: `Confirm` }).click();
  
  // 9) Check if the user has no advanced filters applied the "Reset Filters" 
  // button will not display
  // When the user has no advanced filters applied (i.e., before any were 
  // applied or after a reset is clicked, the "Reset Filters" button will 
  // not display).
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert Reset Filters Button is not displaying
  await expect(page.getByRole(`button`, { name: `Reset Filters` })).not.toBeVisible();
  
  
 // Step 2. HGSE-3016 Reset button on Search with AI panel and Tablet Design for Advanced Filters
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const words2 = faker.random.words(50);
  const tabletView = { height: 1280, width: 800 }; 
  
  await page.waitForTimeout(3000);
  await page.setViewportSize(
    tabletView
  )
  
  //--------------------------------
  // Act:
  //--------------------------------
  // 2) Search Search with AI panel on Desktop and Tablet
  // For Desktop and Tablet only when there is 1+ Advanced filters applied:
  
  // Fill in a Room Type
  await page.getByRole(`combobox`, { name: `Room Type` }).fill(`Kitchen`);
  
  // Fill in Descriptons for Room
  await page.getByRole(`textbox`, { name: `e.g., white cabinets, wood` }).fill(words);
  
  // Click on Advanced Filters
  await page.getByRole(`button`, { name: `Advanced Filters` }).click();
  
  // Click on Bathrooms dropdown
  await page.locator(`p:text("Bathrooms") + div >> nth=0`).click();
  
  // Click on Excellent
  await page.getByRole(`option`, { name: `Excellent` }).getByRole(`checkbox`).click();
  
  // Click on Bedrooms dropdown
  await page.locator(`p:text("Bedrooms") + div >> nth=0`).click();
  
  // Click on Excellent
  await page.getByRole(`option`, { name: `Excellent` }).getByRole(`checkbox`).click();
  
  // Click on Apply(2)
  await page.getByRole(`button`, { name: `Apply (2)` }).click();
  
  // 3) Check "Reset Filters" button
  // Search with AI panel.
  
  // Click on Search With AI
  await page.getByRole(`button`, { name: `SEARCH WITH AI` }).click();
  
  // 4) Verify a checkmark style on the "Advanced Filters" button
  // Verify display a checkmark style on the "Advanced Filters" button on 
  // the bottom of the open Search with AI Panel
  
  // Assert Advanced Filter checkmark button
  await expect(page.locator(
    `button:text("Advanced Filters") span span:has-text("check")`
  )).toBeVisible();
  
  // 5) Check If there is 1+ filter applied, items 1 and 2 above will be true.
  // It doesn't matter how the Advanced filters were applied (i.e., through 
  // an applied photo and/or through manual used of the Advanced Filters menu). 
  // If there is 1+ filter applied, items 1 and 2 above will be true.
  
  // Click on Advanced Filters
  await page.getByRole(`button`, { name: `Advanced Filters` }).click();
  
  // Assert Apply(2) button
  await expect(page.getByRole(`button`, { name: `Apply (2)` })).toBeVisible();
  
  // Click back button next to Advanced Filters heading
  await page.locator(
    `div:has-text("Advanced Filters") button:has-text("chevron_left")`
  ).click();
  
  // 6) Click on the "Reset Filters" button
  // When the user clicks on the "Reset Filters" button, all Advanced 
  // filters will be removed, even those which may have been applied manually.
  // 7) Clicks on "Reset Filters" the Search with AI window will close
  // When the user clicks on "Reset Filters" the Search with AI window 
  // will close and the search will run with any remaining, non-advanced filters.
  
  // Click Advanced Filters
  await page.getByRole(`button`, { name: `Advanced Filters check` }).click();
  
  // Click on Reset
  await page.getByRole(`button`, { name: `Reset` }).click();
  
  // Assert Search with AI modal close
  await expect(page.getByRole(`heading`, { name: `Search with AI` })).not.toBeVisible();
  
  // 8) Clicks on "start over" on the Photos tab
  // When the user clicks on "start over" on the Photos tab, all Advanced 
  // filters will be removed, even those which may have been applied manually.
  
  // Click on Search With AI
  await page.getByRole(`button`, { name: `SEARCH WITH AI` }).click();
  
  // Click on Start Over
  await page.getByRole(`button`, { name: `Start Over` }).click();
  
  // Click on Confirm
  await page.getByRole(`button`, { name: `Confirm` }).click();
  
  // 9) Check if the user has no advanced filters applied the "Reset Filters" 
  // button will not display
  // When the user has no advanced filters applied (i.e., before any were 
  // applied or after a reset is clicked, the "Reset Filters" button will 
  // not display).
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert Start Over Button is not displaying
  await expect(page.getByRole(`button`, { name: `Start Over` })).not.toBeVisible();
  
});