const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_1413_update_terms_and_conditions_in_emails_to_reference_new_web_page", async () => {
 // Step 1. HGSE-1413 - Update Terms and Conditions in Emails to Reference New Web Page
  //--------------------------------
  // Step 1:
  //--------------------------------
  const searchAddress = {
    searchAddress: "2387 Bohannon Drive, Santa Clara, CA 95050",
    searchAddr2: "2387 Bohannon Dr",
    addressLineOne: "2387 Bohannon Drive",
    addressLineTwo: "Santa Clara, CA 95050",
    propertyType: "single family",
    bed: "5",
    bath: "6.5",
    sqft: "7,178",
    gar: "2",
    yr: "2022"
  }
  const mlsNumber = "ML81973382"
  
  const {page,context} = await logInHomegeniusUser()
  
  // Clean up - unclaim a property
  try {
    // Click on Claim a Home
    await page.locator(`[data-testid="undecorate"] #nav-hyperlink-Claim\\ a\\ Home`).click();
    // Fill in Address
    await page.locator(`[placeholder="Enter an Address"]`).first().fill(searchAddress.addressLineOne);
    // Click on Claim
    await page.locator(`li:has-text("${searchAddress.searchAddr2}")`).first().click();
    // Click on the meat icon next to Claimed View
    await page.locator(`[aria-label="Claimed property options menu button"]`).click({timeout: 15000}); 
    // Click on Release Claim
    await page.locator(`div:text("Release Claim")`).click();
    // Click on Yes, release property
    await page.locator(`button:text("Yes, release property")`).click(); 
    console.log(`${searchAddress.addressLineOne} unclaimed`)
  } catch {
    await page.locator(`button:has-text("close"):visible`).last().click(); 
  }
  
  // Get inbox ready to receive email
  const email = process.env.DEFAULT_USER
  const { waitForMessage } = await getInbox({
    address: email,
  });
  const after = new Date();
  
  //--------------------------------
  // Step 2,3,4,5,6:
  //--------------------------------
  // Click "saved home"
  await page.getByRole('link', { name: 'Find a Home' }).click();
  await page.getByPlaceholder('Address, city, neighborhood,').first().fill(searchAddress.addressLineOne);
  
  // Search mlsNumber
  await page.getByRole(`button`, { name: `Bohannon Dr Santa Clara CA` }).click();
  
  // claim home
  await page.locator(`button:has-text("property details"):visible`).click();
  await page.locator(`button:has-text("claim home")`).first().click();
  
  // Click own and yes
  await page.locator(`[id="Own"]`).click({force: true});
  await page.locator(`button:has-text("yes, add it to my profile"):visible`).click()
  
  // CLick next
  await page.locator(`button:has-text("next"):visible`).click()
  
  //--------------------------------
  // Step 7,8,9,10:
  //--------------------------------
  // Check Email "You Claimed a Home"
  const {html, subject, text, urls } = await waitForMessage({ after, timeout: 60_000 });
  expect(subject).toBe("You Claimed a Home")
  console.log(text)
  
  // Create new tab in browser
  const emailPage = await context.newPage();
  
  // Set HTML content from the email in the new tab
  await emailPage.setContent(html);
  
  // Assert the content of the email
  expect(urls).toContain("https://uat-portal.homegeniusrealestate.com//terms-and-conditions")
  await expect(emailPage.getByRole(`cell`, { name: `You Claimed a Home` })).toBeVisible();
  await expect(emailPage.getByRole(`link`, { name: `Terms & Conditions` })).toBeVisible();
  
  // Assert Home Image
  await expect(async () => {
    await expect(emailPage.locator(
      `.main-content-image img`
    )).toHaveScreenshot('2387_Bohannon_Dr', {maxDiffPixelRatio: 0.01})
  }).toPass({ timeout: 120_000 });
  
  // Assert Header Image
  await expect(async () => {
    await expect(emailPage.locator(
      `.header-content img`
    )).toHaveScreenshot('header_content', {maxDiffPixelRatio: 0.01})
  }).toPass({ timeout: 120_000 });
  
  const page4 = await context.newPage();
  await page4.goto(urls[urls.length-1])
  await expect(page4).toHaveURL(/privacy-policy/)
  
  const page5 = await context.newPage();
  await page5.goto(urls[urls.length-5])
  await expect(page5).toHaveURL(/terms-and-conditions/)
  
});