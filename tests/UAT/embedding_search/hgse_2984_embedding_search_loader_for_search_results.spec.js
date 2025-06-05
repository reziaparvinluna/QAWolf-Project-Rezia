const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius, faker, random} = require("../../../lib/node_20_helpers");

test("hgse_2984_embedding_search_loader_for_search_results", async () => {
 // Step 1. HGSE-2984 [Embedding Search] Loader for Search Results
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const words = faker.random.words(50);
  
  async function assertLoader(page){
    // Assert AI Loader appears
    await expect(page.locator(`p:text("Running Search with AI")`)).toBeVisible();
  
    // Screenshot Assertion
    await expect(page.locator(
      `[class="css-ci6ha6"]`
    )).toHaveScreenshot('aiRunning', {maxDiffPixelRatio: 0.01});
  
    // Assert there are now property cards appearing
    await expect(page.locator(
      `[data-testid="undecorate"]:has-text("$"):visible`
    )).not.toBeVisible();
  
    // Assert Steps try catch since results may appear prior to duration of all steps
    try {
      await expect(page.locator(`p:text("Analyzing Your Search")`)).toBeVisible();
      await expect(page.locator(`p:text("Matching Your Listings")`)).toBeVisible();
      await expect(page.locator(`p:text("Preparing Your Results")`)).toBeVisible();
    } catch (e){
      console.log('Result appeared before full duration of steps which is expected')
    }
  
    // Assert run finishes
    await expect(page.locator(`p:text("Running Search with AI")`)).not.toBeVisible({timeout: 180 * 1000});
  
    // Assert we have results appearing
    const resultCount = await page.locator(
    `[data-testid="undecorate"]:has-text("$"):visible`
    ).count();
    expect(resultCount).toBeGreaterThan(1);
  }
  
  // 1) Login to https://qa-portal.homegeniusrealestate.com/
  // https://qa-portal.homegeniusrealestate.com/ is launched
  const {page, context} = await logInHomegeniusUser()
  
  // Click on Find a Home
  await page.getByRole(`link`, { name: `Find a Home`, exact: true }).click();
  
  // Fill in New York
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).first().fill(`New York`);
  
  // Click on New york
  await page.getByRole(`button`, { name: `New York`, exact: true }).click({ delay: 1000, timeout: 45 * 1000 });
  
  // Click on Search
  await page.getByRole(`button`, { name: `Search` }).first().click({delay: 3000});
  
  // Close the helper modal
  await page.getByRole(`button`, { name: `close` }).last().click({delay: 3000});
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Click on Search With AI
  await page.getByRole(`button`, { name: `SEARCH WITH AI` }).click();
  
  // Fill in a Room Type
  await page.getByRole(`combobox`, { name: `Room Type` }).fill(`Kitchen`);
  
  // Fill in Descriptons for Room
  await page.getByRole(`textbox`, { name: `e.g., white cabinets, wood` }).fill(words);
  
  // Click on Apply
  await page.getByRole(`button`, { name: `Apply` }).click({delay: 3000});
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Asserting steps 2 - 9 
  // Assert AI Loader appears
  // Screenshot Assertion to verify UI and blank page
  // Assert there are now property cards appearing
  // Assert Steps with a try catch since results may appear prior to duration of all steps
  // Assert run finishes
  // Assert we have results & listings appearing
  await assertLoader(page);
  
 // Step 2. Loader with other buttons and filters
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  //--------------------------------
  // Act:
  //--------------------------------
  // 10) When I select to Apply search from the Search with AI modal,
  // Changes to search criteria, filters, pills, embeddings will 
  // display the same loader
  
  // Click on Price dropdown
  await page.getByRole(`button`, { name: `Price expand_more` }).click();
  
  // Click on No Max dropdown
  await page.getByText(`No Maxexpand_more`).click({delay: 1000});
  
  // Click on $200,000
  await page.getByRole(`option`, { name: `$200,000` }).click({delay: 1000});
  
  // Click on Done
  await page.getByRole(`button`, { name: `Done` }).click({delay: 3000});
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert AI Loader appears
  // Screenshot Assertion
  // Assert there are now property cards appearing
  // Assert Steps try catch since results may appear prior to duration of all steps
  // Assert run finishes
  // Assert we have results appearing
  await assertLoader(page);
  
  // Click on close pill for new york
  await page.getByRole(`list`).getByRole(`button`, { name: `close` }).click();
  
  // Assert AI Loader appears
  // Screenshot Assertion
  // Assert there are now property cards appearing
  // Assert Steps try catch since results may appear prior to duration of all steps
  // Assert run finishes
  // Assert we have results appearing
  await assertLoader(page);
  
  
});