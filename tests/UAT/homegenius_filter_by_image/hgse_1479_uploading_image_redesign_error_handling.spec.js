import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_1479_uploading_image_redesign_error_handling", async () => {
 // Step 1. HGSE-1479: Uploading Image Redesign- incorrect file type
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const mlsNumber = "879876";
  
  // Login to Homeogenius UAT-Portal
  const { page, context } = await logInHomegeniusUser();
  
  await goToSearchPage(page, mlsNumber);
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Click on Search with AI
  await page.locator(`button:has-text("SEARCH WITH AI")`).click();
  
  // Click on Search with My Photos
  await page.getByText(`Search with My Photos`).click();
  
  const elementSelector = `[id="instructions-text"]`;
  const filePath = `/home/wolf/team-storage/homegenius_code_05_10_24.json`;
  
  // Drag and Drop File
  await dragAndDropFile(page, elementSelector, filePath);
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert error
  await expect(
    page.locator(`div:text("Invalid file type(s). Please use jpeg, png or jpg")`),
  ).toBeVisible();
  
 // Step 2. image not related to bath bed or kitchen
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const filePath2 = `/home/wolf/team-storage/blurred-terrace-entrance.jpg`;
  
  // Reload Page
  await page.reload();
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Click on Search With AI
  await page.locator(`button:has-text("SEARCH WITH AI")`).click();
  
  // Click on Search with My Photos
  await page.getByText(`Search with My Photos`).click();
  
  // Drag and Drop File
  await dragAndDropFile(page, elementSelector, filePath2);
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert error
  await expect(
    page.locator(
      `div:text("Unable to identify filters for one or more of the images selected.")`,
    ),
  ).toBeVisible();
  
 // Step 3. one valid image, one invalid image, one wrong type
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const filePaths = [
    `/home/wolf/team-storage/homegenius_code_05_10_24.json`,
    `/home/wolf/team-storage/blurred-terrace-entrance.jpg`,
    `/home/wolf/team-storage/bedroom.jpg`,
  ];
  const { readFile } = await import("node:fs/promises");
  
  // Reload Page
  await page.reload();
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Click on Search With AI
  await page.locator(`button:has-text("SEARCH WITH AI")`).click();
  
  // Click on Search with My Photos
  await page.getByText(`Search with My Photos`).click();
  
  // Drag and Drop all Files at once
  await uploadMultipleImages(page, elementSelector, filePaths);
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert Error Messages and Successful upload message
  await expect(
    page.locator(
      `p:text("Unable to identify filters for one or more of the images selected.")`,
    ),
  ).toBeVisible();
  await expect(
    page.locator(
      `p:text("Your images have been successfully uploaded! homegeniusIQ has identified new filters that will be applied to your search.")`,
    ),
  ).toBeVisible();
  await expect(
    page.locator(
      `p:text("Invalid file type(s) for some selected files. Please use jpeg, png or jpg")`,
    ),
  ).toBeVisible();
  
 // Step 4. image size larger than 54mb
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const filePath3 = `/home/wolf/team-storage/56mb.jpg`;
  
  // Reload Page
  await page.reload();
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Click on Search With AI
  await page.locator(`button:has-text("SEARCH WITH AI")`).click();
  
  // Click on Search with My Photos
  await page.getByText(`Search with My Photos`).click();
  
  // Upload the file
  await dragAndDropFile(page, elementSelector, filePath3)
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert error
  await expect(
    page.locator(`div:text("File size(s) cannot exceed 54MB")`),
  ).toBeVisible();
  
});