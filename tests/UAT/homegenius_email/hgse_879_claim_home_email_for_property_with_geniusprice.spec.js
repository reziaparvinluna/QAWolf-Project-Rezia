import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_879_claim_home_email_for_property_with_geniusprice", async () => {
 // Step 1. HGSE-879 - Claim home email for property with geniusprice
  //--------------------------------
  // Arrange:
  //--------------------------------
  // This needs to be an off market property
  const searchAddress = {
    searchAddress: "536 Peaceful Valley Road Johnsburg, NY 12853",
    searchAddr2: "536 Peaceful Valley Rd",
    addressLineOne: "536 Peaceful Valley Rd",
    addressAssert: "536 Peaceful Valley Road",
    addressAssert2: "NORTH CREEK, NY 12853",
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
  // 1.search for a property that has no geniusprice and open property page
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
  await expect(page.getByText(searchAddress.addressAssert).first()).toBeVisible();
  
  // Assert there's a price on geniusprice
  await expect(page.locator(
    `div:has(div span:text("geniusprice")) + div div:has(button) + p:text("$--")`
  )).not.toBeVisible();
  //--------------------------------------Step 2------------------------------------
  //--------------------------------------------------------------------------------
  // 2.claim property by clicking "Yes, add it to my profile" based on new modals
  
  // Click on "Claim Home"
  await page.waitForTimeout(30_000);
  await page.getByRole(`button`, { name: `Claim Home` }).first().click();
  
  // Click on "I own this home"
  await page.locator(`#Own`).click();
  
  // Get inbox ready to receive email
  const { waitForMessage } = await getInbox({
    address: email,
  });
  const after = new Date();
  
  // Click on "Yes, add it to my profile"
  await page.locator(`button:has-text("yes, add it to my profile"):visible`).click()
  
  //--------------------------------------Step 3------------------------------------
  //--------------------------------------------------------------------------------
  // 3.Verify received email
  const emailReceived = await waitForMessage({ after, timeout: 60_000 });
  console.log(emailReceived)
  
  // Create new tab in browser
  const emailPage = await context.newPage();
  
  // Set HTML content from the email in the new tab
  await emailPage.setContent(emailReceived.html);
  
  // Assert email subject
  expect(emailReceived.subject).toBe("You Claimed a Home");
  
  // Assert email body "You claimed a home " & address
  await expect(emailPage.getByRole(`cell`, { name: `You Claimed a Home` })).toBeVisible();
  await expect(emailPage.locator(
    `div:text("${searchAddress.addressAssert}")`
  )).toBeVisible();
  await expect(emailPage.locator(
    `div:text("${searchAddress.addressAssert2}")`
  )).toBeVisible();
  
  //--------------------------------------Step 4------------------------------------
  //--------------------------------------------------------------------------------
  // 4.Verify manage your home section
  
  // Assert email text contain "Manage Your Home"
  expect(emailReceived.html).toContain("Manage Your Home");
  
  // Assert email html contain "Review my home facts"
  expect(emailReceived.html).toContain("Review my home facts");
  
  // Assert email html contain Edit facts and add renovations
  expect(emailReceived.html).toContain("Edit facts and add renovations");
  
  // Assert email html contain Add photos of my home
  expect(emailReceived.html).toContain("Add photos of my home");
  
  // Assert email html contain Update photos to get a more accurate room condition score
  expect(emailReceived.html).toContain("Update photos to get a more accurate room condition score");
  
  // Assert email html contain Edit home facts
  expect(emailReceived.html).toContain("Edit home facts");
  
  //--------------------------------
  // Assert:
  //--------------------------------
  //--------------------------------------Step 5------------------------------------
  //--------------------------------------------------------------------------------
  // 5.Verify footer
  
  // Assert email html contain You have accepted the VOW Terms of Use
  expect(emailReceived.html).toContain("You have accepted the VOW Terms of Use");
  
  // Assert disclaimer message
  await expect(emailPage.locator(
    `td:text("Real estate services provided by homegenius Real Estate LLC and homegenius Real Estate Inc. (collectively dba homegenius Real Estate), each a subsidiary of Radian Group Inc. 7730 South Union Park Avenue, Suite 550, Midvale, UT 84047. Tel: 877-500-1415. homegenius Real Estate LLC and its wholly owned subsidiary are licensed in every state and the District of Columbia.")`
  )).toBeVisible();
  
  //--------------------------------------Step 6------------------------------------
  //--------------------------------------------------------------------------------
  // 6.Click on Edit Homes button
  // Get the url for Edit Home button
  const editHomeUrl = emailReceived.urls.find((url) => url.includes("email=claimed?email=claimed"));
  
  // Create a new page from context
  const editHomePage = await context.newPage();
  
  // Go to URL link
  await editHomePage.goto(editHomeUrl)
  
  // Assert correct address is showing
  await expect(editHomePage.locator(`div:text("${searchAddress.addressAssert}")`)).toBeVisible()
  
  //--------------------------------------Step 7------------------------------------
  //--------------------------------------------------------------------------------
  // 7.Click on Privacy Policy link
  // Get the url for Privacy Policy
  const privacyUrl = emailReceived.urls.find((url) => url.includes("privacy-policy"));
  
  // Create a new page from context
  const privacyPage = await context.newPage();
  
  // Go to URL link
  await privacyPage.goto(privacyUrl)
  
  // Assert landed at the privacy page
  await expect(privacyPage.locator(`h1 span:text("Privacy Policy  and CCPA Notice")`)).toBeVisible()
  
  //--------------------------------------Step 8------------------------------------
  //--------------------------------------------------------------------------------
  // 8.Click on Terms & Conditions link
  // Get the url for Terms & Conditions
  const termsUrl = emailReceived.urls.find((url) => url.includes("terms-and-conditions"));
  
  // Create a new page from context
  const termsPage = await context.newPage();
  
  // Go to URL link
  await termsPage.goto(termsUrl)
  
  // Assert landed at the terms page
  await expect(termsPage.locator(`h1:text("Terms and Conditions")`)).toBeVisible()
  
  //--------------------------------------Step 9------------------------------------
  //--------------------------------------------------------------------------------
  // 9.Click on LinkedIn
  // Get the url for LinkedIn
  const linkedinUrl = emailReceived.urls.find((url) => url.includes("linkedin.com"));
  
  // Create a new page from context
  const linkedinPage = await context.newPage();
  
  // Go to URL link
  await linkedinPage.goto(linkedinUrl)
  
  // Assert landed at the linkedin page
  try {
    await expect(linkedinPage.locator(`h1:text("Join LinkedIn")`)).toBeVisible({timeout: 5000})
  } catch {
    await expect(linkedinPage.locator(`:text("LinkedIn")`).first()).toBeVisible({timeout: 5000})
  }
  
  //--------------------------------------Step 10------------------------------------
  //--------------------------------------------------------------------------------
  // 10.Click on Facebook
  // Get the url for Facebook
  const facebookUrl = emailReceived.urls.find((url) => url.includes("facebook.com"));
  
  // Create a new page from context
  const facebookPage = await context.newPage();
  
  // Go to URL link
  await facebookPage.goto(facebookUrl)
  
  // Assert landed at the facebook page
  await expect(facebookPage.locator(`[id="facebook"]`)).toBeVisible()
  
  //--------------------------------------Step 11------------------------------------
  //--------------------------------------------------------------------------------
  // 11.Click on Instagram
  // Get the url for instagram
  const instagramUrl = emailReceived.urls.find((url) => url.includes("instagram.com"));
  
  // Assert Instagram link is the correct link
  expect(instagramUrl).toBe("https://www.instagram.com/homegeniusre?igsh=Zjh2cWFmYmN6cXlo")
  
  //--------------------------------------Step 12------------------------------------
  //--------------------------------------------------------------------------------
  // 12.Click on Pinterest
  const pinterestUrl = emailReceived.urls.find((url) => url.includes("pin.it"));
  
  // Create a new page from context
  const pinterestPage = await context.newPage();
  
  // Go to URL link
  await pinterestPage.goto(pinterestUrl)
  
  // Assert landed at the pinterest page
  await expect(pinterestPage.locator(`h1:has-text("homegenius")`)).toBeVisible();
});