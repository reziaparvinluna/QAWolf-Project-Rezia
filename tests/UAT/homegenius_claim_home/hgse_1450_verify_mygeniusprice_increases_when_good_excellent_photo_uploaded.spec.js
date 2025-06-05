const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius, claimProperty, uploadMultipleImages} = require("../../../lib/node_20_helpers");

test("hgse_1450_verify_mygeniusprice_increases_when_good_excellent_photo_uploaded", async () => {
 // Step 1. HGSE-1450: Verify mygeniusprice increases when good/excellent photo uploaded
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  // This is an on market property
  const searchAddress = {
    searchAddress: "572 Cricket Lane, Wayne, PA 19087",
    searchAddr2: "572 Cricket Lane",
    addressLineOne: "572 Cricket Ln",
    addressLineTwo: "Wayne, PA 19087",
    propertyType: "Single Family",
    bed: "4",
    bath: "3.5",
  }
  
  // Constants
  const filePaths = [
    `/home/wolf/team-storage/room1.png`,
    // `/home/wolf/team-storage/room2.jpg`,
    // `/home/wolf/team-storage/room3.jpg`,
  ];
  const elementSelector = `a:text("Click to browse")`;
  
  // Login
  const {page, context} = await logInHomegeniusUser();
  
  // Clean Up
  try {
    await unclaimProperty(page, searchAddress)
  } catch (error) {
    console.log(error)
  }
  //--------------------------------
  // Act:
  //--------------------------------
  // Step 1 
  // search for a property 
  // property page will open
  
  // Step 2
  // claim a property 
  await claimProperty(page, searchAddress)
  
  // Click on Edit on Home Facts
  await page.getByRole(`button`, { name: `edit Edit` }).click({delay: 10_000});
  
  // Click on Continue
  await page.getByRole(`button`, { name: `Continue` }).click({delay: 3000});
  
  // and upload good/excellent room photo and click Calculate 
  
  // Upload images
  await uploadMultipleImages(page, elementSelector, filePaths);
  
  // Click on Calculate
  await page.getByRole(`button`, { name: `Calculate` }).click({delay: 3000});
  
  // Assert Loader appears and disappears
  await expect(page.locator(`.loader`).first()).toBeVisible();
  await expect(page.locator(`.loader`).first()).not.toBeVisible();
  
  // Grab the geniusprice and mygeniusprice
  const gPrice = await page.locator(`form h6 >> nth=0`).innerText();
  const myGPrice = await page.locator(`form h6 >> nth=1`).innerText();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // verify mygeniusprice higher than geniusprice
  expect(Number(myGPrice.replace(/[$,]/g, ""))).toBeGreaterThan(
    Number(gPrice.replace(/[$,]/g, ""))
  );
  
  
});