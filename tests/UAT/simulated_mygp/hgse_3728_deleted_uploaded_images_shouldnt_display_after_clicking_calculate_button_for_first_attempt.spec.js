import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_3728_deleted_uploaded_images_shouldnt_display_after_clicking_calculate_button_for_first_attempt", async () => {
 // Step 1. HGSE-3728 Deleted uploaded Images shouldn't display after clicking Calculate button for first attempt
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  // This is an on market property
  const searchAddress = {
    searchAddress: "8 Lantern Lane, Wayne, PA 19087",
    searchAddr2: "8 Lantern Lane",
    addressLineOne: "8 Lantern Ln",
    addressLineTwo: "Wayne, PA 19087",
    propertyType: "Single Family",
    bed: "2",
    bath: "2.5",
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
  
  for (let i = 0; i < 15; i++) {
    // wait 5 seconds between each upload
    await expect(page.locator(`.loader`).first()).not.toBeVisible({
      timeout: 30_000,
    });
    // await page.waitForTimeout(5_000);
    if (i === 0) {
      await dragAndDropFile(page, `:text("Click to browse")`, filePath);
      await expect(page.locator(`.loader`).first()).toBeVisible();
    } else {
      await dragAndDropFile(page, `:text("cloud_upload")`, filePath);
      await expect(page.locator(`.loader`).first()).toBeVisible();
    }
  }
  // Click the 'Delete' text button to delete all the pictures
  await page.getByText(`deleteDelete`).click();
  // Click the 'deleteDelete All' text
  await page.getByText(`deleteDelete All`).click();
  // Click the 'Confirm' button
  await page.getByRole(`button`, { name: `Confirm` }).click();
  
  // Click the 'Calculate' button
  await page.getByRole(`button`, { name: `Calculate` }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // Assert that no images are present in the edit page -> we will see the cloud
  await expect(page.getByText(`cloud_uploadDrag and drop`)).toBeVisible();
  
  // Close the modal
  // Click the 'Skip and Close' button
  await page.getByRole(`button`, { name: `Skip and Close` }).click();
  // Click the 'Close' button
  await page.getByRole(`button`, { name: `Close`, exact: true }).click();
  
  // Assert the page has text 'Add PhotosUpload' -> no photos will be present
  await expect(page.getByText(`Add PhotosUpload`)).toBeVisible();
  
  // ---- CLEAN UP ----
  // Click the 'Delete' button
  await page.getByRole(`button`, { name: `Delete` }).click();
  // Click the 'Delete' button
  await page.getByRole(`button`, { name: `Delete` }).nth(1).click();
  
  try {
    await unclaimProperty(page, searchAddress);
  } catch (error) {
    console.log(error);
  }
  
});