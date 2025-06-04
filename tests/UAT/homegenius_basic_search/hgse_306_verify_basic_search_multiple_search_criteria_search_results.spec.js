const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_306_verify_basic_search_multiple_search_criteria_search_results", async () => {
 // Step 1. HGSE- 306: [Verify Basic Search] Multiple search criteria search results
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const zip_code_1 = "19104";
  const zip_code_2 = "19103";
  
  // Step 1
  // LOGIN-HGCOM-3050
  const { page } = await logInHomegeniusUser();
  
  // Step 2
  // Navigate to "Find a Home" view
  await page.getByRole(`link`, { name: `Find a Home`, exact: true }).click();
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Fill zip code 1 in search field to get search suggestions
  await page
    .getByPlaceholder(`Address, city, neighborhood, ZIP, school/district, MLS#`)
    .first()
    .fill(zip_code_1);
  
  // Wait for list of search suggestions to be visible
  await page.getByRole(`listbox`).waitFor();
  
  // Step 3
  // When search multiple location on basic search bar on Find a Home Page
  // Get all search result suggestions from first zip code
  const searchSuggestions1 = await page
    .getByRole(`option`)
    .getByRole(`button`)
    .all();
  
  // Click first suggestion
  await page
    .getByRole(`button`, { name: `${zip_code_1} PA`, exact: true })
    .click({ delay: 1000 });
  
  // Fill zip code 2 in search field to get search suggestions
  await page
    .getByPlaceholder(`Address, city, neighborhood, ZIP, school/district, MLS#`)
    .first()
    .fill(zip_code_2);
  
  // Wait for list of search suggestions to be visible
  await page.getByRole(`listbox`).waitFor();
  
  // Get all search result suggestions from second zip code
  const searchSuggestions2 = await page
    .getByRole(`option`)
    .getByRole(`button`)
    .all();
  
  // Click first suggestion
  await page
    .getByRole(`button`, { name: `${zip_code_2} PA`, exact: true })
    .click({ delay: 1000 });
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Expect each set of search suggestions contains more than one option
  expect(searchSuggestions1.length).toBeGreaterThan(1);
  expect(searchSuggestions2.length).toBeGreaterThan(1);
  
  // Step 4
  // After selecting suggestion result It should add a pill inside the search bar for each location
  // Expect zip code 1 to be visible in a pill in the search bar
  await expect(page.getByText(`${zip_code_1}, PA`).first()).toBeVisible();
  
  // Expect zip code 2 to be visible in a pill in the search bar as "1 more"
  await expect(page.getByText(`1 more`)).toBeVisible();
  
  // Step 5
  // When user hit 'Search' button
  // Click "Search"
  await page.getByRole(`button`, { name: `Search` }).first().click();
  
  // Click "X" on dev/debug tool to close it
  await page.getByRole(`button`, { name: `close` }).nth(2).click();
  
  // User should be able to see results from each of the locations applied in the Basic Search bar on on Find a Home Page
  // Expect multiple listings to be visible
  await expect(page.getByText(`1-29 of`).first()).toBeVisible();
  await expect(page.getByText(`Total Listings`)).toBeVisible();
  
  try {
    expect((await page.getByText(zip_code_1).all()).length).toBeGreaterThan(2);
    expect((await page.getByText(zip_code_2).all()).length).toBeGreaterThan(2);
  } catch {
    await expect(async () => {
      // Click Next page
      await page.getByRole(`button`, { name: `chevron_right` }).last().click();
      // Expect multiple listings to have zip codes of the target zip codes
      expect((await page.getByText(zip_code_1).all()).length).toBeGreaterThan(2, {
        timeout: 5000,
      });
      expect((await page.getByText(zip_code_2).all()).length).toBeGreaterThan(2, {
        timeout: 5000,
      });
    }).toPass({ timeout: 30 * 1000 });
  }
  
});