import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_1440_verify_mls_data_displayed_on_claim_home_email_mls_data_and_photos_always_allowed_to_display", async () => {
 // Step 1. HGSE-1440 Verify MLS data displayed on claim home email. MLS data and photos ALWAYS allowed to display
  //--------------------------------
  // Arrange:
  //--------------------------------
  // constants
  const searchAddress = {
    searchAddress: "161 Lake Avenue, Manasquan, NJ 08736",
    searchAddr2: "161 Lake Ave",
    addressLineOne: "161 Lake Ave",
    addressLineTwo: "Manasquan, NJ 08736",
    addressAssert: "161 Lake Avenue",
    addressAssert2: "Manasquan, NJ 08736",
    bed: `4  Beds`,
    bath: `4  Baths`,
    sqft: `4232  sqft`
  }
  
  const email = process.env.DEFAULT_USER
  
  // Login to Homeogenius UAT-Portal
  const {page,context} = await logInHomegeniusUser()
  
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
  await expect(page.locator(`p:has-text("${searchAddress.searchAddr2}")`).first()).toBeVisible()
  
  // Assert there's a price on geniusprice
  await expect(page.locator(
    `div:has(div span:text("geniusprice")) + div div:has(button) + p:text("$--")`
  )).not.toBeVisible();
  
  // Click on Claim Home
  try {
    await page.getByRole(`button`, { name: `Claim Home` }).first().click({timeout: 5000});
  } catch (e){
    console.log(e)
  }
  
  // Click on "I own this home"
  await page.getByText(`I own this home`).click();
  
  // Add home to profile
  await page.getByRole(`button`, { name: `Yes, add it to my profile` }).click();
  
  // Get inbox ready to receive email
  const { waitForMessage } = await getInbox({
    address: email,
  });
  const after = new Date();
  
  // Click on "Next"
  await page.locator(`button:has-text("Next"):visible`).click()
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert MLS Data displayed on the claim on email
  const emailReceived = await waitForMessage({ after, timeout: 60_000 });
  console.log(emailReceived.text)
  
  // Create new tab in browser
  const emailPage = await context.newPage();
  
  // Set HTML content from the email in the new tab
  await emailPage.setContent(emailReceived.html);
  
  // Assert Photo
  await expect(emailPage.locator(
    `[class="vertical-card-layout"] td img`
  )).toHaveScreenshot('photo', {maxDiffPixelRatio: 0.01});
  
  // Assert to check for bed, bath and sqft
  await expect(emailPage.locator(
    `[class="vertical-card-details-dna"]:has-text("${searchAddress.bed}")`
  )).toBeVisible();
  await expect(emailPage.locator(
    `[class="vertical-card-details-dna"]:has-text("${searchAddress.bath}")`
  )).toBeVisible();
  await expect(emailPage.locator(
    `[class="vertical-card-details-dna"]:has-text("${searchAddress.sqft}")`
  )).toBeVisible();
  
});