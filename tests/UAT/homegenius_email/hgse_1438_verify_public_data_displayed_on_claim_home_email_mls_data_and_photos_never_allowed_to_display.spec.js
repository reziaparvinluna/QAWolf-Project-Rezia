import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_1438_verify_public_data_displayed_on_claim_home_email_mls_data_and_photos_never_allowed_to_display", async () => {
 // Step 1. HGSE-1438 Verify Public data displayed on claim home email. MLS data and photos NEVER allowed to display
  //--------------------------------
  // Arrange:
  //--------------------------------
  // constants
  const searchAddress = {
    searchAddress: "641 Wild Horse Ln, Brandon, MS 39042",
    searchAddr2: "641 Wild Horse Ln",
    addressLineOne: "641 Wild Horse Ln",
    addressLineTwo: "Brandon, MS 39042",
    addressAssert: "641 Wild Horse Ln",
    addressAssert2: "Brandon, MS 39042",
    bed: `3  Beds`,
    bath: `2  Baths`,
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
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]:visible`).first().click();
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]:visible`).first().type(searchAddress.searchAddress, {delay: 100});
  
  // Wait for search to load properly
  await page.waitForSelector(`div ul li:visible`)
  
  // Click the correct result
  await page.locator(`li:visible p:has-text("${searchAddress.searchAddr2}")`).first().click({delay:5000})
  
  // Assert that the addr appears on the page
  await page.waitForTimeout(6000);
  await expect(page.locator(`p:has-text("${searchAddress.searchAddr2}"):visible`)).toBeVisible()
  
  // Assert there's a price on geniusprice
  await expect(page.locator(
    `div:has(div span:text("geniusprice")) + div div:has(button) + p:text("$--")`
  )).not.toBeVisible();
  
  try {
    // Click on "Claim Home"
    await page.locator(`button:has-text("claim home")`).first().click({timeout: 10_000});
  } catch {
    console.error(); 
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
  console.log(emailReceived.text)
  
  // Create new tab in browser
  const emailPage = await context.newPage();
  
  // Set HTML content from the email in the new tab
  await emailPage.setContent(emailReceived.html);
  
  // verify Claim home email displays Public data and street/aerial photo
  // Assert Street photo
  await expect(emailPage.locator(
    `[class="vertical-card-card-media"] img`
  )).toHaveScreenshot('641_Wild_Horse', {maxDiffPixelRatio: 0.01})
  
  // Assert MLA
  await expect(emailPage.locator(
    `[class="vertical-card-details-dna-attr"]:has-text("${searchAddress.bed}")`
  )).toBeVisible();
  await expect(emailPage.locator(
    `[class="vertical-card-details-dna-attr"]:has-text("${searchAddress.bath}")`
  )).toBeVisible();
  
  // Assert address
  await expect(emailPage.locator(
    `div:text("${searchAddress.addressLineOne}")`
  )).toBeVisible();
  await expect(emailPage.locator(
    `div:text("${searchAddress.addressLineTwo}")`
  )).toBeVisible();
  
});