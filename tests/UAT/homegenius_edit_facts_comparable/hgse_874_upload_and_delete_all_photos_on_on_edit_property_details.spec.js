const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_874_upload_and_delete_all_photos_on_on_edit_property_details", async () => {
 // Step 1. HGSE-874 - Upload photos on on edit property details and close modal to assert photos still there
  // Unable to get this test to pass in a suite of even less than 10 wfs
  
  // Constants and Helpers
  const filePaths = [
    // `/root/team-storage/uploadImage14.jpg`,
    `/home/wolf/team-storage/uploadImage15.jpg`,
    `/home/wolf/team-storage/uploadImage16.jpg`,
    `/home/wolf/team-storage/uploadImage17.jpg`,
    `/home/wolf/team-storage/uploadImage18.jpg`,
    `/home/wolf/team-storage/uploadImage19.jpg`,
    `/home/wolf/team-storage/uploadImage20.jpg`,
    `/home/wolf/team-storage/uploadImage21.jpg`,
    `/home/wolf/team-storage/uploadImage22.jpg`,
    `/home/wolf/team-storage/uploadImage23.jpg`,
    `/home/wolf/team-storage/uploadImage24.jpg`,
    `/home/wolf/team-storage/uploadImage25.jpg`,
    `/home/wolf/team-storage/uploadImage28.jpg`,
    `/home/wolf/team-storage/uploadImage38.jpg`,
    `/home/wolf/team-storage/uploadImage40.jpg`,
  ];
  
  const chosenFiles = [];
  const randomUploadNumber = faker.datatype.number({
    min: 2,
    max: filePaths.length,
  });
  
  for (let i = 0; i < randomUploadNumber; i++) {
    chosenFiles.push(filePaths[i]);
  }
  const elementSelector = `a:has-text("click to browse")`;
  
  const property = {
    searchAddress: "912 Penshore Terrace, Glendale, CA 91207",
    // addressLineOne: "912 Penshore Terrace",
    addressLineOne: "Glendale, CA 91207",
    city: "Glendale",
    state: "CA",
    zip: "91207",
  };
  
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  // Log in user
  const { page, context, browser } = await logInHomegeniusUser();
  
  // Clean up if needed
  try {
    await unclaimProperty(page, property);
  } catch (e) {
    console.log(e);
  }
  
  //--------------------------------
  // Act and Assert:
  //--------------------------------
  
  //--------------------------------------Step 1------------------------------------
  //--------------------------------------------------------------------------------
  
  // Click on Claim a Home
  await page
    .locator(`[data-testid="undecorate"] #nav-hyperlink-Claim\\ a\\ Home`)
    .click();
  
  // Fill in Address
  await page
    .locator(`[placeholder="Enter an Address"]`)
    .first()
    .fill(property.searchAddress, { delay: 50 });
  
  await expect(async () => {
    // Click the search bar until we see the results
    await page
      .locator(`[placeholder="Enter an Address"]`)
      .first()
      .click({ timeout: 10_000 });
  
    // Expect the search results to appear
    await expect(page.locator(`ul li:visible`).first()).toBeVisible({
      timeout: 10_000,
    });
  }).toPass({ timeout: 60_000 });
  
  // Click on Claim
  await page
    .locator(`li:has-text("${property.addressLineOne}")`)
    .first()
    .click({ delay: 1000 });
  
  //--------------------------------------Step 2------------------------------------
  //--------------------------------------------------------------------------------
  
  // Click on I own this home
  await page.locator(`#Own`).click();
  
  // Click on Yes, add it to my profile
  await page.locator(`button:text("Yes, add it to my profile")`).click();
  
  // Pause for the modal to load
  await page.waitForTimeout(4000);
  
  //--------------------------------------Step 3------------------------------------
  //--------------------------------------------------------------------------------
  
  // Upload Images
  await uploadMultipleImages(page, elementSelector, chosenFiles);
  
  // Assert that we see the spinning loader for the images
  await expect(page.locator(`[class="loader"]`)).toHaveCount(randomUploadNumber);
  await expect(page.locator(`[class="loader"]`).last()).not.toBeVisible(); // Wait until we have
  
  // Gray box will show photos are being added - BLOCKER
  
  // Pause for the modal to load
  await page.waitForTimeout(4000);
  
  //--------------------------------------Step 4------------------------------------
  //--------------------------------------------------------------------------------
  
  // Click the "X" button
  await page
    .locator(
      `div:has(>p:has-text("${property.addressLineOne}")) + div span:text-is("close")`,
    )
    .click({ delay: 1000 });
  
  //--------------------------------------Step 5------------------------------------
  //--------------------------------------------------------------------------------
  
  // Click "Confirm"
  await page
    .locator(
      `button:text-is("Continue Editing") + button:text-is("Close"):visible`,
    )
    .click({ delay: 1000 });
  
  //--------------------------------------Step 6------------------------------------
  //--------------------------------------------------------------------------------
  
  // Click "Edit"
  await page.reload();
  await page.locator(`button:has-text("Edit")`).first().click({ delay: 1000 });
  
  // Click "Continue"
  await page.locator(`button:has-text("Continue")`).click({ delay: 1000 });
  
  // Assert that there are "x" number of pictures
  await expect(page.locator(`[id="photoinput"] li`)).toHaveCount(
    randomUploadNumber,
  );
  
  //--------------------------------------Step 7------------------------------------
  //--------------------------------------------------------------------------------
  
  // Click the "X" button
  await page
    .locator(
      `div:has(>p:has-text("${property.addressLineOne}")) + div span:text-is("close")`,
    )
    .click({ delay: 1000 });
  
  // Click "Confirm"
  await page
    .locator(
      `button:text-is("Continue Editing") + button:text-is("Close"):visible`,
    )
    .click({ delay: 1000 });
  
  // Refresh the page
  await page.reload();
  
  // Click "Edit"
  await page.reload();
  await page.locator(`button:has-text("Edit")`).first().click({ delay: 1000 });
  
  // Click "Continue"
  await page.locator(`button:has-text("Continue")`).click({ delay: 1000 });
  
  // Assert that there are "x" number of pictures
  await expect(page.locator(`[id="photoinput"] li`)).toHaveCount(
    randomUploadNumber,
  );
  
  // Click "Calculate"
  await page.locator(`button:has-text("Calculate")`).click({ delay: 1000 });
  
  // ---------------------
  // Assert
  // ---------------------
  // Wait for the modal to dissapear
  await expect(
    page.locator(`:text("Processing updates and calculating mygeniusprice")`),
  ).not.toBeVisible({ timeout: 2 * 120_000 });
  
  // Assert that "MyGeniusPrice" is calculated - i.e. not equal to the other price
  const amount = await page.locator(`div[height="initial"] + div h6`).innerText();
  
  // Pattern to match a dollar sign followed by a number
  const dollarNumberRegex = /^\$\d{1,3}(,\d{3})*(\.\d{2})?$/;
  
  // Assert that the text matches the regex pattern
  expect(amount).toMatch(dollarNumberRegex);
  
 // Step 2. Delete All photos on on edit property details
  //--------------------------------
  // Arrange:
  //--------------------------------
  // N/A
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  //--------------------------------------Step 8------------------------------------
  //--------------------------------------------------------------------------------
  
  // Click "Delete" or Delete all button
  await page.locator(`a:has-text("Delete")`).click({delay:1000})
  
  // Click "Delete" or Delete all button
  await page.locator(`a:has-text("Delete All")`).click({delay:1000})
  
  // Click "Confirm"
  await page.locator(`button:has-text("Confirm")`).click({delay:1000})
  
  // Pause for UI to update
  await page.waitForTimeout(3000)
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // Assert that uploaded photos are deleted
  expect(await page.locator(`[id="photoinput"] li`).count()).toBe(0)
  
  //--------------------------------------Step 9------------------------------------
  //--------------------------------------------------------------------------------
  
  // Close the overlay
  await page.locator(`//*[@id='__next']/main/div[3]/div/button[1]/span/span`).click();
  
  // Exit modal through "Skip and Close"
  await page.locator(`button:has-text("Skip and Close")`).click()
  await page.locator(`div:has-text("Confirm Exit") + div + div button:has-text("Close"):visible`).click()
  
  // Open modal again
  await page.locator(`button:has-text("Edit")`).first().click();
  await page.locator(`button:has-text("Continue")`).click();
  
  // Verifiy pictures are not displaying in the modal
  expect(await page.locator(`[id="photoinput"] li`).count()).toBe(0)
  
  //--------------------------------
  // Clean up:
  //--------------------------------
  
  try {
    await expect(async () => {
      // Exit modal through "Skip and Close"
      await page.getByRole(`button`, { name: `close`, exact: true }).click();
      await page.getByRole(`button`, { name: `Close`, exact: true }).click();
  
    }).toPass({timeout:120_000})
  
    // Clean up if needed
    await unclaimProperty (page, property)
  
  } catch {
    console.log("Cleanup failed")
  }
});