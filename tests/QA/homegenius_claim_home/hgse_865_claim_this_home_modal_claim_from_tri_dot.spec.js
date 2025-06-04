const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser } = require("../../../lib/node_20_helpers");

test("hgse_865_claim_this_home_modal_claim_from_tri_dot", async () => {
 // Step 1. HGSE-865: Claim This Home Modal. Claim from Tri-dot
  //--------------------------------
  // Arrange:
  //--------------------------------
  // This is an on market property
  const searchAddress = {
    searchAddress: "1212 Rebel Hill Road, Conshohocken, PA 19428",
    searchAddr2: "1212 Rebel Hill Road",
    addressLineOne: "1212 Rebel Hill Rd",
    addressLineTwo: "Conshohocken, PA 19428",
    propertyType: "Condominium",
    bed: "2",
    bath: "1.5",
    sqft: "940",
    yr: "1900"
  }
  const mlsNumber = "PAMC2134506"
  
  // Login to Homeogenius UAT-Portal
  const {page,context} = await logInHomegeniusUser()
  
  // Clean up - unclaim a property
  try {
    // Click on Claim a Home
    await page.locator(`[data-testid="undecorate"] #nav-hyperlink-Claim\\ a\\ Home`).click();
    // Fill in Address
    await page.locator(`[placeholder="Enter an Address"]`).first().fill(searchAddress.addressLineOne);
    // Click on Claim
    await page.locator(`li:has-text("${searchAddress.addressLineOne}")`).first().click();
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
  
  // Click "Find a home"
  await page.locator(`[data-testid="undecorate"] #nav-hyperlink-Find\\ a\\ Home`).click();
  
  // Search mlsNumber
  await page.locator(`p:has-text("Search active listings or claim your home and view value estimates and owner tools") + div input[id^="downshift"]`).fill(mlsNumber);
  
  // Wait for search to load properly
  await page.waitForSelector(`div ul li:visible`)
  
  // Click the correct result
  await page.locator(`li:visible p:has-text("${mlsNumber}")`).first().click({delay:3000})
  
  // Assert that the MLSID appears on the page
  await expect(page.locator(`p:has-text("MLS ID: ${mlsNumber}")`)).toBeVisible()
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Go to proerpty details claim home
  await page.locator(`button:has-text("property details"):visible`).click();
  await page.locator(`button:has-text("claim home")`).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // assert header and detail
  await expect(page.locator(`h6:has-text("claim this home")`)).toBeVisible()
  await expect(page.locator(`div[height="9.688rem"]:has-text("${searchAddress.searchAddr2}")`)).toBeVisible()
  await expect(page.locator(`div[height="9.688rem"]:has-text("${searchAddress.addressLineTwo}")`)).toBeVisible()
  await expect(page.locator(`div[height="9.688rem"]:has-text("property type: ${searchAddress.propertyType}")`)).toBeVisible()
  await expect(page.locator(`div[height="9.688rem"] p:has-text("${searchAddress.bed}")+p:has-text("bed")`)).toBeVisible()
  await expect(page.locator(`div[height="9.688rem"] p:has-text("${searchAddress.bath}")+p:has-text("bath")`)).toBeVisible()
  await expect(page.locator(`div[height="9.688rem"] p:has-text("${searchAddress.sqft}")+p:has-text("sqft")`)).toBeVisible()
  // await expect(page.locator(`div[height="9.688rem"] p:has-text("${searchAddress.gar}")+p:has-text("gar")`)).toBeVisible()
  await expect(page.locator(`div[height="9.688rem"] p:has-text("${searchAddress.yr}")+p:has-text("yr")`)).toBeVisible()
  
  // Assert boxes and footers
  await expect(page.locator(`div[width="100%"][height="100%"]:has-text("Why are you claiming this home?"):visible`)).toBeVisible()
  await expect(page.locator(`div:has-text("I own this home")+p:has-text("and would like to stay up to date with the estimated value of my home")`)).toBeVisible()
  await expect(page.locator(`div:has-text("I do not own this home")+p:has-text("but would like to utilize the tools to estimate the value of this home")`)).toBeVisible()
  await expect(page.locator(`p:has-text("Yes, add it to my profile")`)).toBeVisible()
  await expect(page.locator(`[href="/pdfs/VOW_Terms_of_Use.pdf"]`)).toBeVisible()
  await expect(page.locator(`[href="/faq/claiming-a-home"]:has-text("Have questions? Visit our FAQs")`)).toBeVisible()
  await expect(page.locator(`button:has-text("cancel"):visible`)).toBeVisible()
  await expect(page.locator(`button:has-text("yes, add it to my profile"):visible`)).toBeVisible()
  
  // Assert faq
  const [page2] = await Promise.all([
    page.waitForEvent("popup"),
    page.locator(`[href="/faq/claiming-a-home"]:has-text("Have questions? Visit our FAQs")`).click()
  ]);
  await expect(page2.locator(`p:has-text("Questions about Claiming a Home")`)).toBeVisible()
  await expect(page2).toHaveURL(/faq/)
  await expect(page2).toHaveURL(/claiming-a-home/)
  
  // Assert button hover effect
  await page.bringToFront()
  await page.locator(`[id="Own"]`).hover({force: true});
  await expect(page.locator(`[id="Own"]`)).toHaveCSS(`border`, `2px solid rgb(31, 31, 255)`)
  await page.locator(`[id="DoNotOwn"]`).hover({force: true});
  await expect(page.locator(`[id="DoNotOwn"]`)).toHaveCSS(`border`, `2px solid rgb(31, 31, 255)`)
  await page.locator(`[id="Own"]`).hover({force: true});
  await page.locator(`[id="Own"]`).click({force: true});
  await page.locator(`[id="DoNotOwn"]`).hover({force: true});
  await page.locator(`[id="Own"]`).hover({force: true});
  await expect(page.locator(`[id="Own"]`)).toHaveCSS(`border`, `6px solid rgb(31, 31, 255)`)
  
  // Claim
  await page.locator(`button:has-text("yes, add it to my profile"):visible`).click()
  await expect(page.locator(`p:has-text("This property has been added to your profile!")`)).toBeVisible()
  
  // cleanup
  // await page.waitForTimeout(25000)
  await page.locator(`button span.material-icons.md-24:has-text("close"):visible`).first().click();
  await page.locator(`button:text("Skip and Close"):visible`).click();
  await page.locator(`button:text("close")`).click();
  // Click on the meat icon next to Claimed View
  await page.locator(`[aria-label="Claimed property options menu button"]`).click({timeout: 15000}); 
  // Click on Release Claim
  await page.locator(`div:text("Release Claim")`).click();
  // Click on Yes, release property
  await page.locator(`button:text("Yes, release property")`).click(); 
  console.log(`${searchAddress.addressLineOne} unclaimed`)
});