import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_1512_lightbox_validation", async () => {
 // Step 1. HGSE-1512 - Lightbox Validation
  //--------------------------------
  // Arrange:
  //--------------------------------
  const searchAddress = {
    searchAddress: "9013 Holmes Ave, Los Angeles, CA 90002",
    addressLineOne: "9013 Holmes Ave",
    addressLineTwo: "Los Angeles, CA 90002"
  }
  
  // Log in with default user
  const {page, context} = await logInHomegeniusUser();
  
  // Clean up - unclaim a property
  try {
    await unclaimProperty(page, searchAddress);
  } catch (err) {
    console.log(err)
  }
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Click on Claim a Home
  await page.locator(`[data-testid="undecorate"] #nav-hyperlink-Claim\\ a\\ Home`).click();
  
  // Fill in Address
  await page.locator(`[placeholder="Enter an Address"]`).first().fill(searchAddress.searchAddress);
  
  // // Click the "Enter an Address" combobox
  // await page.getByRole(`combobox`, { name: `Enter an Address` }).first().click();
  
  // Click on Claim
  await page.locator(`li:has-text("${searchAddress.addressLineOne}")`).first().click();
  
  // Click on I own this home
  await page.locator(`#Own`).click();
  
  // Click on Yes, add it to my profile
  await page.locator(`button:text("Yes, add it to my profile")`).click(); 
  
  // Close the helper modal
  await page.waitForSelector(`button:text("Skip and Close")`);
  await page.locator(`main button span span:text("close"):visible`).first().click({delay: 5000});
  
  // Click on Skip and Close
  await page.locator(`button:text("Skip and Close")`).click();
  
  // Soft Assert property was successfully claimed
  await expect(page.locator(`p:text("This property has been successfully claimed.")`)).toBeVisible();
  await expect(page.locator(`p:text("Now that it is claimed, you can come back and make edits later.")`)).toBeVisible();
  
  // Close the modal
  await page.locator(`button:text("Close")`).click();
  
  // Click on Property History
  await page.locator(`button:text("Property History")`).click();
  
  // Click on the first transaction with hqIQ
  await page.locator(`[id="DetailsTransactionLine"] + div:has(svg)`).first().click();
  
  // Click on the picture group with 3 photos
  await page.locator(`[class*="HistoryRoomConditionImageContainer"]:has-text("3")`).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert the Header
  await expect(page.locator(`h6:has-text("03/06/13  | Sold — $166,900")`)).toBeVisible();
  
  // Assert the verticcal carousl
  await expect(page.locator(`[class*="VerticalCarouselContainer"] div [direction="vertical"]`)).toBeVisible();
  
  // Assert Navigation Bar
  await expect(page.locator(`[class*="PropertyHistoryPhotoModalHeaderContainer"] nav li`)).toHaveCount(4);
  
  // Assert the first photo is showing
  await expect(page.locator(`[direction="horizontal"] div:text("1/3")`)).toBeVisible();
  
  // Assert Left and Right arrow buttons on hover over picture
  await page.locator(`[direction="ARROW_LEFT"]`).hover({force: true});
  await expect(page.locator(`p:text("Prev Room")`)).toBeVisible();
  await page.locator(`[direction="ARROW_RIGHT"]`).hover({force: true});
  await expect(page.locator(`span:text("chevron_right")`)).toBeVisible();
  
  // Scroll through pictures and assert display count 1/3, 2/3, 3/3
  await page.locator(`span:text("chevron_right")`).click();
  await expect(page.locator(`[direction="horizontal"] div:text("2/3")`)).toBeVisible();
  await page.locator(`span:text("chevron_right")`).click();
  await expect(page.locator(`[direction="horizontal"] div:text("3/3")`)).toBeVisible();
  
  // Assert MLS logo, Source, Listed By
  await expect(
    page.locator('[alt="https://img2.redbellre.com/imgs/logos/1612.png-logo"]')
  ).toHaveScreenshot("mlsLogo", { maxDiffPixelRatio: 0.01 });
  await expect(page.locator(`p:text("Source: CRMLS #MB13012578")`)).toBeVisible();
  await expect(page.locator(`p:text("Listed by Century 21 Realty Masters")`)).toBeVisible();
  
  // Assert Room Type Heading, Room Condition Score
  await expect(page.locator(
    `[class*="TransactionInformationComponentContainer"] h6:text("Exterior Back")`
  )).toBeVisible();
  await expect(
    page.locator('[class*="TransactionInformationComponentContainer"] div:has-text("Room Condition") + div')
  ).toHaveScreenshot("roomScore", { maxDiffPixelRatio: 0.01 });
  
  // Assert separation line
  await expect(
    page.locator('[id="divider"]')
  ).toHaveCSS('border', '1px solid rgb(184, 184, 184)')
  
  // Assert Objects identified heading and objects
  await expect(page.locator(`[id="divider"] + p:text("Objects Identified")`)).toBeVisible();
  await expect(page.locator(`[class*="AmenitiesGroup"]:has-text("Driveway: Yes")`)).toBeVisible();
  await expect(page.locator(`[class*="AmenitiesGroup"]:has-text("Trees: Yes")`)).toBeVisible();
  await expect(page.locator(`[class*="AmenitiesGroup"]:has-text("Flooring: Other")`)).toBeVisible();
  await expect(page.locator(`[class*="AmenitiesGroup"]:has-text("Grass: Yes")`)).toBeVisible();
  
  // Assert footer line and buttons, previous transaction and next transaction
  await expect(
    page.locator('[class*="PropertyHistoryNavigateButtonContainer"]')
  ).toHaveCSS('border-top', '1px solid rgb(184, 184, 184)')
  await expect(page.locator(`button:text("Previous Transaction")`)).toBeDisabled(); 
  await expect(page.locator(`button:text("Next Transaction")`)).toBeEnabled(); 
  
  // Hover over Next Transaction button and assert
  await page.locator(`button:text("Next Transaction")`).hover(); 
  await expect(
    page.locator('button:text("Next Transaction")')
  ).toHaveCSS('background-color', 'rgb(76, 76, 255)')
  
  // Click on Next Transaction
  await page.locator(`button:text("Next Transaction")`).click(); 
  
  // Assert lightbox is now at next transaction on the list
  await expect(page.locator(`h6:has-text("01/19/05  | Sold — $245,000")`)).toBeVisible();
  
  // Assert footer line and buttons, previous transaction and next transaction
  await expect(
    page.locator('[class*="PropertyHistoryNavigateButtonContainer"]')
  ).toHaveCSS('border-top', '1px solid rgb(184, 184, 184)')
  await expect(page.locator(`button:text("Previous Transaction")`)).toBeEnabled(); 
  await expect(page.locator(`button:text("Next Transaction")`)).toBeDisabled(); 
  
  // Hover over Previous Transaction button and assert
  await page.locator(`button:text("Previous Transaction")`).hover(); 
  await expect(
    page.locator('button:text("Previous Transaction")')
  ).toHaveCSS('background-color', 'rgb(190, 220, 255)')
  
  // Click on Previous Transaction
  await page.locator(`button:text("Previous Transaction")`).click(); 
  
  // Assert lightbox is now at previous transaction on the list
  await expect(page.locator(`h6:has-text("03/06/13  | Sold — $166,900")`)).toBeVisible();
  
  // Hover over another room and assert hover state
  await page.locator(`button:text("Exterior Front")`).hover(); 
  await expect(
    page.locator('button:text("Exterior Front")')
  ).toHaveCSS('color', 'rgb(31, 31, 255)')
  
  // Click on the room
  await page.locator(`button:text("Exterior Front")`).click(); 
  
  // Assert new room type is selected with pictures showing, object identified headings, photo carousel
  await expect(page.locator(`[direction="horizontal"] div:text("1/1")`)).toBeVisible();
  await expect(page.locator(
    `[class*="TransactionInformationComponentContainer"] h6:text("Exterior Front")`
  )).toBeVisible();
  await expect(
    page.locator('[class*="TransactionInformationComponentContainer"] div:has-text("Room Condition") + div')
  ).toHaveScreenshot("roomScoreExteriorFront", { maxDiffPixelRatio: 0.01 });
  await expect(page.locator(`[class*="VerticalCarouselContainer"] div [direction="vertical"]`)).toBeVisible();
  
  // Click X to close the modal
  await page.locator(`[class*="PropertyHistoryPhotoModalHeaderContainer"] button:has-text("close")`).click();
  
  // Assert lightbox is now close and property history section is display
  await expect(page.locator(`[class*="PropertyHistoryPhotoModalHeaderContainer"]`)).not.toBeVisible();
  await expect(page.locator(`[id="CLAIMED_VIEW_HISTORY"]`)).toBeVisible();
  
});