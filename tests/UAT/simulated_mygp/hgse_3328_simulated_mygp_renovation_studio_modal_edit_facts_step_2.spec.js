const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_3328_simulated_mygp_renovation_studio_modal_edit_facts_step_2", async () => {
 // Step 1. HGSE-3328 Simulated mygp: Renovation Studio Modal Edit Facts (Step 2) HGSE-3328 Simulated mygp: Renovation Studio Modal Edit Facts (Step 2)
  //--------------------------------
  // Arrange:
  //--------------------------------
  // This is an on market property
  const searchAddress = {
    searchAddress: "102 Rock Rose Lane, Wayne, PA 19087",
    searchAddr2: "102 Rock Rose Lane",
    addressLineOne: "102 Rock Rose Ln",
    addressLineTwo: "Wayne, PA 19087",
    propertyType: "Single Family",
    bed: "5",
    bath: "3.5",
  };
  
  const projectName = "Project-HGSE-3171";
  const projectNotes = projectName + faker.random.words(15);
  
  // 1
  // Login to https://qa-portal.homegeniusrealestate.com/
  // https://qa-portal.homegeniusrealestate.com/ is launched
  const { page, context } = await logInHomegeniusUser();
  
  // Clean Up
  try {
    await unclaimProperty(page, searchAddress);
  } catch (error) {
    console.log(error);
  }
  
  // Claim Property
  await claimProperty(page, searchAddress);
  
  // Submit Home Edits to turn on simulated mygp
  const homeFacts = await triggerSimMyGp(page);
  
  // Grab the mygeniusprice for later assertion
  const myGeniusPrice = await page
    .locator('div:has(p:text("mygeniusprice")) + div h6:has-text("$")')
    .innerText();
  
  // Click on Get Started
  await page.getByRole(`button`, { name: `Get Started` }).first().click();
  
  // Fill in Project Name
  await page
    .locator(`div:has(p:text("Project Name")) + textarea`)
    .fill(projectName);
  
  // Fill in Project Notes
  await page
    .locator(`div:has(p:text("Project Notes (Optional)")) + textarea`)
    .fill(projectNotes);
  
  //--------------------------------
  // Act:
  //--------------------------------
  // 2
  // Navigate and select SAVE and Continue of the Renovation Studio modal
  // The simulated mygeniusprice modal for editing facts and adding photos is open
  
  // Click on Save and Continue
  await page.getByRole(`button`, { name: `Save and Continue` }).click();
  
  // Click on Enter Renovation Details to open simulated mygeniusprice modal
  await page.getByRole(`button`, { name: `Enter Renovation Details` }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // 3
  // This modal must be a complete replica of the existing edit facts modal
  // with the following changes:
  // >Modal title: RENOVATION STUDIO
  // >Modal title: RENOVATION STUDIO is displayed
  
  // Assert Renovation Studio header on modal
  await expect(page.locator(`form`).getByText(`RENOVATION STUDIO`)).toBeVisible();
  
  // 4
  // Header: Project Name that was entered in Step 1
  // >Below header copy: "Edit the home facts based on any ideas you have for
  // renovations or remodels and upload inspirational photos from your vision
  // board! The information below is based on third party data sources, public
  // records and estimates based on the local area."
  
  // Assert project name on header
  await expect(page.locator(`form`).getByText(projectName)).toBeVisible();
  
  // Asset description under header
  await expect(
    page.getByText(
      `Edit the home facts based on any ideas you have for renovations or remodels and upload inspirational photos from your vision board! The information below is based on third party data sources, public records and estimates based on the local area.`,
    ),
  ).toBeVisible();
  
  // 5
  // Top Right value:
  // Must display actual mygeniusprice value and label for that claimed home. Exisiting tool-tip for
  // (Note: Actual mygeniusprice = the 1 mygeniusprice that is the first mygeniusprice created for that claimed home,
  // not the simulated value)
  // Displayed actual mygeniusprice value and label for that claimed home. Exisiting tool-tip for mygeniusprice
  
  // Assert myGeniusPrice on the modal
  await expect(page.getByRole(`heading`, { name: myGeniusPrice })).toBeVisible();
  await expect(page.getByText(`mygeniusprice®`, { exact: true })).toBeVisible();
  
  // Assert tooltip on hover
  await page.locator(`button span:text("info")`).first().hover();
  await expect(
    page.locator(`div:text("Personalized property value estimate based")`),
  ).toBeVisible();
  
  // 6
  // The bottom right will display Model mygeniusprice with new tool-tip
  // The bottom right displayed Model mygeniusprice with new tool-tip.
  
  // Assert Model mygeniusprice
  await expect(
    page.getByText(`Model mygeniusprice®`, { exact: true }),
  ).toBeVisible();
  
  // Assert tooltip on hover
  await page.locator(`button span:text("info")`).last().hover();
  await expect(
    page.locator(`div:text("Personalized property value estimate based")`),
  ).toBeVisible();
  
  // 7
  // All values and photos entered will be its own instance of for generating a new Model
  // mygeniusprice (simulated mygeniusprice).
  // >Home Facts will be pre-populated with data edits made from the actual mygeniusprice.
  // >Photos will not be pre-populated
  // >Home Facts is pre-populated with data edits made from the actual mygeniusprice.
  // >Photos are not pre-populated
  
  // Assert Home Facts on Renovation Studio modal
  expect(await page.locator(`#propertyType`).inputValue()).toBe(
    homeFacts.propertyType,
  );
  expect(await page.locator(`#bedroom #bedroom`).inputValue()).toBe(
    homeFacts.bedroom,
  );
  expect(await page.locator(`#yearBuilt`).inputValue()).toBe(homeFacts.yearBuilt);
  expect(await page.locator(`#sqft`).inputValue()).toBe(homeFacts.sqft);
  expect(await page.locator(`#garage #garage`).inputValue()).toBe(
    homeFacts.garage,
  );
  // Change lot size type to acres
  await page.locator(`#select-input-caret-span-lotSizeType`).getByText(`expand_more`).click();
  await page.getByRole(`button`, { name: `Acres` }).click();
  
  expect(await page.locator(`#lotSizeInAcres`).inputValue()).toBe(
    homeFacts.lotSizeInAcres,
  );
  expect(await page.locator(`#fullBath #fullBath`).inputValue()).toBe(
    homeFacts.fullBath,
  );
  expect(
    await page.locator(`#threeFourthBath #threeFourthBath`).inputValue(),
  ).toBe(homeFacts.threeFourthBath);
  expect(await page.locator(`#halfBath #halfBath`).inputValue()).toBe(
    homeFacts.halfBath,
  );
  expect(await page.locator(`#oneFourthBath #oneFourthBath`).inputValue()).toBe(
    homeFacts.oneFourthBath,
  );
  
  // Assert photo is empty
  await expect(
    page.locator(
      `[role="presentation"] div:has([accept="image/jpeg,.jpg,.jpeg,image/png,.png"])`,
    ),
  ).toHaveScreenshot("renovationStudioPhoto", { maxDiffPixelRatio: 0.01 });
  
  // Click on Next
  await page.getByRole(`button`, { name: `Next` }).click();
  
  // Wait for loader to complete
  await expect(page.locator(`.loader`).first()).toBeVisible();
  await expect(page.locator(`.loader`).first()).not.toBeVisible();
  
  // 8
  // There will be a back button. Selecting back will take the user back to step 1.
  // Selecting Back and coming back to this screen will keep the data edits that were made.
  // Back button is present, selecting back took the user to back to step 1
  // >Selecting Back and coming back to this screen kept the data edits that were made.
  
  // Assert Back button
  await expect(page.getByRole(`button`, { name: `Back` })).toBeVisible();
  
  // Click on Back Button
  await page.getByRole(`button`, { name: `Back` }).click();
  
  // 9
  // Label for the photo section: Upload Inspirational Photos (optional)
  // Label for the photo section: Upload Inspirational Photos (optional)
  
  // Assert Label
  await expect(
    page.getByText(`Upload Inspirational Photos (optional)`),
  ).toBeVisible();
  
  // 10
  // Selecting Next will take the user to step 3 of the modal
  // Selecting Next took the user to step 3 of the modal
  
  // Assert Next Button
  await expect(page.getByRole(`button`, { name: `Next` })).toBeVisible();
  
  // Click on Next Button
  await page.getByRole(`button`, { name: `Next` }).click();
  
  // Wait for loader to complete
  await expect(page.locator(`.loader`).first()).toBeVisible();
  await expect(page.locator(`.loader`).first()).not.toBeVisible();
  
  // 11
  // Selecting 'X' will bring up a window as presented
  // Confirm Exit window is displayed
  
  // Click on X
  await page.waitForTimeout(5000);
  await page.getByRole(`button`, { name: `close` }).click();
  
  // Assert Confirm Exit modal
  await expect(page.getByText(`Confirm Exit`)).toBeVisible();
  
  // Assert Confirm Exit modal message
  await expect(page.getByText(`This renovation has been`)).toBeVisible();
  await expect(page.getByText(`You can come back and make`)).toBeVisible();
  
  // Click on Close
  await page.getByRole(`button`, { name: `Close`, exact: true }).click();
  
  // Clean Up
  try {
    await unclaimProperty(page, searchAddress);
  } catch (error) {
    console.log(error);
  }
  
 // Step 2. HGSE-3328 Simulated mygp: Renovation Studio Modal Edit Facts (Step 2) HGSE-3328 Simulated mygp: Renovation Studio Modal Edit Facts (Step 2) Co-branding site
  //--------------------------------
  // Arrange:
  //--------------------------------
  // 12
  // Modal must adjust on desktop versions and per co-branding settings coming from Admin Portal
  // Above functionalities should work as expected in desktop versions and cobranded sites
  
  const { page: coPage } = await logInHomegeniusUser({
    url: "https://uat-portal.homegeniusrealestate.com/headertest1/claim-a-home",
  });
  
  // Clean Up
  try {
    await unclaimProperty(coPage, searchAddress);
  } catch (error) {
    console.log(error);
  }
  
  // Claim Property
  await claimProperty(coPage, searchAddress);
  
  // Submit Home Edits to turn on simulated mygp
  const homeFacts2 = await triggerSimMyGp(coPage);
  
  // Grab the mygeniusprice for later assertion
  const myGeniusPrice2 = await coPage
    .locator('div:has(p:text("mygeniusprice")) + div h6:has-text("$")')
    .innerText();
  
  // Click on Get Started
  await coPage.getByRole(`button`, { name: `Get Started` }).first().click();
  
  // Fill in Project Name
  await coPage
    .locator(`div:has(p:text("Project Name")) + textarea`)
    .fill(projectName);
  
  // Fill in Project Notes
  await coPage
    .locator(`div:has(p:text("Project Notes (Optional)")) + textarea`)
    .fill(projectNotes);
  
  //--------------------------------
  // Act:
  //--------------------------------
  // 2
  // Navigate and select SAVE and Continue of the Renovation Studio modal
  // The simulated mygeniusprice modal for editing facts and adding photos is open
  
  // Click on Save and Continue
  await coPage.getByRole(`button`, { name: `Save and Continue` }).click();
  
  // Click on Enter Renovation Details to open simulated mygeniusprice modal
  await coPage.getByRole(`button`, { name: `Enter Renovation Details` }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // 3
  // This modal must be a complete replica of the existing edit facts modal
  // with the following changes:
  // >Modal title: RENOVATION STUDIO
  // >Modal title: RENOVATION STUDIO is displayed
  
  // Assert Renovation Studio header on modal
  await expect(
    coPage.locator(`form`).getByText(`RENOVATION STUDIO`),
  ).toBeVisible();
  
  // 4
  // Header: Project Name that was entered in Step 1
  // >Below header copy: "Edit the home facts based on any ideas you have for
  // renovations or remodels and upload inspirational photos from your vision
  // board! The information below is based on third party data sources, public
  // records and estimates based on the local area."
  
  // Assert project name on header
  await expect(coPage.locator(`form`).getByText(projectName)).toBeVisible();
  
  // Asset description under header
  await expect(
    coPage.getByText(
      `Edit the home facts based on any ideas you have for renovations or remodels and upload inspirational photos from your vision board! The information below is based on third party data sources, public records and estimates based on the local area.`,
    ),
  ).toBeVisible();
  
  // 5
  // Top Right value:
  // Must display actual mygeniusprice value and label for that claimed home. Exisiting tool-tip for
  // (Note: Actual mygeniusprice = the 1 mygeniusprice that is the first mygeniusprice created for that claimed home,
  // not the simulated value)
  // Displayed actual mygeniusprice value and label for that claimed home. Exisiting tool-tip for mygeniusprice
  
  // Assert myGeniusPrice on the modal
  await expect(
    coPage.getByRole(`heading`, { name: myGeniusPrice }),
  ).toBeVisible();
  await expect(
    coPage.getByText(`mygeniusprice®`, { exact: true }),
  ).toBeVisible();
  
  // Assert tooltip on hover
  await coPage.locator(`button span:text("info")`).first().hover();
  await expect(
    coPage.locator(`div:text("Personalized property value estimate based")`),
  ).toBeVisible();
  
  // 6
  // The bottom right will display Model mygeniusprice with new tool-tip
  // The bottom right displayed Model mygeniusprice with new tool-tip.
  
  // Assert Model mygeniusprice
  await expect(
    coPage.getByText(`Model mygeniusprice®`, { exact: true }),
  ).toBeVisible();
  
  // Assert tooltip on hover
  await coPage.locator(`button span:text("info")`).last().hover();
  await expect(
    coPage.locator(`div:text("Personalized property value estimate based")`),
  ).toBeVisible();
  
  // 7
  // All values and photos entered will be its own instance of for generating a new Model
  // mygeniusprice (simulated mygeniusprice).
  // >Home Facts will be pre-populated with data edits made from the actual mygeniusprice.
  // >Photos will not be pre-populated
  // >Home Facts is pre-populated with data edits made from the actual mygeniusprice.
  // >Photos are not pre-populated
  
  // Assert Home Facts on Renovation Studio modal
  expect(await coPage.locator(`#propertyType`).inputValue()).toBe(
    homeFacts2.propertyType,
  );
  expect(await coPage.locator(`#bedroom #bedroom`).inputValue()).toBe(
    homeFacts2.bedroom,
  );
  expect(await coPage.locator(`#yearBuilt`).inputValue()).toBe(
    homeFacts2.yearBuilt,
  );
  expect(await coPage.locator(`#sqft`).inputValue()).toBe(homeFacts2.sqft);
  expect(await coPage.locator(`#garage #garage`).inputValue()).toBe(
    homeFacts2.garage,
  );
  
  // Change lot size type to acres
  await coPage.locator(`#select-input-caret-span-lotSizeType`).getByText(`expand_more`).click();
  await coPage.getByRole(`button`, { name: `Acres` }).click();
  
  expect(await coPage.locator(`#lotSizeInAcres`).inputValue()).toBe(
    homeFacts2.lotSizeInAcres,
  );
  expect(await coPage.locator(`#fullBath #fullBath`).inputValue()).toBe(
    homeFacts2.fullBath,
  );
  expect(
    await coPage.locator(`#threeFourthBath #threeFourthBath`).inputValue(),
  ).toBe(homeFacts2.threeFourthBath);
  expect(await coPage.locator(`#halfBath #halfBath`).inputValue()).toBe(
    homeFacts2.halfBath,
  );
  expect(await coPage.locator(`#oneFourthBath #oneFourthBath`).inputValue()).toBe(
    homeFacts2.oneFourthBath,
  );
  
  // Assert photo is empty
  await expect(
    coPage.locator(
      `[role="presentation"] div:has([accept="image/jpeg,.jpg,.jpeg,image/png,.png"])`,
    ),
  ).toHaveScreenshot("renovationStudioPhoto2", { maxDiffPixelRatio: 0.01 });
  
  // Click on Next
  await coPage.getByRole(`button`, { name: `Next` }).click();
  
  // Wait for loader to complete
  await expect(coPage.locator(`.loader`).first()).toBeVisible();
  await expect(coPage.locator(`.loader`).first()).not.toBeVisible();
  
  // 8
  // There will be a back button. Selecting back will take the user back to step 1.
  // Selecting Back and coming back to this screen will keep the data edits that were made.
  // Back button is present, selecting back took the user to back to step 1
  // >Selecting Back and coming back to this screen kept the data edits that were made.
  
  // Assert Back button
  await expect(coPage.getByRole(`button`, { name: `Back` })).toBeVisible();
  
  // Click on Back Button
  await coPage.getByRole(`button`, { name: `Back` }).click();
  
  // 9
  // Label for the photo section: Upload Inspirational Photos (optional)
  // Label for the photo section: Upload Inspirational Photos (optional)
  
  // Assert Label
  await expect(
    coPage.getByText(`Upload Inspirational Photos (optional)`),
  ).toBeVisible();
  
  // 10
  // Selecting Next will take the user to step 3 of the modal
  // Selecting Next took the user to step 3 of the modal
  
  // Assert Next Button
  await expect(coPage.getByRole(`button`, { name: `Next` })).toBeVisible();
  
  // Click on Next Button
  await coPage.getByRole(`button`, { name: `Next` }).click();
  
  // Wait for loader to complete
  await expect(coPage.locator(`.loader`).first()).toBeVisible();
  await expect(coPage.locator(`.loader`).first()).not.toBeVisible();
  
  // 11
  // Selecting 'X' will bring up a window as presented
  // Confirm Exit window is displayed
  
  // Click on X
  await page.waitForTimeout(5000);
  await coPage.getByRole(`button`, { name: `close` }).click();
  
  // Assert Confirm Exit modal
  await expect(coPage.getByText(`Confirm Exit`)).toBeVisible();
  
  // Assert Confirm Exit modal message
  await expect(coPage.getByText(`This renovation has been`)).toBeVisible();
  await expect(coPage.getByText(`You can come back and make`)).toBeVisible();
  
  // Click on Close
  await coPage.getByRole(`button`, { name: `Close`, exact: true }).click();
  
  // Clean Up
  try {
    await unclaimProperty(coPage, searchAddress);
  } catch (error) {
    console.log(error);
  }
  
});