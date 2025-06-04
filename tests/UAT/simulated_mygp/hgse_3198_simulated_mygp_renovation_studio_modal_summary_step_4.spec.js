import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_3198_simulated_mygp_renovation_studio_modal_summary_step_4", async () => {
 // Step 1. HGSE-3198 Simulated mygp: Renovation Studio Modal Summary (Step 4)
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  // This is an on market property
  const searchAddress = {
    searchAddress: "12 Greenridge Ln Unit 12,1, Lincoln, MA 01773",
    searchAddr2: "12 Greenridge Ln Unit 12,1",
    addressLineOne: "12 Greenridge Ln",
    addressLineTwo: "Lincoln, MA 01773",
    propertyType: "Condo",
    bed: "2",
    bath: "1.5",
  };
  
  const today = new Date();
  const projectName = "Project-HGSE-3171";
  const projectNotes = `projectName-${today}`;
  
  const fileName = "avatar.png";
  const filePath = `/home/wolf/files/${fileName}`;
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  const { page, context } = await logInHomegeniusUser();
  
  // ---- CLEAN UP  ----
  try {
    await unclaimProperty(page, searchAddress);
  } catch (error) {
    console.log(error);
  }
  
  // Claim Property
  await claimProperty(page, searchAddress);
  
  // // Submit Home Edits to turn on simulated mygp
  await triggerSimMyGp(page);
  
  // Click on Get Started
  await page.getByRole(`button`, { name: `Get Started` }).first().click();
  
  // Assert Renovation Studio Modal heading
  await expect(
    page.getByRole(`heading`, { name: `Renovation Studio` }),
  ).toBeVisible();
  
  // Assert Renovation Studio Modal message
  await expect(
    page.getByText(
      `Dreaming of your next home renovation? Make edits to your home facts, upload inspirational photos and select new comparables to see an estimated future home value!`,
    ),
  ).toBeVisible();
  
  // Click on Project Name
  await page.locator(`div:has(p:text("Project Name")) + textarea`).click();
  
  // Fill in Project Name
  await page
    .locator(`div:has(p:text("Project Name")) + textarea`)
    .fill(projectName);
  
  // Click on Project Notes
  await page
    .locator(`div:has(p:text("Project Notes (Optional)")) + textarea`)
    .click();
  
  // Fill in Project Notes
  await page
    .locator(`div:has(p:text("Project Notes (Optional)")) + textarea`)
    .fill(projectNotes);
  
  // click on Save and Continue
  await page.getByRole(`button`, { name: `Save and Continue` }).click();
  
  // Click the 'Enter Renovation Details' button
  await page.getByRole(`button`, { name: `Enter Renovation Details` }).click();
  
  // Click the 'Next' button
  await page.getByRole(`button`, { name: `Next` }).click();
  
  // Click the 'check boxes' for 5 cards
  for (let i = 0; i < 5; i++) {
    await page.locator(`[type="button"] [type="checkbox"]`).nth(i).click();
  }
  
  // Click the 'Calculate' button
  await page.getByRole(`button`, { name: `Calculate` }).click();
  // Click the 'Done' button
  await page.getByRole(`button`, { name: `Done` }).click();
  
  // Get the two prices, Model myGeniusPrice and mygeniusprice
  const pricesTexts = await page.locator("h2").allInnerTexts();
  const prices = pricesTexts.slice(1);
  
  // Converts the prices into numbers
  const pricesNumericals = prices.map((priceStr) =>
    parseInt(priceStr.slice(1).split(",").join("")),
  );
  
  // Click the 'Done' button
  await page.getByRole(`button`, { name: `Done` }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  
  // Assert the page has text 'Value Estimate'
  await expect(page.getByText(`Value Estimate`)).toBeVisible();
  
  // Assert the page has text 'RENOVATION STUDIO'
  await expect(
    page.getByText(`RENOVATION STUDIO`, { exact: true }),
  ).toBeVisible();
  
  // Assert the 'tool tip' button is visible
  await expect(
    page
      .locator(`div`)
      .filter({ hasText: /^Model mygeniusprice®info$/ })
      .getByRole(`button`),
  ).toBeVisible();
  
  await page
    .locator(`div`)
    .filter({ hasText: /^Model mygeniusprice®info$/ })
    .getByRole(`button`)
    .hover();
  // Assert the page has text 'The model mygeniusprice® is a' in tool tip
  await expect(page.getByText(`The model mygeniusprice® is a`)).toBeVisible();
  
  await page.mouse.move(0, 0); // Move mouse away from tool tip
  
  await expect(
    page.getByText(`The model mygeniusprice® is a`),
  ).not.toBeVisible();
  
  // Assert the page has the project name
  await expect(page.getByText(`${projectName}`)).toBeVisible();
  
  // Assert the page has text 'Model mygeniusprice®info' matches the calculations
  await expect(
    page.getByText(`Model mygeniusprice®info${prices[0]}`),
  ).toBeVisible();
  
  // Assert the page has text 'mygeniusprice®info' matches the calculations
  await expect(page.getByText(`mygeniusprice®info${prices[1]}`)).toBeVisible();
  
  // Calculate the difference of the values from the review modal
  const summaryDifference = pricesNumericals.reduce(
    (accum, price) => (accum -= price),
  );
  
  // Get the price difference
  const actualDifference = await page
    .getByText(`Difference$`)
    .locator("p")
    .innerText();
  const numericalDifference = parseInt(
    actualDifference.slice(1).split(",").join(""),
  );
  
  // Expect the prices from the summary to be the same as the prices in the modal review
  expect(numericalDifference).toEqual(summaryDifference);
  
  // ---- CLEAN UP ----
  // Click the 'Delete' button
  await page.getByRole(`button`, { name: `Delete` }).first().click();
  // Click the 'Delete' button
  await page.getByRole(`button`, { name: `Delete` }).last().click();
  
  try {
    await unclaimProperty(page, searchAddress);
  } catch (error) {
    console.log(error);
  }
  
});