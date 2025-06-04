import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_3337_simulated_mygp_renovation_studio_modal_comparables_step_3", async () => {
 // Step 1. HGSE-3337 Simulated mygp: Renovation Studio modal Comparables (Step 3)
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const searchAddress = {
    searchAddress: "8 New York Ave, Rensselaer, NY 12144",
    searchAddr2: "8 New York Ave",
    addressLineOne: "8 New York Ave",
    addressLineTwo: "Rensselaer, NY 12144",
    propertyType: "Single Family",
    bed: "2",
    bath: "1",
  };
  const projectName = "Simulated Price Check";
  const pathToFiles = "/home/wolf/team-storage/";
  const files = [
    `${pathToFiles}great-kitchen.jpg`,
    `${pathToFiles}room1.jpg`,
    `${pathToFiles}uploadImage14.jpg`,
  ];
  
  // Log In
  const { page, browser, context } = await logInHomegeniusUser();
  
  // Clean Up
  try {
    await unclaimProperty(page, searchAddress);
  } catch (error) {
    console.log(error);
  }
  
  // Claim Property
  await claimProperty(page, searchAddress);
  
  // Submit Home Edits to turn on simulated mygp
  await triggerSimMyGp(page);
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Click the "Renovation Studio" button
  await page.getByRole(`button`, { name: `Renovation Studio` }).click();
  
  // Click the "Get Started" button
  await page
    .locator(`#CLAIMED_RENOVATION`)
    .getByRole(`button`, { name: `Get Started` })
    .click();
  
  // Fill in Project Name
  await page.locator(`div:has-text("Project Name") ~ textarea`).fill(projectName);
  
  // Click the "Save and Continue" button
  await page.getByRole(`button`, { name: `Save and Continue` }).click();
  
  // Click the "Enter Renovation Details" button
  await page.getByRole(`button`, { name: `Enter Renovation Details` }).click();
  
  // Click '+' button on 1/2 bath
  await page
    .locator(`div`)
    .filter({ hasText: /^1\/2 Bath -\+$/ })
    .getByRole(`button`)
    .nth(1)
    .click();
  
  // Upload Images
  await page.locator(`input[type="file"]`).first().setInputFiles(files);
  
  // Wait for loading
  await expect(page.locator(`.loader`).first()).toBeVisible();
  await expect(page.locator(`.loader`).last()).not.toBeVisible();
  
  // Click the "Next" button
  await page.getByRole(`button`, { name: `Next` }).click();
  
  // Verify we're on the "Select Comparable Homes" page
  await expect(
    page.getByText(`Select Comparable Homes (Optional)`),
  ).toBeVisible();
  
  // Check price for "Model mygeniusprice" vs "mygeniusprice"
  let modelPrice = await page
    .locator(
      `div[width="min-content"]:has(div ~ div:has-text("Model mygeniusprice")) div`,
    )
    .first()
    .innerText();
  let mygeniusPrice = await page
    .locator(
      `div[width="6.375rem"]:has(div ~ div:has-text("mygeniusprice")) div:has-text("$")`,
    )
    .first()
    .innerText();
  
  // Click "Back"
  await page.getByRole(`button`, { name: `Back` }).click();
  
  // Ensure we're back on Step 2 of the modal
  await expect(page.getByText(`Edit Home Facts (optional)`)).toBeVisible();
  await expect(
    page.getByText(`Upload Inspirational Photos (optional)`),
  ).toBeVisible();
  
  // Click the "Next" button
  await page.getByRole(`button`, { name: `Next` }).click();
  
  // Select the first 5 homes
  for (let i = 0; i < 5; i++) {
    await page
      .locator(`button:has-text("Select home") input[type="checkbox"]`)
      .nth(i)
      .click();
  }
  
  // Ensure the prices are different
  expect(modelPrice).not.toBe(mygeniusPrice);
  
  // Ensure we're on the "Renovation Studio" modal
  await expect(
    page.locator(
      `.claim-home-comparables-container :text-is("RENOVATION STUDIO")`,
    ),
  ).toBeVisible();
  
  // Ensure the Header in the modal reads {projectName}
  await expect(
    page.locator(`.claim-home-comparables-container :text-is("${projectName}")`),
  ).toBeVisible();
  
  // Hover on Model mygeniusprice tooltip
  await page
    .locator(
      `div[width="min-content"]:has(div ~ div:has-text("Model mygeniusprice")) button`,
    )
    .hover();
  
  // Ensure the tooltip for Model mygeniusprice is accurate
  await expect(
    page.locator(`div`).filter({ hasText: `Personalized property value` }).nth(2),
  ).toHaveText(
    `Personalized property value estimate based on our homegeniusIQ® technology that analyses the home condition based on property images and your changes or updates to the property details.`,
  );
  
  // Hover on Model mygeniusprice tooltip
  await page
    .locator(
      `div[width="6.375rem"]:has(div ~ div:has-text("mygeniusprice")) button`,
    )
    .hover();
  
  // Ensure the tooltip for Model mygeniusprice is accurate
  await expect(
    page.locator(`div`).filter({ hasText: `Personalized property value` }).nth(1),
  ).toHaveText(
    `Personalized property value estimate based on our homegeniusIQ® technology that analyses the home condition based on property images and your changes or updates to the property details.`,
  );
  
  // Click the "Done" button
  await page.getByRole(`button`, { name: `Done` }).click();
  
  // Click the "Done" button
  await page.getByRole(`button`, { name: `Done` }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert the Model Price is updated based on Comparable Properties
  await expect(
    page.locator(`div:has(div:text-is("Model mygeniusprice®")) > p:text("$")`),
  ).not.toHaveText(modelPrice);
  
  // Assert mygeniusprice is the same
  await expect(
    page.locator(`div:has(div:text-is("mygeniusprice®")) > p:text("$")`),
  ).toHaveText(mygeniusPrice);
  
  // Assert the additional half bathroom is visible
  await expect(page.getByText(`+ 0.5 Bath`)).toBeVisible();
  
  // Assert the Comparables View is visible
  await expect(page.locator(`#CLAIMED_VIEW_COMPARABLES`)).toBeVisible();
  
  // Assert there are 5 Comparables visible
  await expect(
    page.locator(`#CLAIMED_VIEW_COMPARABLES .card-media-container :text-is("A")`),
  ).toBeVisible();
  await expect(
    page.locator(`#CLAIMED_VIEW_COMPARABLES .card-media-container :text-is("B")`),
  ).toBeVisible();
  await expect(
    page.locator(`#CLAIMED_VIEW_COMPARABLES .card-media-container :text-is("C")`),
  ).toBeVisible();
  await expect(
    page.locator(`#CLAIMED_VIEW_COMPARABLES .card-media-container :text-is("D")`),
  ).toBeVisible();
  await expect(
    page.locator(`#CLAIMED_VIEW_COMPARABLES .card-media-container :text-is("E")`),
  ).toBeVisible();
  
  // Assert the Project Name
  await expect(page.getByText(projectName)).toBeVisible();
  
  // Assert "Renovation Studio"
  await expect(
    page.getByText(`RENOVATION STUDIO`, { exact: true }),
  ).toBeVisible();
  
 // Step 2. HGSE-3337 Simulated mygp: Renovation Studio modal Comparables (Step 3) (Co-branding website)
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Co-branding websites:
  // https://qa-portal.homegeniusrealestate.com/headertest1/claim-a-home
  // https://uat-portal.homegeniusrealestate.com/headertest1/claim-a-home
  // https://qa-portal.homegeniusrealestate.com/flheadertest/find-a-home
  // https://uat-portal.homegeniusrealestate.com/flheadertest/find-a-home
  
  // Login into Co-branding site with valid credentials
  const { page: coPage } = await logInHomegeniusUser({
    url: "https://uat-portal.homegeniusrealestate.com/headertest1/claim-a-home",
  });
  
  // Clean Up
  await unclaimProperty(coPage, searchAddress);
  
  // Claim property
  await claimProperty(coPage, searchAddress);
  
  // Submit Home Edits to turn on simulated mygp
  await triggerSimMyGp(coPage);
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Click the "Renovation Studio" button
  await coPage.getByRole(`button`, { name: `Renovation Studio` }).click();
  
  // Click the "Get Started" button
  await coPage
    .locator(`#CLAIMED_RENOVATION`)
    .getByRole(`button`, { name: `Get Started` })
    .click();
  
  // Fill in Project Name
  await coPage
    .locator(`div:has-text("Project Name") ~ textarea`)
    .fill(projectName);
  
  // Click the "Save and Continue" button
  await coPage.getByRole(`button`, { name: `Save and Continue` }).click();
  
  // Click the "Enter Renovation Details" button
  await coPage.getByRole(`button`, { name: `Enter Renovation Details` }).click();
  
  // Click '+' button on 1/2 bath
  await coPage
    .locator(`div`)
    .filter({ hasText: /^1\/2 Bath -\+$/ })
    .getByRole(`button`)
    .nth(1)
    .click();
  
  // Upload Images
  await coPage.locator(`input[type="file"]`).first().setInputFiles(files);
  
  // Wait for loading
  await expect(coPage.locator(`.loader`).first()).toBeVisible();
  await expect(coPage.locator(`.loader`).last()).not.toBeVisible();
  
  // Click the "Next" button
  await coPage.getByRole(`button`, { name: `Next` }).click();
  
  // Verify we're on the "Select Comparable Homes" page
  await expect(
    coPage.getByText(`Select Comparable Homes (Optional)`),
  ).toBeVisible();
  
  // Check price for "Model mygeniusprice" vs "mygeniusprice"
  modelPrice = await coPage
    .locator(
      `div[width="min-content"]:has(div ~ div:has-text("Model mygeniusprice")) div`,
    )
    .first()
    .innerText();
  mygeniusPrice = await coPage
    .locator(
      `div[width="6.375rem"]:has(div ~ div:has-text("mygeniusprice")) div:has-text("$")`,
    )
    .first()
    .innerText();
  
  // Click "Back"
  await coPage.getByRole(`button`, { name: `Back` }).click();
  
  // Ensure we're back on Step 2 of the modal
  await expect(coPage.getByText(`Edit Home Facts (optional)`)).toBeVisible();
  await expect(
    coPage.getByText(`Upload Inspirational Photos (optional)`),
  ).toBeVisible();
  
  // Click the "Next" button
  await coPage.getByRole(`button`, { name: `Next` }).click();
  
  // Select the first 5 homes
  for (let i = 0; i < 5; i++) {
    await coPage
      .locator(`button:has-text("Select home") input[type="checkbox"]`)
      .nth(i)
      .click();
  }
  
  // Ensure the prices are different
  expect(modelPrice).not.toBe(mygeniusPrice);
  
  // Ensure we're on the "Renovation Studio" modal
  await expect(
    coPage.locator(
      `.claim-home-comparables-container :text-is("RENOVATION STUDIO")`,
    ),
  ).toBeVisible();
  
  // Ensure the Header in the modal reads {projectName}
  await expect(
    coPage.locator(
      `.claim-home-comparables-container :text-is("${projectName}")`,
    ),
  ).toBeVisible();
  
  // Hover on Model mygeniusprice tooltip
  await coPage
    .locator(
      `div[width="min-content"]:has(div ~ div:has-text("Model mygeniusprice")) button`,
    )
    .hover();
  
  // Ensure the tooltip for Model mygeniusprice is accurate
  await expect(
    coPage
      .locator(`div`)
      .filter({ hasText: `Personalized property value` })
      .nth(2),
  ).toHaveText(
    `Personalized property value estimate based on our homegeniusIQ® technology that analyses the home condition based on property images and your changes or updates to the property details.`,
  );
  
  // Hover on Model mygeniusprice tooltip
  await coPage
    .locator(
      `div[width="6.375rem"]:has(div ~ div:has-text("mygeniusprice")) button`,
    )
    .hover();
  
  // Ensure the tooltip for Model mygeniusprice is accurate
  await expect(
    coPage
      .locator(`div`)
      .filter({ hasText: `Personalized property value` })
      .nth(1),
  ).toHaveText(
    `Personalized property value estimate based on our homegeniusIQ® technology that analyses the home condition based on property images and your changes or updates to the property details.`,
  );
  
  // Click the "Done" button
  await coPage.getByRole(`button`, { name: `Done` }).click();
  
  // Click the "Done" button
  await coPage.getByRole(`button`, { name: `Done` }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert the Model Price is updated based on Comparable Properties
  await expect(
    coPage.locator(`div:has(div:text-is("Model mygeniusprice®")) > p:text("$")`),
  ).not.toHaveText(modelPrice);
  
  // Assert mygeniusprice is the same
  await expect(
    coPage.locator(`div:has(div:text-is("mygeniusprice®")) > p:text("$")`),
  ).toHaveText(mygeniusPrice);
  
  // Assert the additional half bathroom is visible
  await expect(coPage.getByText(`+ 0.5 Bath`)).toBeVisible();
  
  // Assert the Comparables View is visible
  await expect(coPage.locator(`#CLAIMED_VIEW_COMPARABLES`)).toBeVisible();
  
  // Assert there are 5 Comparables visible
  await expect(
    coPage.locator(
      `#CLAIMED_VIEW_COMPARABLES .card-media-container :text-is("A")`,
    ),
  ).toBeVisible();
  await expect(
    coPage.locator(
      `#CLAIMED_VIEW_COMPARABLES .card-media-container :text-is("B")`,
    ),
  ).toBeVisible();
  await expect(
    coPage.locator(
      `#CLAIMED_VIEW_COMPARABLES .card-media-container :text-is("C")`,
    ),
  ).toBeVisible();
  await expect(
    coPage.locator(
      `#CLAIMED_VIEW_COMPARABLES .card-media-container :text-is("D")`,
    ),
  ).toBeVisible();
  await expect(
    coPage.locator(
      `#CLAIMED_VIEW_COMPARABLES .card-media-container :text-is("E")`,
    ),
  ).toBeVisible();
  
  // Assert the Project Name
  await expect(coPage.getByText(projectName)).toBeVisible();
  
  // Assert "Renovation Studio"
  await expect(
    coPage.getByText(`RENOVATION STUDIO`, { exact: true }),
  ).toBeVisible();
  
  //--------------------------------
  // Clean Up:
  //--------------------------------
  // Unclaim Property in main page
  try {
    await unclaimProperty(page, searchAddress);
  } catch (error) {
    console.log(error);
  }
  
  // Unclaim Property in Co-Brand page
  try {
    await unclaimProperty(coPage, searchAddress);
  } catch (error) {
    console.log(error);
  }
  
});