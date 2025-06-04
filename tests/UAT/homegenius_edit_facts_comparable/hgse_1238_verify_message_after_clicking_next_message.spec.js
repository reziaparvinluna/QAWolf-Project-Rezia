const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_1238_verify_message_after_clicking_next_message", async () => {
 // Step 1. HGSE-1238: Verify Message After Clicking Next Message
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const searchAddress = {
    searchAddress: "4940 Pinebrook Drive, Fort Wayne, IN 46804",
    searchAddr2: "4940 Pinebrook Dr",
    addressLineOne: "4940 Pinebrook Dr",
    addressLineTwo: "Fort Wayne, IN 46804",
    addressAssert: "4940 Pinebrook Dr",
    addressAssert2: "Fort Wayne, IN 46804",
  };
  
  const elementSelector = `[accept="image/jpeg,.jpg,.jpeg,image/png,.png"]`;
  const filePath1 = [`/home/wolf/team-storage/room1.jpg`];
  const filePath2 = [
    `/home/wolf/team-storage/room1.jpg`,
    `/home/wolf/team-storage/room2.jpg`,
  ];
  
  // Login to Homeogenius UAT-Portal
  const { page } = await logInHomegeniusUser();
  
  // Clean Up
  try {
    await unclaimProperty(page, searchAddress);
  } catch (error) {
    console.log(error);
  }
  
  // Claim the property
  await claimProperty(page, searchAddress);
  
  //--------------------------------
  // Act:
  //--------------------------------
  // 1
  // Claim home on edit data page click next button
  // property should have all required data
  // "Processing updates to the property" message should display
  // comparables page should open
  
  // Click on Edit for Your Home Facts
  await page.getByRole(`button`, { name: `edit Edit` }).click({delay: 3000});
  
  // Click Continue
  await page.getByRole(`button`, { name: `Continue` }).click({delay: 3000});
  
  // Click on Next
  await page.getByRole(`button`, { name: `Next` }).click({delay: 3000});
  
  // Assert "Processing updates to the property
  await expect(
    page.getByText(`Processing updates to the property`),
  ).toBeVisible();
  
  // Wait for loader to disappear
  await page.waitForSelector(".loader", { state: "hidden" });
  
  // 2
  // Click back button edit property dna and click Next
  // "Processing updates to the property" message should display
  // comparables page should open
  
  // Click on Back
  await page.getByRole(`button`, { name: `Back`, exact: true }).click({delay: 3000});
  
  // Change property type
  await page
    .locator(`#select-input-caret-span-propertyType`)
    .getByText(`expand_more`)
    .click();
  
  // Click on Single Family
  await page.getByRole(`button`, { name: `Single Family` }).click({delay: 3000});
  
  // Click on Next
  await page.getByRole(`button`, { name: `Next` }).click({delay: 3000});
  
  // Assert "Processing updates to the property
  await expect(
    page.getByText(`Processing updates to the property`),
  ).toBeVisible();
  
  // Wait for loader to disappear
  await page.waitForSelector(".loader", { state: "hidden" });
  
  // 3
  // Click back button upload photo and click next
  // The following message should appear with a spinner: "Processing updates to the property"
  // if the user has also added photos this message should also appear:
  // "Analyzing photos and processing updates to the property"
  // comparables page should open
  
  // Click on Back
  await page.getByRole(`button`, { name: `Back`, exact: true }).click({delay: 3000});
  
  // Upload Images
  await uploadMultipleImages(page, elementSelector, filePath1);
  
  // Click on Next
  await page.getByRole(`button`, { name: `Next` }).click({delay: 3000});
  
  // Assert "Analyzing photos and processing updates to the property
  await expect(
    page.getByText(`Analyzing photos and processing updates to the property`),
  ).toBeVisible();
  
  // Assert "Processing updates to the property
  await expect(
    page.getByText(`Processing updates to the property.`, { exact: true }),
  ).toBeVisible();
  
  // Wait for loader to disappear
  await page.waitForSelector(".loader", { state: "hidden" });
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // 4
  // Click back button upload more photos and edit property dna
  // The following message should appear with a spinner: "Processing updates to the property"
  // if the user has also added photos this message should also appear:
  // "Analyzing photos and processing updates to the property"
  // comparables page should open
  
  // Click on Back
  await page.getByRole(`button`, { name: `Back`, exact: true }).click({delay: 3000});
  
  // Upload more pictures
  await uploadMultipleImages(page, elementSelector, filePath2);
  
  // Click on Next
  await page.getByRole(`button`, { name: `Next` }).click({delay: 3000});
  
  // Assert "Analyzing photos and processing updates to the property
  await expect(
    page.getByText(`Analyzing photos and processing updates to the property`),
  ).toBeVisible();
  
  // Assert "Processing updates to the property
  await expect(
    page.getByText(`Processing updates to the property.`, { exact: true }),
  ).toBeVisible();
  
  // Wait for loader to disappear
  await page.waitForSelector(".loader", { state: "hidden" });
  
  // Clean Up
  // Close the modal
  await page.getByRole(`button`, { name: `close` }).click({delay: 3000});
  
  // Click on Close
  await page.getByRole(`button`, { name: `Close`, exact: true }).click();
  
  // Unclaim property
  try {
    await unclaimProperty(page, searchAddress);
  } catch (error) {
    console.log(error);
  }
});