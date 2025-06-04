import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_872_verify_header_for_properties_with_no_geniusprice_available", async () => {
 // Step 1. HGSE-872: Verify header for properties with no geniusprice available
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  // This is a market property that has no geniusPrice header
  const searchAddress = {
    searchAddress: "1163 Cherry Street Ext, Wellsboro, PA 16901",
    searchAddr2: "1163 Cherry Street Ext",
    addressLineOne: "1163 Cherry St",
    addressLineTwo: "Wellsboro, PA 16901",
    propertyType: "Single Family",
    bed: "4",
    bath: "2",
  };
  
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
  // Claim a property that has no geniusprice available verify header on edit filters page
  // 1163 Cherry Street Ext, Wellsboro, PA 16901
  // soft assert geniusprice in the header should be displaying Insufficient data or Unavailable
  
  // Claim Property
  await claimProperty(page, searchAddress);
  
  // Step 2
  // hover over caution icon
  const cautionSymbol = page.locator(`span:text-is("warning")`);
  await cautionSymbol.hover();
  
  // tooltip should be displayed
  await expect(
    page.locator(
      `div:text("The display of the geniusprice has been disabled at the request of the Seller.")`,
    ),
  ).toBeVisible();
  // Step 3
  // go to Comparables page
  // geniusprice in the header should be displaying Insufficient data or Unavailable
  
  // Click the 'Comparables Properties' button
  await page.getByRole(`button`, { name: `Comparables Properties` }).click();
  // Click the 'Select' button
  await page.getByRole(`button`, { name: `Select` }).click();
  // Assert the page has text 'Unavailable'
  await expect(page.getByText(`Unavailable`).first()).toBeVisible();
  
  
  // Step 4
  // hover over caution icon
  await page.getByRole(`button`, { name: `warning` }).nth(1).hover();
  // tooltip should be displayed
  await expect(
    page.locator(
      `div:text("The display of the geniusprice has been disabled at the request of the Seller.")`,
    ),
  ).toBeVisible();
  
  // await page.evaluate(() => {
  //   debugger;
  // });
  // Step 5
  // SElect comparables and click Calculate
  // WF --- in progress -> need comparables page to load comparables
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Verify header still displays Insufficient Data or Unavailable
  
  // Step 6
  // Click Back button, edit data and click Calculate
  
  // Verify Header still display insufficient data or Unavailable
  
});