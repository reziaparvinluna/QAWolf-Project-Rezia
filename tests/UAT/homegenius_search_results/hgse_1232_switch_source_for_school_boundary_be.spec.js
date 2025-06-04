import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_1232_switch_source_for_school_boundary_be", async () => {
 // Step 1. HGSE-1232: Switch Source for School Boundary - BE
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const fullSchool = "Clarkstown School";
  
  const expectedSchools = [
    "Clarkstown Central School District",
    "Clarkstown South Senior High School",
    "Clarkstown North Senior High School",
  ];
  
  async function waitForPropertiesLoad(page) {
    await expect(async () => {
      // Wait until all properties are loaded
      expect(
        await page
          .locator(
            `[data-testid="undecorate"]:has-text("$") [type="LARGE_CARD"] [type="LARGE_CARD"] + div`,
          )
          .count(),
      ).toBeGreaterThanOrEqual(29);
    }).toPass({ timeout: 45_000 });
  }
  
  // Step 1
  // login
  const { page } = await logInHomegeniusUser();
  
  // Click on Find a Home
  await page.getByRole(`link`, { name: `Find a Home`, exact: true }).click();
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Step 2
  // When a user inputs a School name (full or partial), the recommendations display
  // the matching School names and State
  
  // Fill in Full School Name
  await page
    .getByRole(`combobox`, { name: `Address, city, neighborhood,` })
    .first()
    .fill(fullSchool);
  
  // Step 3
  // The recommendations should sort School matches by population size
  // (or by proximity to the user if they have shared their location)
  
  // Soft Assert expect Schools
  for (let school of expectedSchools) {
    await expect(page.locator(`li button:has-text("${school}")`)).toBeVisible();
  }
  
  // Step 4
  // When a School is selected, the search results should display the School
  // boundary on the map and ALL the properties contained within that boundary
  
  // Click on Clarkstown Central School District
  await page
    .getByRole(`button`, { name: expectedSchools[0] })
    .click({ delay: 10_000 });
  
  // Click on Search
  await page.getByRole(`button`, { name: `Search` }).first().click();
  
  // Close the helper modal
  await page.getByRole(`button`, { name: `close` }).nth(1).click({ delay: 5000 });
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert School boundary
  await expect(async () => {
    await expect(page.locator(`[id="deckgl-overlay"]`)).toHaveScreenshot(
      "school_district_clarkstown",
      { maxDiffPixelRatio: 0.05 },
    );
  }).toPass({ timeout: 10_000 });
  
 // Step 2. Add a new school boundary and remove a school boundary, verify map change
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  // Step 5
  // Ensure the map view is updated to include new boundaries or exclude
  // removed boundaries, simultaneously
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Fill in a new school boundary
  await page
    .getByRole(`textbox`, { name: `Address, city, neighborhood,` })
    .fill(expectedSchools[1]);
  
  // Click on the new school to add boundary
  await page.getByRole(`button`, { name: expectedSchools[1] }).click();
  
  // Click on the first school pill X to remove boundary
  await page.getByRole(`button`, { name: `close` }).first().click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert New School boundary
  await expect(async () => {
    await expect(page.locator(`[id="deckgl-overlay"]`)).toHaveScreenshot(
      "school_district_clarkstown_south",
      { maxDiffPixelRatio: 0.05 },
    );
  }).toPass({ timeout: 10_000 });
  
 // Step 3. Zoom in and out, verify boundary change on map
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  // Step 6
  // Ensure boundaries remain intact and visible during zooming
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Click on Zoom Out
  await page.getByRole(`button`, { name: `Zoom out` }).click();
  
  // Wait until all properties are loaded
  await waitForPropertiesLoad(page);
  
  // Assert New School boundary zoom out
  await expect(async () => {
    await expect(page.locator(`[id="deckgl-overlay"]`)).toHaveScreenshot(
      "school_district_clarkstown_south_out",
      { maxDiffPixelRatio: 0.05 },
    );
  }).toPass({ timeout: 10_000 });
  
  // Click on Zoom In
  await page.getByRole(`button`, { name: `Zoom in` }).click();
  
  // Wait until all properties are loaded
  await waitForPropertiesLoad(page);
  
  // Assert New School boundary Zoom in to original size
  await expect(async () => {
    await expect(page.locator(`[id="deckgl-overlay"]`)).toHaveScreenshot(
      "school_district_clarkstown_south",
      { maxDiffPixelRatio: 0.05 },
    );
  }).toPass({ timeout: 10_000 });
  
  // Click on Zoom In again
  await page.getByRole(`button`, { name: `Zoom in` }).click();
  
  // Wait until all properties are loaded
  await waitForPropertiesLoad(page);
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert New School boundary is Zoom in more
  await expect(async () => {
    await expect(page.locator(`[id="deckgl-overlay"]`)).toHaveScreenshot(
      "school_district_clarkstown_south_in",
      { maxDiffPixelRatio: 0.05 },
    );
  }).toPass({ timeout: 10_000 });
  
 // Step 4. Clear boundaries, verify new data is fetch based on location of map
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const expectedTowns = ["Clarkstown", "Orangetown", "Ramapo"];
  
  // Step 7
  // If no boundaries exist, fetch new data based on the new zoom level and
  // map view location.
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Click on Zoom Out
  await page.getByRole(`button`, { name: `Zoom out` }).click();
  
  // Click on the first school pill X to remove boundary
  await page.getByRole(`button`, { name: `close` }).first().click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert map boundary is gone
  await expect(async () => {
    await expect(page.locator(`[id="deckgl-overlay"]`)).toHaveScreenshot(
      "school_district_clarkstown_OFF",
      { maxDiffPixelRatio: 0.05 },
    );
  }).toPass({ timeout: 10_000 });
  
  // Grab the property listed
  const propertyList = await page
    .locator(
      `[data-testid="undecorate"]:has-text("$") [type="LARGE_CARD"] [type="LARGE_CARD"] + div`,
    )
    .allInnerTexts();
  
  // Assert the property listed include surrounding towns
  for (let property of propertyList) {
    const city = property.split(",")[0];
    expect(expectedTowns.includes(city)).toBeTruthy;
  }
  
});