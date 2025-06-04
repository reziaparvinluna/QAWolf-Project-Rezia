const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_2996_embedding_search_splash_screen", async () => {
 // Step 1. HGSE-2996 [Embedding search] Splash Screen
  //--------------------------------
  // Arrange:
  //--------------------------------
  // constants
  const zip = '21075';
  
  // Login 
  const {page,context} = await logInHomegeniusUser()
  
  // Click on Find a Home on Nav pane
  await page.getByRole(`link`, { name: `Find a Home`, exact: true }).click();
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Search by zipcode 21075
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]:visible`).first().fill(zip);
  
  // soft assert we see zipcode in options with state
  await expect(page.locator(
    `li:has-text("${zip}MD"):visible`
  )).toBeVisible();
  
  // Select zipcode 
  await page.locator(
    `li:has-text("${zip}MD"):visible`
  ).click({ delay: 1000 });
  
  // Click on Search
  await page.getByRole(`button`, { name: `Search` }).first().click();
  
  // Close the helper modal so we can assert with screenshot
  await page.getByRole(`button`, { name: `close` }).nth(1).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Verify application will display 
  // any active listings with a matching zip code on the map 
  // and listings list even if the 
  // location falls outside of the zip code boundary
  
  // Grab all the City/Town of properties listed
  const properties = await page.locator(`[type="LARGE_CARD"] + [font-size="0.875rem"]`).allTextContents(); 
  console.log(properties)
  
  // Assert Properties shown are within Boundary list
  for (let property of properties){
    console.log(property)
    expect(property.includes(zip)).toBeTruthy(); 
  }
  
  // Search result should display the zip code boundary 
  // on the map 
  // and also properties contained within that boundary
  await expect(async () => {
    await expect(page.locator(
      `[id="deckgl-overlay"]`
    )).toHaveScreenshot(`${zip}_md_boundary`, {maxDiffPixelRatio: 0.05})
  }).toPass({timeout: 10_000})
  
});