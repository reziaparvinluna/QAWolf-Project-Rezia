import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_1612_verify_hg_iq_for_rooms_with_low_confidence_score", async () => {
 // Step 1. HGSE-1612: Verify hgIQ for Rooms with Low Confidence Score
  //--------------------------------
  // Arrange:
  //--------------------------------
  const searchAddress = {
    searchAddress: "9256 Galway Road, Boulder, CO 80303",
    searchAddr2: "9256 Galway Rd",
    addressLineOne: "9256 Galway Rd",
    addressLineOneFormatted: "9256 Galway Road",
    addressLineTwo: "Boulder, CO 80303",
    propertyType: "single family",
    bed: "3",
    bath: "1",
    sqft: "1,092",
    gar: "1",
    yr: "1976"
  }
  
  // Login to Homeogenius UAT-Portal
  const {page,context} = await logInHomegeniusUser({slowMo: 1000})
  
  // Clean up - unclaim a property
  await unclaimProperty (page, searchAddress)
  
  // Click "claim a home"
  await page.locator(`[data-testid="undecorate"] #nav-hyperlink-Find\\ a\\ Home`).click();
  
  // Search mlsNumber
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]:visible`).first().fill(searchAddress.searchAddress);
  
  // Wait for search to load properly
  await page.waitForSelector(`div ul li:visible`)
  
  // Click the correct result
  await page.locator(`li:visible p:has-text("${searchAddress.searchAddr2}")`).first().click({delay:3000})
  
  // Assert that the addr appears on the page
  await page.waitForTimeout(8000);
  await expect(page.locator(`p:has-text("${searchAddress.addressLineOneFormatted}")`)).toBeVisible()
  
  //--------------------------------
  // Act:
  //--------------------------------
  try {
    // Click "Claim Home"
    await page.locator(`p`).filter({ hasText: /^Claim Home$/ }).click();
  } catch (e){
    console.log(e)
  }
  
  // Claim property
  await page.locator(`div`).filter({ hasText: /^I own this home$/ }).first().click();
  await page.locator(`button:has-text("yes, add it to my profile"):visible`).click()
  
  // Close claim
  await page.locator(`button span.material-icons.md-24:has-text("close"):visible`).first().click();
  // await page.locator(`button:text("Skip and Close"):visible`).click();
  await page.locator(`button:text("close")`).click({ timeout: 60 * 1000 });
  await page.locator(`button:text("close")`).click();
  
  // Go to property history
  await page.reload();
  await page.locator(`button:text("Property History")`).click();
  await page.waitForTimeout(2000);
  
  // Select transaction on 04/17/24
  await page.getByText(`06/01/16`).first().click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Hover on tooltips of low hgIQ and shows warning
  await page.locator(`button span.material-icons.md-16:has-text("warning") `).nth(1).hover();
  await expect(page.locator(`:text("hgIQ is unable to provide an accurate room condition with the photos available")`)).toBeVisible()
  await page.locator(`button span.material-icons.md-16:has-text("warning") `).last().hover();
  await expect(page.locator(`:text("hgIQ is unable to provide an accurate room condition with the photos available")`)).toBeVisible()
  
  // Click on first low hgIQ and pictures
  await page.locator(`div[width="100%"]:has-text("Exterior Front")+div.HistoryRoomConditionImageContainer`).click();
  await page.locator(`h6:has-text("Exterior Front") + div button span.material-icons.md-16:has-text("warning"):visible`).hover();
  await expect(page.locator(`:text("hgIQ is unable to provide an accurate room condition with the photos available")`)).toBeVisible()
  
  // CLose
  await page.locator(`.PropertyHistoryPhotoModalHeaderContainer button:has-text("close")`).click();
  
  // Clean up - unclaim a property
  await unclaimProperty (page, searchAddress)
});