import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_1309_verify_gp_value_is_matching_on_email_notifications_and_throughout_the_application", async () => {
 // Step 1. HGSE-1309 - Verify GP value is matching on email/notifications and throughout the application
  //--------------------------------
  // Arrange:
  //--------------------------------
  // constants
  const searchAddress = {
    searchAddress: "56051 132nd St, Mapleton, MN 56065",
    searchAddr2: "56051 132nd St",
    addressLineOne: "56051 132 Nd St",
    addressLineTwo: "Mapleton, MN 56065",
    addressAssert: "56051 132nd St",
    addressAssert2: "Mapleton, MN 56065",
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
  // 1 - Navigate to application
  // Click "claim a home"
  await page.waitForTimeout(5000)
  await page.locator(`[data-testid="undecorate"] #nav-hyperlink-Find\\ a\\ Home`).click();
  
  //--------------------------------------Step 2------------------------------------
  //--------------------------------------------------------------------------------
  // 2 - Search an address
  // Search property adddress
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]:visible`).first().pressSequentially(searchAddress.searchAddress, { delay: 100 });
  
  // Wait for search to load properly
  await page.waitForSelector(`div ul li:visible`)
  
  // Click the correct result
  await page.locator(`li:visible p:has-text("${searchAddress.searchAddr2}")`).first().click({delay:3000})
  
  //--------------------------------
  // Assert:
  //--------------------------------
  //--------------------------------------Step 3------------------------------------
  //--------------------------------------------------------------------------------
  // 3 - Claim Home
  // geniusprice from property page should match edit property details, comparables and
  // last page of the claim home process
  
  // Assert that the addr appears on the page
  await page.waitForTimeout(7000)
  await expect(page.locator(`p:has-text("${searchAddress.searchAddr2}")`).first()).toBeVisible()
  
  // Click on "Claim Home"
  await page.locator(`button:has-text("claim home")`).first().click();
  
  // Click on "I own this home"
  await page.locator(`#Own`).click();
  
  // Get inbox ready to receive email
  const { waitForMessage } = await getInbox({
    address: email,
  });
  const after = new Date();
  
  // Click on "Yes, add it to my profile"
  await page.locator(`button:has-text("yes, add it to my profile"):visible`).click()
  
  //--------------------------------------Step 4------------------------------------
  //--------------------------------------------------------------------------------
  // 4 - Go to "Claimed View"
  
  // Close the helper modal
  await page.locator(`main button span span:text("close")`).last().click({delay: 5000, timeout: 10000});
  
  // Click on Skip and Close
  await page.locator(`button:text("Skip and Close")`).click();
  
  // Click on Close
  await page.locator(`button:text("Close")`).click();
  
  // Grab the geniusprice for later assertion
  const geniusPrice = await page.locator(`#CLAIMED_VIEW_PRICES h6`).nth(0).innerText();
  console.log(geniusPrice);
  
  // Assert geniusprice amount
  await expect(page.locator(
    `span:has-text("Claimed View")`
  )).toBeVisible();
  await expect(page.locator(
    `div:has(> div > p:text("geniusprice")) + div:has-text("${geniusPrice}")`
  )).toBeVisible();
  
  
  
  //--------------------------------------Step 5------------------------------------
  //--------------------------------------------------------------------------------
  // 5 - Check Email "You Claimed a Home"
  const emailReceived = await waitForMessage({ after, timeout: 60_000 });
  console.log(emailReceived)
  
  // Create new tab in browser
  const emailPage = await context.newPage();
  
  // Set HTML content from the email in the new tab
  await emailPage.setContent(emailReceived.html);
  
  // Assert geniusprice amount
  expect(emailReceived.html).toContain(geniusPrice);
  
});