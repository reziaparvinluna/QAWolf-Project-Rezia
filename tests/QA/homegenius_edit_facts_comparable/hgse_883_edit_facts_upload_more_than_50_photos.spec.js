const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, unclaimProperty } = require("../../../lib/node_20_helpers");

test("hgse_883_edit_facts_upload_more_than_50_photos", async () => {
 // Step 1. HGSE-883 - Edit Facts. Upload more than 50 photos.
  // Constants and Helpers
  const elementSelector = `a:has-text("click to browse")`;
  const filePaths = [];
  for (let i = 1; i < 52; i++) {
    filePaths.push(`/home/wolf/team-storage/uploadImage${i}.jpg`);
  }
  
  const property = {
    searchAddress: "2901 S Bayshor DR APT 14E, Miami, FL 33133",
    addressLineOne: "2901 S Bayshore DR APT 14 E",
    city: "Miami",
    state: "FL",
    zip: "33133",
  };
  
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Log in user
  const { page, context, browser } = await logInHomegeniusUser();
  
  // Clean up if needed
  await unclaimProperty(page, property);
  
  // Claim a property
  await claimProperty(page, property);
  
  //--------------------------------
  // Act:
  //--------------------------------
  await page.waitForTimeout(10000)
  // Click "Upload"
  await page.locator(`button:has-text("Upload")`).click();
  
  // Upload Images
  await uploadMultipleImages(page, elementSelector, filePaths);
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert that only 50 images were allowed to be uploaded
  await expect(page.locator(`[data-nimg="1"]`)).toHaveCount(50, {
    timeout: 60 * 1000,
  });
  
  // Assert the upload button is disabled
  await expect(page.locator(`.material-icons-outlined.css-g1wamy`)).toBeVisible();
  
  // Assert that the cloud icon is gray
  await expect(
    page.locator(`span:text-is("cloud_upload"):visible`),
  ).toHaveScreenshot("disabled-upload.png", {
    // if file name changes, update this assertion
    maxDiffPixelRatio: 0.1,
  });
  
  //--------------------------------
  // Clean up:
  //--------------------------------
  // Go back to the home page
  await page.goto(process.env.URL_HOMEGENIUS);
  
  // Clean up if needed
  await unclaimProperty(page, property);
  
});