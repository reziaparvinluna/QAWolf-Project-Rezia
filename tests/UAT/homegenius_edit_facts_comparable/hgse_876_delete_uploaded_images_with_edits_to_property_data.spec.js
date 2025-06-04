import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_876_delete_uploaded_images_with_edits_to_property_data", async () => {
 // Step 1. HGSE-876: Delete uploaded images with Edits to property data
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
  
  // Information for picture 1
  const fileName = "avatar.png";
  const filePath = `/home/wolf/files/${fileName}`;
  
  // Information for picture 2
  const fileName2 = "large.jpg";
  const filePath2 = `/home/wolf/files/${fileName2}`;
  
  // An Array that holds all the different file paths we want to add
  const filesToUpload = [filePath, filePath2];
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Login to the homegenius page as a user
  const { page, context } = await logInHomegeniusUser();
  
  // ---- CLEAN UP  ----
  try {
    await unclaimProperty(page, searchAddress);
  } catch (error) {
    console.log(error);
  }
  
  // Step 1  -- CLAIM A PROPERTY
  // Claim Property
  await claimProperty(page, searchAddress);
  
  // Edit some Home Facts
  // Click the 'Edit' button for 'Home Facts'
  await page.getByRole(`button`, { name: `edit Edit` }).click();
  
  // Click the 'Continue' button in the warning modal
  await page.getByRole(`button`, { name: `Continue` }).click();
  
  // Click the drop down for "Property Type"
  await page
    .locator(`#select-input-caret-span-propertyType`)
    .getByText(`expand_more`)
    .click();
  
  // Click the 'Single Family' button
  await page.getByRole(`button`, { name: `Single Family` }).click();
  
  // Step 2
  //  Upload a 5 photos
  
  for (let i = 0; i < filesToUpload.length; i++) {
    const currPath = filesToUpload[i];
    // The gray box will show with a gray border to show photos are being added
    // wait 5 seconds between each upload
    // There is a spinner showing for each photos being uploaded
    await expect(page.locator(`.loader`).first()).not.toBeVisible({
      timeout: 30_000,
    });
  
    // if we are uplading first, we will see "click to browse"
    if (i === 0) {
      await dragAndDropFile(page, `:text("Click to browse")`, currPath);
      await expect(page.locator(`.loader`).first()).toBeVisible();
    } else {
      await dragAndDropFile(page, `:text("cloud_upload")`, currPath);
      await expect(page.locator(`.loader`).first()).toBeVisible();
    }
  }
  
  // Step 3
  // Select Delete above the photos
  // Delete all and Done buttons will be displayed
  // Click the 'delete' text above the photos
  await page.getByText(`deleteDelete`).click();
  
  // --- soft assert that each image has a red x icon to delete it ----
  for (let i = 0; i < filesToUpload.length; i++) {
    // red  white X circle button will be displayed on each  uploaded photo
    // Click the 'close' button
    await expect(
      page.locator(`#photoinput`).getByRole(`button`, { name: `close` }).nth(i),
    ).toBeVisible();
  }
  
  // Step 4
  // Click X button on an image
  await page
    .locator(`#photoinput`)
    .getByRole(`button`, { name: `close` })
    .nth(1)
    .click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // selected images will be deleted and edited Home Facts will remain as edited
  // Assert the first image was not deleted
  await expect(
    page.locator(`#photoinput`).getByRole(`button`, { name: `close` }).nth(0),
  ).toBeVisible();
  // Assert the last image was deleted
  await expect(
    page.locator(`#photoinput`).getByRole(`button`, { name: `close` }).nth(1),
  ).not.toBeVisible();
  
  // Assert the 'Single Family Home' text is still visible
  await expect(page.locator(`#propertyType`)).toBeVisible();
  await expect(page.locator(`#propertyType`)).toHaveScreenshot(
    "singleFamilyHome",
    { maxDiffPixelRatio: 0.05 },
  );
  
  // Step 5
  // All the photos will be deleted and edited Home Facts will remain as edited
  // Click the 'Delete All' text
  await page.getByText(`deleteDelete All`).click();
  // Click the 'Confirm' button in the modal
  await page.getByRole(`button`, { name: `Confirm` }).click();
  
  // Assert the propertyType is still visible
  await expect(page.locator(`#propertyType`)).toBeVisible();
  // Assert the image is no longer visible
  await expect(
    page.locator(`#photoinput`).getByRole(`button`, { name: `close` }).nth(0),
  ).not.toBeVisible();
  // Assert the edits are still visible
  await expect(page.locator(`#propertyType`)).toHaveScreenshot(
    "singleFamilyHome",
    { maxDiffPixelRatio: 0.05 },
  );
  
  // ---- CLEAN UP  ----
  try {
    await unclaimProperty(page, searchAddress);
  } catch (error) {
    console.log(error);
  }
  
});