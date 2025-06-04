const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_1228_switch_source_for_state_boundary_data", async () => {
 // Step 1. HGSE-1228: Switch source for State boundary data
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const stateName = "Florida";
  const stateAbbr = "FL";
  
  // Step 1
  // Login
  const { page, context } = await logInHomegeniusUser();
  
  // Click on Find a Home
  await page.getByRole(`link`, { name: `Find a Home`, exact: true }).click();
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Step 2
  // When a user inputs a State name (full or partial), the recommendations
  // display the matching State and *places when applicable
  // (*cities & counties – Ex. User types ‘Flori’: FL will show as a
  // recommendation as well as cities such as Floris, IA and Florissant, MO)
  
  // Fill in State Name
  await page.getByRole(`combobox`, { name: `Address, city, neighborhood,` }).first().fill(stateName);
  
  // Click on State
  await page.getByRole(`button`, { name: stateName }).click({delay: 10_000});
  
  // Click on Search
  await page.getByRole(`button`, { name: `Search` }).first().click();
  
  // Close the helper modal
  await page.getByRole(`button`, { name: `close` }).nth(1).click({delay: 5000});
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Steo 3
  // When a State is selected, the search results should display the State
  // boundary on the map and properties contained within that boundary – currently
  // when we do a state search, we display the top ~2500 listings sorted by last
  // updated date due to system limitations
  
  // Wait until all properties are loaded
  await expect(async () => {
    expect(await page.locator(
      `[data-testid="undecorate"]:has-text("$") [type="LARGE_CARD"] [type="LARGE_CARD"] + div`
    ).count()).toBeGreaterThanOrEqual(29);
  }).toPass({ timeout: 15 * 1000 });
  
  // Assert State boundary on map
  await expect(async () => {
    await expect(page.locator(
      `[id="deckgl-overlay"]`
    )).toHaveScreenshot('florida_state', {maxDiffPixelRatio: 0.05})
  }).toPass({timeout: 10_000})
  
  // Grab the property listed
  const propertyList = await page.locator(
    `[data-testid="undecorate"]:has-text("$") [type="LARGE_CARD"] [type="LARGE_CARD"] + div`
  ).allInnerTexts();
  
  // Assert the property listed include surrounding towns
  for (let property of propertyList){
    expect(property.includes("FL")).toBeTruthy
  }
  
});