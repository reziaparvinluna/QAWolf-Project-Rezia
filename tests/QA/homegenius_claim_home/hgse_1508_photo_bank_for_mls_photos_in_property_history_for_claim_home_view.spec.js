const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser } = require("../../../lib/node_20_helpers");

test("hgse_1508_photo_bank_for_mls_photos_in_property_history_for_claim_home_view", async () => {
 // Step 1. HGSE-1508 - Photo Bank for MLS Photos in Property History for Claim Home View
  //--------------------------------
  // Arrange:
  //--------------------------------
  const searchAddress = {
    searchAddress: "2819 Coconut Ave, Miami, FL 33133",
    addressLineOne: "2819 Coconut Ave",
    addressLineTwo: "Miami, FL 33133"
  }
  
  // Log in with default user
  const {page, context} = await logInHomegeniusUser();
  //--------------------------------
  // Act:
  //--------------------------------
  // Clean up - unclaim a property
  try {
    await unclaimProperty(page, searchAddress);
  } catch (err) {
    console.log(err)
  }
  
  // Click on Claim a Home
  await page.locator(`[data-testid="undecorate"] #nav-hyperlink-Claim\\ a\\ Home`).click();
  
  // Fill in Address
  await page.locator(`[placeholder="Enter an Address"]`).first().fill(searchAddress.searchAddress);
  
  // Click on Claim
  await page.locator(`li:has-text("${searchAddress.addressLineOne}")`).first().click();
  
  // Click on I own this home
  await page.locator(`#Own`).click({timeout: 10_000});
  
  // Click on Yes, add it to my profile
  await page.locator(`button:text("Yes, add it to my profile")`).click(); 
  
  // Close the helper modal
  await page.waitForSelector(`button:text("Skip and Close")`);
  await page.locator(`main button span span:text("close")`).last().click({delay: 5000});
  
  // Click on Skip and Close
  await page.locator(`button:text("Skip and Close")`).click();
  
  // Soft Assert property was successfully claimed
  await expect(page.locator(`p:text("This property has been successfully claimed.")`)).toBeVisible();
  await expect(page.locator(`p:text("Now that it is claimed, you can come back and make edits later.")`)).toBeVisible();
  
  // Close the modal
  await page.locator(`button:text("Close")`).click();
  
  // Click on Property History
  await page.locator(`button:text("Property History")`).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Click on a transaction with hgIQ
  await page.locator(`[id="DetailsTransactionLine"] + div:has(svg):visible`).first().click();
  
  // Assert Image shows on right
  expect(await page.locator(`[class*="PhotosContainer"] img`).count()).toBeGreaterThan(0);
  // Hover over image and assert white border with shade around the photo
  await page.locator(`[class*="HistoryRoomConditionImageContainer"]`).first().hover();
  await expect(
    page.locator(`[class*="HistoryRoomConditionImageContainer"]`).first()
  ).toHaveCSS('box-shadow', 'rgba(0, 0, 0, 0.2) 0px 2px 12px 0px')
  await expect(
    page.locator(`[class*="HistoryRoomConditionImageContainer"]`).first()
  ).toHaveCSS('border', '1px solid rgb(255, 255, 255)')
  
  // Assert there's a number in the image and it's greater than 0
  const imageNum = await page.locator(`[class*="HistoryRoomConditionImageContainer"] p`).first().innerText();
  expect(Number(imageNum)).toBeGreaterThan(0);
  
  // Add assertion for the condition score
  await expect(
    page.locator('[class*="HistoryRoomConditionImageContainer"] + div').first()
  ).toHaveScreenshot("conditionScore", { maxDiffPixelRatio: 0.01 });
  
  // Click on a transaction without hgIQ
  await page.locator(`[id="DetailsTransactionLine"] + div:not(:has(svg))`).first().click();
  
  // Assert there are no Images
  expect(await page.locator(`[class*="PhotosContainer"] img`).count()).toEqual(0);
  // Assert display message "No photos available for this transaction"
  await expect(page.locator(`div:text("No photos available for this transaction")`)).toBeVisible();
  
});