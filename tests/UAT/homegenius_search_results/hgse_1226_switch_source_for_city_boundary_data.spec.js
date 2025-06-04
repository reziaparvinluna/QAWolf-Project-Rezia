import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_1226_switch_source_for_city_boundary_data", async () => {
 // Step 1. HGSE-1226: Switch source for City boundary data
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Step 1 
  // login 
  
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
  // When a user inputs a City name (full or partial), the recommendations display the matching City names and State
  
  // Fill in partial
  await page
    .getByPlaceholder("Address, city, neighborhood,")
    .first()
    .fill('White');
  
  // Scroll to Neighborhood section
  await page.locator(`p:text("Neighborhoods")`).scrollIntoViewIfNeeded();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // The recommendations should sort City matches by population size (or by proximity to the user if they have shared their location)
  // Step 3 
  // The recommendations should sort Neighborhood matches by population size (or by proximity to the user if they have shared their location)
  
  // Assert the neighborhoods are listed in order by population
  await expect(page.locator(`[id*="NEIGHBORHOOD"] >> nth=0`)).toHaveText("WhitehavenMemphis TN")
  await expect(page.locator(`[id*="NEIGHBORHOOD"] >> nth=1`)).toHaveText("WhitestoneNew York NY")
  await expect(page.locator(`[id*="NEIGHBORHOOD"] >> nth=2`)).toHaveText("White OakWhite Oak MD")
  await expect(page.locator(`[id*="NEIGHBORHOOD"] >> nth=3`)).toHaveText("WhitehallWhitehall OH")
  await expect(page.locator(`[id*="NEIGHBORHOOD"] >> nth=4`)).toHaveText("White CenterWhite Center WA")
  
 // Step 2. Select City 
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const address = `12303 NW 54th Ct Coral Springs FL 33076`;
  const city = `Pompano Beach FL`
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Step 5 
  // If a user types a full address, and we have an exact match for all of the address components (Street #, Street Name, State Zip) except the city, we should show the recommendation that has all of the other address components matching.
  // 12303 NW 54th Ct Coral Springs FL 33076
  // The result  should return recommendation for 12303 NW 54th Ct Pompano Beach FL33076
  
  // Fill in full address
  await page
    .getByPlaceholder("Address, city, neighborhood,")
    .first()
    .fill(address);
  
  // Assert Recommendation is displaying
  await expect(page.getByRole(`button`, { name: `NW 54th Ct Pompano Beach FL` })).toBeVisible();
  
  // Step 4 
  // When a City is selected, the search results should display the City boundary 
  // on the map and ALL the properties contained within that boundary, even if 
  // the city name doesn’t match
  
  // Fill in city 
  await page
    .getByPlaceholder("Address, city, neighborhood,")
    .first()
    .fill(city);
  
  // Select the city
  await page.getByRole(`button`, { name: `Pompano Beach FL`, exact: true }).click({ delay: 1000 });
  
  // Click on Search
  await page.getByRole(`button`, { name: `Search` }).first().click({delay: 5000});
  
  // Close the helper modal so we can assert with screenshot
  await page.getByRole(`button`, { name: `close` }).nth(1).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert map boundary
  await expect(async () => {
    await expect(page.locator(`[id="deckgl-wrapper"]`)).toHaveScreenshot(
      'Pompano_Beach', {maxDiffPixelRatio: 0.05}
    )
  }).toPass({timeout: 30_000})
  
  // Grab all the City/Town of properties listed
  const properties = await page.locator(`[type="LARGE_CARD"] + [font-size="0.875rem"]`).allTextContents(); 
  console.log(properties)
  const propertiesList = properties.map((e) => e.split(", ")[0]);
  
  // Assert listings are in city selected
  for (let property of propertiesList){
    console.log(property)
    expect(property).toContain('Pompano Beach'); 
  }
  
  
 // Step 3. Zoom Out & Assert Additional properties 
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Step 6 
  // The application should also display any active listings with a 
  // matching City on the visible* map and search results listings list even if 
  // the location falls outside of the City boundary 
  // - *if the user zooms out, we could see additional properties with a 
  // matching City outside the boundary that were not visible with the 
  // default zoom
  
  // Click on Zoom out
  await page.getByLabel(`Zoom out`).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert old map boundary is not visible
  await expect(async () => {
    await expect(page.locator(`[id="deckgl-wrapper"]`)).toHaveScreenshot(
      'Pompano_Beach', {maxDiffPixelRatio: 0.05}
    )
  }).not.toPass({timeout: 30_000})
  
  // Assert new map boundary
  await expect(async () => {
    await expect(page.locator(`[id="deckgl-wrapper"]`)).toHaveScreenshot(
      'ZoomOut_Pompano_Beach', {maxDiffPixelRatio: 0.05}
    )
  }).toPass({timeout: 30_000})
  
  
});