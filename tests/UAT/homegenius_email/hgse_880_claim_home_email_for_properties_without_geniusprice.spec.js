import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_880_claim_home_email_for_properties_without_geniusprice", async () => {
 // Step 1. HGSE-880 - Claim home email for properties without geniusprice
  //--------------------------------
  // Arrange:
  //--------------------------------
  // This needs to be an off market property
  const searchAddress = {
    searchAddress: "892 Blad St Panaca, NV 89042",
    searchAddr2: "892 Blad St",
    addressLineOne: "892 Blad St Panaca, NV 89042",
    addressLineTwo: "",
    addressAssert: "",
    addressAssert2: "PANACA, NV 89042",
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
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]:visible`).first().pressSequentially(searchAddress.searchAddress, { delay: 100 });
  
  // Wait for search to load properly
  await page.waitForSelector(`div ul li:visible`)
  
  // Click the correct result
  await page.locator(`li:visible p:has-text("${searchAddress.searchAddr2}")`).first().click({delay:3000})
  
  // Assert that the addr appears on the page
  await page.waitForTimeout(6000);
  await expect(page.locator(`p:text-is("${searchAddress.searchAddr2}")`)).toBeVisible()
  
  // Assert there's not a price on geniusprice
  await expect(page.locator(
    `div:has(div span:text("geniusprice")) + div div:has(button) + p:text("$--")`
  )).toBeVisible();
  
  //--------------------------------------Step 2------------------------------------
  //--------------------------------------------------------------------------------
  // 2.claim property by clicking "Yes, add it to my profile" based on new modals
  
  try {
    // Click on "Claim Home"
    await page.locator(`button:has-text("claim home")`).first().click();
  } catch(e){
    console.error(e)
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
  await expect(emailPage.getByRole(`link`, { name: searchAddress.searchAddr2 })).toBeVisible();
  await expect(emailPage.getByRole(`link`, { name: searchAddress.addressAssert2 })).toBeVisible();
  
  //--------------------------------------Step 4------------------------------------
  //--------------------------------------------------------------------------------
  // 4.Verify manage your home section
  
  // Assert email text contain "Manage Your Home"
  await expect(emailPage.getByText(`Manage Your Home`)).toBeVisible();
  
  // Assert email text contain "Review my home facts"
  await expect(emailPage.getByText("Review my home facts")).toBeVisible();
  
  // Assert email text contain Edit facts and add renovations
  await expect(emailPage.getByText("Edit facts and add renovations")).toBeVisible();
  
  // Assert email text contain Add photos of my home
  await expect(emailPage.getByText("Add photos of my home")).toBeVisible();
  
  // Assert email text contain Update photos to get a more accurate room condition score
  await expect(emailPage.getByText("Update photos to get a more accurate room condition score")).toBeVisible();
  
  // Assert email text contain Edit home facts
  await expect(emailPage.getByText("Edit home facts")).toBeVisible();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  //--------------------------------------Step 5------------------------------------
  //--------------------------------------------------------------------------------
  // 5.Verify footer
  
  // Assert email text contain You have accepted the VOW Terms of Use
  await expect(emailPage.getByText("You have accepted the VOW Terms of Use")).toBeVisible();
  
  // Assert disclaimer message
  await expect(emailPage.getByText(`Real estate services provided by homegenius Real Estate LLC and homegenius Real Estate Inc. (collectively dba homegenius Real Estate)`)).toBeVisible();
  
  
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
  await expect(page.locator(`p:has-text("${searchAddress.searchAddr2}")`)).toBeVisible()
  
  
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
    await expect(linkedinPage.locator(`p:text("New to LinkedIn?")`).last()).toBeVisible({timeout: 5000})
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