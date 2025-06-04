const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_484_verify_upload_photo_search_room_tabs_selectors_when_multiple_photo_uploaded", async () => {
 // Step 1. HGSE-484: [Verify Upload Photo Search] Room tabs/selectors when multiple photo uploaded
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const filePaths = [
    `/home/wolf/team-storage/room3.jpg`,
    `/home/wolf/team-storage/kitchen.jpeg`,
    `/home/wolf/team-storage/uploadImage17.jpg`,
  ];
  const elementSelector = `#instructions-text`;
  
  // Step 1 
  // login 
  const { page, context } = await logInHomegeniusUser()
  
  // Go to search page
  await goToSearchPage(page);
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Step 2 
  // Upload 3 Photos on "Search with AI" -> "Search with My Photos"
  
  // Click on Search with AI
  await page.getByRole(`button`, { name: `SEARCH WITH AI` }).click();
  
  // Click on Search with My Photos
  await page.getByText(`Search with My Photos`).click();
  
  // Input 1-Kitchen Photo
  // Input 2-Bedroom Photo
  // Input 3-Bathroom Photo
  
  // Upload Images
  await uploadMultipleImages(page, elementSelector, filePaths);
  
  // Step 3 
  // Click Button 'Apply'
  await page.getByRole(`button`, { name: `Apply` }).click();
  
  // Click on Search with AI
  await page.getByRole(`button`, { name: `SEARCH WITH AI` }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Step 4 
  // Verify tab Selected  
  // BATHROOM / BEDROOM / KITCHEN
  
  // Assert tabs
  await expect(page.getByRole(`button`, { name: `Kitchen` })).toBeVisible();
  await expect(page.getByRole(`button`, { name: `Bedroom` })).toBeVisible();
  await expect(page.getByRole(`button`, { name: `Bathroom` })).toBeVisible();
  
  // Step 5 
  // Click Tab Kitchen
  // It should select Kitchen Tab and able to view Cancel Icon (X) on the photo.
  // It should display kitchen scan image
  
  // Click on Kitchen Tab
  await page.getByRole(`button`, { name: `Kitchen` }).click();
  
  // Assert Kitchen Image
  await expect(async () => {
    await expect(page.locator(
      `div:has(div:text("Describe Features")) img`
    )).toHaveScreenshot('HGSE484-Kitchen', {maxDiffPixelRatio: 0.01})
  }).toPass({timeout: 30_000})
  
  // Hover over image and assert delete button
  await expect(async () => {
    await page.locator(`div:has(div:text("Describe Features")) img`).hover();
    await expect(page.locator(
      `[id="delete-embeded-batch-icon-btn"]`
    )).toBeVisible({timeout: 5000});
  }).toPass({timeout: 30_000})
  
  // Step 6 
  // Click Tab Bedroom
  // It should select Bedroom and able to view Cancel Icon (X) on the photo.
  // It should display bedroom scan image
  
  // Click on Bedroom Tab
  await page.getByRole(`button`, { name: `Bedroom` }).click();
  
  // Assert Bedroom Image
  await expect(async () => {
    await expect(page.locator(
      `div:has(div:text("Describe Features")) img`
    )).toHaveScreenshot('HGSE484-Bedroom', {maxDiffPixelRatio: 0.01})
  }).toPass({timeout: 30_000})
  
  // Hover over image and assert delete button
  await expect(async () => {
    await page.locator(`div:has(div:text("Describe Features")) img`).hover();
    await expect(page.locator(
      `[id="delete-embeded-batch-icon-btn"]`
    )).toBeVisible({timeout: 5000});
  }).toPass({timeout: 30_000})
  
  // Step 7 
  // Click Tab Bathroom
  // It should select Bathroom and able to view Cancel Icon (X) on the photo.
  // It should display bathroom scan image
  
  // Click on Bathroom Tab
  await page.getByRole(`button`, { name: `Bathroom` }).click();
  
  // Assert Bathroom Image
  await expect(async () => {
    await expect(page.locator(
      `div:has(div:text("Describe Features")) img`
    )).toHaveScreenshot('HGSE484-Bathroom', {maxDiffPixelRatio: 0.01})
  }).toPass({timeout: 30_000})
  
  // Hover over image and assert delete button
  await expect(async () => {
    await page.locator(`div:has(div:text("Describe Features")) img`).hover();
    await expect(page.locator(
      `[id="delete-embeded-batch-icon-btn"]`
    )).toBeVisible({timeout: 5000});
  }).toPass({timeout: 30_000})
  
  
});