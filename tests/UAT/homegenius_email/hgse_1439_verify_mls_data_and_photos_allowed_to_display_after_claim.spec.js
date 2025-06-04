const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_1439_verify_mls_data_and_photos_allowed_to_display_after_claim", async () => {
 // Step 1. HGSE-1439 - Verify MLS data displayed on claim home email. MLS data and photos allowed to display AFTER claim
  //--------------------------------
  // Arrange:
  //--------------------------------
  // constants
  const searchAddress = {
    searchAddress: "2368 Chalybe Trail, Hoover, AL 35226",
    searchAddr2: "2368 Chalybe Tr",
    addressLineOne: "2368 Chalybe Tr",
    addressLineTwo: "Hoover, AL 35226",
    addressAssert: "2368 Chalybe Tr",
    addressAssert2: "Hoover, AL 35226",
    bed: `4  Beds`,
    bath: `2.5  Baths`,
    sqft: `3166  sqft`
  }
  const photoUrl = `https://rbimages.blob.core.windows.net/rb-images/US/real-estate/mls-homes/single-family-property/for-sale/NY/Beacon/12508/1941-ONEH6295936-20240815-34-South-Avenue-0.jpg`
  const email = process.env.DEFAULT_USER
  
  // Login to Homeogenius UAT-Portal
  const {page,context} = await logInHomegeniusUser({slowMo: 1000})
  
  // Clean Up
  try {
    await unclaimProperty(page, searchAddress)
  } catch (error) {
    console.log(error)
  }
  
  //--------------------------------
  // Act:
  //--------------------------------
  //--------------------------------------Step 1------------------------------------
  //--------------------------------------------------------------------------------
  // 1.claim a property
  // Click "claim a home"
  await page.locator(`[data-testid="undecorate"] #nav-hyperlink-Find\\ a\\ Home`).click();
  
  // Search property adddress
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]:visible`).first().fill(searchAddress.searchAddress);
  
  // Wait for search to load properly
  await page.waitForSelector(`div ul li:visible`)
  
  // Click the correct result
  await page.locator(`li:visible p:has-text("${searchAddress.searchAddr2}")`).first().click({delay:3000})
  
  // Assert that the addr appears on the page
  await page.waitForTimeout(6000);
  await expect(page.locator(`p:has-text("${searchAddress.searchAddr2}")`)).toBeVisible()
  
  
  // Click on "Claim Home"
  try {
    await page.locator(`button:has-text("claim home")`).first().click();
  } catch (e){
    console.log(e)
  }
  
  // Click on "I own this home"
  await page.locator(`#Own`).click();
  
  // Get inbox ready to receive email
  const { waitForMessage } = await getInbox({
    address: email,
  });
  const after = new Date();
  
  // Click on "Yes, add it to my profile"
  await page.locator(`button:has-text("yes, add it to my profile"):visible`).click()
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert MLS Data displayed on the claim on email
  const emailReceived = await waitForMessage({ after, timeout: 60_000 });
  console.log(emailReceived)
  
  // Create new tab in browser
  const emailPage = await context.newPage();
  
  // Set HTML content from the email in the new tab
  await emailPage.setContent(emailReceived.html);
  
  // Assert Photo
  await expect(emailPage.locator(
    `[class="vertical-card-layout"] td img`
  )).toHaveScreenshot('photo10', {maxDiffPixelRatio: 0.01});
  
  // Get the details of the email
  let homeEmailDetails = await emailPage.locator(`.vertical-card-link`).innerText();
  
  // Remove all white space from string and seperate every word with two spaces to match format
  homeEmailDetails = homeEmailDetails.split(/\s+/).join('  ').trim();
  
  // Assert to check for bed, bath and sqft
  expect(homeEmailDetails).toContain(searchAddress.bed);
  expect(homeEmailDetails).toContain(searchAddress.bath);
  expect(homeEmailDetails).toContain(searchAddress.sqft);
  
});