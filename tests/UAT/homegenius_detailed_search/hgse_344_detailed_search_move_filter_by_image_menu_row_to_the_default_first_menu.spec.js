import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_344_detailed_search_move_filter_by_image_menu_row_to_the_default_first_menu", async () => {
 // Step 1. HGSE-344: [Detailed Search] Move 'Filter By Image' menu row to the default/first menu
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Step 1 
  // Login into application HGCOM-3050
  // Logged in successfully
  
  // Login
  const { browser, context, page } = await logInHomegeniusUser();
  
  /** Click the 'Find a Home' link in the navigation menu */
  await page.getByRole("link", { name: "Find a Home", exact: true }).click();
  await page.waitForTimeout(5000);
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Fill in two letters
  await page
    .getByPlaceholder("Address, city, neighborhood,")
    .first()
    .fill('Ne');
  
  // Click on New York
  await page.getByRole(`button`, { name: `New York` }).click({ delay: 100 });
  
  // Click on Search
  await page.getByRole(`button`, { name: `Search` }).first().click({delay: 5000});
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Step 2 
  // Verify 'SEARCH WITH AI' Menu
  // 'SEARCH WITH AI' menu will be moved next to the search bar
  // Step 3 
  // Verify 'SEARCH WITH AI' menu will be in the first placement
  // User able to see 'SEARCH WITH AI' besides search bar and it will be first menu option
  
  // Assert Search with AI is next to search bar
  await expect(page.locator(
    `div:has([placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]) + div:has-text("SEARCH WITH AI")`
  )).toBeVisible();
  
  // Step 4 
  // Verify color of Filter By Image
  // Note: The functionality for menu should be remain same like old homegeniusIQ menu
  // The color should not clash with search button color and change to electric blue
  
  // Assert Color of Search with AI button
  await expect(page.locator(
    `button:has-text("SEARCH WITH AI")`
  )).toHaveCSS('color', 'rgb(31, 31, 255)')
  
  // Assert border Color of Search with AI button
  await expect(page.locator(
    `button:has-text("SEARCH WITH AI")`
  )).toHaveCSS('border', '2px solid rgb(31, 31, 255)')
  
});