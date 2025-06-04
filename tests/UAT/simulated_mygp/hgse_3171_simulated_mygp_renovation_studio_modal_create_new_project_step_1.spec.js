import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_3171_simulated_mygp_renovation_studio_modal_create_new_project_step_1", async () => {
 // Step 1. HGSE-3171 Simulated mygp: Renovation Studio Modal Create New Project (Step 1)
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  // This is an on market property
  const searchAddress = {
    searchAddress: "8 Lantern Lane, Wayne, PA 19087",
    searchAddr2: "8 Lantern Lane",
    addressLineOne: "8 Lantern Ln",
    addressLineTwo: "Wayne, PA 19087",
    propertyType: "Single Family",
    bed: "2",
    bath: "2.5",
  }
  
  const projectName = "Project-HGSE-3171";
  const projectNotes = projectName + faker.random.words(15);
  
  // 1
  // Login into Application with valid credentials
  
  // https://qa-portal.homegeniusrealestate.com/claim-a-home
  // https://uat-portal.homegeniusrealestate.com/claim-a-home
  // User should be on Claim a Home Page with Account menu activated
  const {page, context} = await logInHomegeniusUser()
  
  // Clean Up
  try {
    await unclaimProperty(page, searchAddress)
  } catch (error) {
    console.log(error)
  }
  
  // Claim Property
  await claimProperty(page, searchAddress);
  
  // Submit Home Edits to turn on simulated mygp
  await triggerSimMyGp(page);
  
  //--------------------------------
  // Act:
  //--------------------------------
  // 2
  // Choose to create a new simulated mygeniusprice renovation 
  // Select to Get Started for first renovation
  // or
  // Add a new renovation to existing ones
  // Figma:
  // https://www.figma.com/design/uMkkPq4kPyyxJwQN2mUB3j/Simulated-geniusprice?node-id=1526-123727&node-type=section&t=410F0uPSQgrx9RUL-0
  // User should be able to see a modal as the first step 
  // that he/she can enter Project Name and Project Notes so that he/she 
  // can have an easy way to track his/her renovations. 
  // User should be able to see a modal pop-up for Renovation Studio and 
  // the screen behind it is grayed out, within the modal user should see
  // Title: Renovation Studio
  // To the right (X) Icon should be there, selecting this will close the 
  // modal and not save any changes, takes user back to the originating screen
  
  // Click on Get Started
  await page.getByRole(`button`, { name: `Get Started` }).first().click();
  
  // 3
  // Have a look at the Body text on the mygp renovation modal
  // Body text should be:
  // "Dreaming of your next home renovation? Make edits to your home facts, 
  // upload inspirational photos and select new comparables to see an estimated 
  // future home value!"
  
  // Assert Renovation Studio Modal heading
  await expect(page.getByRole(`heading`, { name: `Renovation Studio` })).toBeVisible();
  
  // Assert Renovation Studio Modal message
  await expect(page.getByText(
    `Dreaming of your next home renovation? Make edits to your home facts, upload inspirational photos and select new comparables to see an estimated future home value!`)
  ).toBeVisible();
  
  // 4
  // Validation for Project Name field
  // Project Name field should have the following criteria:
  // a. String type: Alphanumeric
  // b. Required (It's a required field)
  // c. Duplicate Project Names are allowed
  
  // 5
  // Validation for Project Notes (Optional)
  // Project Notes (Optional) should have the following criteria:
  // a. Memo type: Alphanumeric
  // b. Optional (It's a optional field)
  // c. This will not be an expandable box, but rather continue to expand 
  // height-wise as the user begins to type more than the first line.
  
  // 6
  // Click on Project Name
  // Click on Project Note for "Renovation Studio"
  // Renovation Studio>
  // >Cursor should be showing up when clicking on Project >Name and Project Note fields
  
  // Click on Project Name
  await page.locator(
    `div:has(p:text("Project Name")) + textarea`
  ).click();
  await expect(page.locator(
    `div:has(p:text("Project Name")) + textarea`
  )).toHaveCSS('cursor', 'text')
  
  // Click on Project Notes
  await page.locator(
    `div:has(p:text("Project Notes (Optional)")) + textarea`
  ).click();
  await expect(page.locator(
    `div:has(p:text("Project Notes (Optional)")) + textarea`
  )).toHaveCSS('cursor', 'text')
  
  // 9
  // Check the Error State
  // Error State:
   
  // If the user selects Save and Continue and a required field Project Name is empty, 
  // then keep the modal open and highlight the Required field (in red) with message 
  // directly below "Name Required" update for disabling/enabling
  // This requirement has been changed now. Dec 2024
  // Without putting the Project Name, user can not see the "Save & Continue" button active.
  
  // Assert the Save and Continue button is disabled when Project Name is not filled
  await expect(page.locator(
    `button:has-text("Save and Continue")`
  )).toBeDisabled();
  
  // Fill in Project Name
  await page.locator(`div:has(p:text("Project Name")) + textarea`).fill(projectName);
  
  // Assert the Save and Continue button is enabled when Project Name is filled
  await expect(page.locator(
    `button:has-text("Save and Continue")`
  )).toBeEnabled();
  
  // Fill in Project Notes
  await page.locator(
    `div:has(p:text("Project Notes (Optional)")) + textarea`
  ).fill(projectNotes);
  
  
  // 7
  // Select Cancel link
  // Selecting this Cancel will close the modal and not save any changes, 
  // takes user back to the originating screen
  
  // Click on Cancel
  await page.getByRole(`button`, { name: `Cancel` }).click();
  
  // Assert Renovation Studio Modal heading is not visible
  await expect(page.getByRole(
    `heading`, { name: `Renovation Studio` }
  )).not.toBeVisible();
  
  // Assert Renovation Studio Modal message is not visible
  await expect(page.getByText(
    `Dreaming of your next home renovation? Make edits to your home facts, upload inspirational photos and select new comparables to see an estimated future home value!`)
  ).not.toBeVisible();
  
  // 8
  // Select Save and Continue Button
  // Save and Continue button should always be enabled. Selecting this 
  // will save changes and go to Step 2
  // (HGE-2349)
  
  // Click on Get Started
  await page.getByRole(`button`, { name: `Get Started` }).first().click();
  
  // Fill in Project Name
  await page.locator(`div:has(p:text("Project Name")) + textarea`).fill(projectName);
  
  // Fill in Project Notes
  await page.locator(
    `div:has(p:text("Project Notes (Optional)")) + textarea`
  ).fill(projectNotes);
  
  // click on Save and Continue
  await page.getByRole(`button`, { name: `Save and Continue` }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert Project Name
  await expect(page.getByText(projectName, { exact: true })).toBeVisible();
  
  // Assert Project Notes
  await expect(page.getByText(projectNotes)).toBeVisible();
  
  // Click on Delete
  await page.getByRole(`button`, { name: `Delete` }).click();
  
  // Click on Delete on the modal
  await page.getByRole(`button`, { name: `Delete` }).nth(1).click();
  
  
  
 // Step 2. HGSE-3171 Simulated mygp: Renovation Studio Modal Create New Project (Step 1) Co-branding site
  //--------------------------------
  // Arrange:
  //--------------------------------
  // 10
  // Login into Co-branding site with valid credentials
  // https://qa-portal.homegeniusrealestate.com/headertest1/claim-a-home
  // https://uat-portal.homegeniusrealestate.com/headertest1/claim-a-home
  // https://qa-portal.homegeniusrealestate.com/flheadertest/find-a-home
  // https://uat-portal.homegeniusrealestate.com/flheadertest/find-a-home
  // Modal must adjust per co-branding settings coming from Admin Portal
  
  const { page: coPage } = await logInHomegeniusUser({
    url: 'https://uat-portal.homegeniusrealestate.com/headertest1/claim-a-home'
  })
  
  // Clean Up
  try {
    await unclaimProperty(coPage, searchAddress)
  } catch (error) {
    console.log(error)
  }
  
  // Claim property
  await claimProperty(coPage, searchAddress);
  
  // Submit Home Edits to turn on simulated mygp
  await triggerSimMyGp(coPage);
  
  //--------------------------------
  // Act:
  //--------------------------------
  // 2
  // Choose to create a new simulated mygeniusprice renovation 
  // Select to Get Started for first renovation
  // or
  // Add a new renovation to existing ones
  // Figma:
  // https://www.figma.com/design/uMkkPq4kPyyxJwQN2mUB3j/Simulated-geniusprice?node-id=1526-123727&node-type=section&t=410F0uPSQgrx9RUL-0
  // User should be able to see a modal as the first step 
  // that he/she can enter Project Name and Project Notes so that he/she 
  // can have an easy way to track his/her renovations. 
  // User should be able to see a modal pop-up for Renovation Studio and 
  // the screen behind it is grayed out, within the modal user should see
  // Title: Renovation Studio
  // To the right (X) Icon should be there, selecting this will close the 
  // modal and not save any changes, takes user back to the originating screen
  
  // Click on Get Started
  await coPage.getByRole(`button`, { name: `Get Started` }).first().click();
  
  // 3
  // Have a look at the Body text on the mygp renovation modal
  // Body text should be:
  // "Dreaming of your next home renovation? Make edits to your home facts, 
  // upload inspirational photos and select new comparables to see an estimated 
  // future home value!"
  
  // Assert Renovation Studio Modal heading
  await expect(coPage.getByRole(`heading`, { name: `Renovation Studio` })).toBeVisible();
  
  // Assert Renovation Studio Modal message
  await expect(coPage.getByText(
    `Dreaming of your next home renovation? Make edits to your home facts, upload inspirational photos and select new comparables to see an estimated future home value!`)
  ).toBeVisible();
  
  // 4
  // Validation for Project Name field
  // Project Name field should have the following criteria:
  // a. String type: Alphanumeric
  // b. Required (It's a required field)
  // c. Duplicate Project Names are allowed
  
  // 5
  // Validation for Project Notes (Optional)
  // Project Notes (Optional) should have the following criteria:
  // a. Memo type: Alphanumeric
  // b. Optional (It's a optional field)
  // c. This will not be an expandable box, but rather continue to expand 
  // height-wise as the user begins to type more than the first line.
  
  // 6
  // Click on Project Name
  // Click on Project Note for "Renovation Studio"
  // Renovation Studio>
  // >Cursor should be showing up when clicking on Project >Name and Project Note fields
  
  // Click on Project Name
  await coPage.locator(
    `div:has(p:text("Project Name")) + textarea`
  ).click();
  await expect(coPage.locator(
    `div:has(p:text("Project Name")) + textarea`
  )).toHaveCSS('cursor', 'text')
  
  // Click on Project Notes
  await coPage.locator(
    `div:has(p:text("Project Notes (Optional)")) + textarea`
  ).click();
  await expect(coPage.locator(
    `div:has(p:text("Project Notes (Optional)")) + textarea`
  )).toHaveCSS('cursor', 'text')
  
  // 9
  // Check the Error State
  // Error State:
   
  // If the user selects Save and Continue and a required field Project Name is empty, 
  // then keep the modal open and highlight the Required field (in red) with message 
  // directly below "Name Required" update for disabling/enabling
  // This requirement has been changed now. Dec 2024
  // Without putting the Project Name, user can not see the "Save & Continue" button active.
  
  // Assert the Save and Continue button is disabled when Project Name is not filled
  await expect(coPage.locator(
    `button:has-text("Save and Continue")`
  )).toBeDisabled();
  
  // Fill in Project Name
  await coPage.locator(`div:has(p:text("Project Name")) + textarea`).fill(projectName);
  
  // Assert the Save and Continue button is enabled when Project Name is filled
  await expect(coPage.locator(
    `button:has-text("Save and Continue")`
  )).toBeEnabled();
  
  // Fill in Project Notes
  await coPage.locator(
    `div:has(p:text("Project Notes (Optional)")) + textarea`
  ).fill(projectNotes);
  
  
  // 7
  // Select Cancel link
  // Selecting this Cancel will close the modal and not save any changes, 
  // takes user back to the originating screen
  
  // Click on Cancel
  await coPage.getByRole(`button`, { name: `Cancel` }).click();
  
  // Assert Renovation Studio Modal heading is not visible
  await expect(coPage.getByRole(
    `heading`, { name: `Renovation Studio` }
  )).not.toBeVisible();
  
  // Assert Renovation Studio Modal message is not visible
  await expect(coPage.getByText(
    `Dreaming of your next home renovation? Make edits to your home facts, upload inspirational photos and select new comparables to see an estimated future home value!`)
  ).not.toBeVisible();
  
  // 8
  // Select Save and Continue Button
  // Save and Continue button should always be enabled. Selecting this 
  // will save changes and go to Step 2
  // (HGE-2349)
  
  // Click on Get Started
  await coPage.getByRole(`button`, { name: `Get Started` }).first().click();
  
  // Fill in Project Name
  await coPage.locator(`div:has(p:text("Project Name")) + textarea`).fill(projectName);
  
  // Fill in Project Notes
  await coPage.locator(
    `div:has(p:text("Project Notes (Optional)")) + textarea`
  ).fill(projectNotes);
  
  // click on Save and Continue
  await coPage.getByRole(`button`, { name: `Save and Continue` }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert Project Name
  await expect(coPage.getByText(projectName, { exact: true })).toBeVisible();
  
  // Assert Project Notes
  await expect(coPage.getByText(projectNotes)).toBeVisible();
  
  // Click on Delete
  await coPage.getByRole(`button`, { name: `Delete` }).click();
  
  // Click on Delete on the modal
  await coPage.getByRole(`button`, { name: `Delete` }).nth(1).click();
  
  
});