const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_1178_switch_source_for_neighborhood_boundary_data_be", async () => {
 // Step 1. HGSE-1178: Switch source for Neighborhood boundary data - BE
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const boundaryList = [
    `Beechhurst`,
    `Whitestone`,
    `Malba`,
    `Flushing`,
    `New York`,
    `Chautauqua`,
    `Brookhaven`
  ]
  
  // Step 1 
  // Login 
  
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
  // In the search bar, When a user inputs a Neighborhood name (full or partial), the recommendations should display the matching Neighborhood names and State
  
  // Fill in two letters
  await page
    .getByPlaceholder("Address, city, neighborhood,")
    .first()
    .fill('White');
  
  // Scroll to Neighborhood section
  await page.locator(`p:text("Neighborhoods")`).scrollIntoViewIfNeeded();
  
  // Step 3 
  // The recommendations should sort Neighborhood matches by population size (or by proximity to the user if they have shared their location)
  // Assert the neighborhoods are listed in order by population
  await expect(page.locator(`[id*="NEIGHBORHOOD"] >> nth=0`)).toHaveText("WhitehavenMemphis TN")
  await expect(page.locator(`[id*="NEIGHBORHOOD"] >> nth=1`)).toHaveText("WhitestoneNew York NY")
  await expect(page.locator(`[id*="NEIGHBORHOOD"] >> nth=2`)).toHaveText("White OakWhite Oak MD")
  await expect(page.locator(`[id*="NEIGHBORHOOD"] >> nth=3`)).toHaveText("WhitehallWhitehall OH")
  await expect(page.locator(`[id*="NEIGHBORHOOD"] >> nth=4`)).toHaveText("White CenterWhite Center WA")
  
  // Click on New York
  await page.locator(
    `[id*="NEIGHBORHOOD"]:has-text("WhitestoneNew York NY")`
  ).click({ delay: 1000 })
  
  // Click on Search
  await page.getByRole(`button`, { name: `Search` }).first().click({delay: 5000});
  
  // Close the helper modal so we can assert with screenshot
  await page.getByRole(`button`, { name: `close` }).nth(1).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Step 4 
  // When a Neighborhood is selected, the search results should display the neighborhood boundary on the map and ALL the properties contained within that boundary
  
  // Assert map with boundary
  await page.getByLabel(`Zoom out`).click();
  // Wait for map to zoom out
  await page.waitForTimeout(2000);
  
  await expect(async () => {
    await expect(page.locator(
      `[id="deckgl-overlay"]`
    )).toHaveScreenshot('whitestone_ny_boundary', {maxDiffPixelRatio: 0.05})
  }).toPass({timeout: 10_000})
  
  // Grab all the City/Town of properties listed
  const properties = await page.locator(`[type="LARGE_CARD"] + [font-size="0.875rem"]`).allTextContents(); 
  console.log(properties)
  const propertiesList = properties.map((e) => e.split(", ")[0]);
  
  // Assert Properties shown are within Boundary list
  for (let property of propertiesList){
    console.log(property)
    expect(boundaryList.includes(property)).toBeTruthy(); 
  }
});