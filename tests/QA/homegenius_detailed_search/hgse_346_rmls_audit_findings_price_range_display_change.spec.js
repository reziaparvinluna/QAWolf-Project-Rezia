const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, unclaimProperty } = require("../../../lib/node_20_helpers");

test("hgse_346_rmls_audit_findings_price_range_display_change", async () => {
 // Step 1. HGSE-346 - RMLS Audit Findings - Price Range Display Change
  // Constants and Helpers
  
  // const searchAddress = "3550 W 3rd St, Washougal, WA"
  // const searchAddressOne = "3550 W 3 rd St"
  // const searchCity = "Washougal, WA"
  // const addressOne = "3550 W 3rd St"
  // const city = "Washougal"
  // const state = "WA"
  // const zip = "98671"
  
  const searchAddress = "10915 SE Valley View Ter Unit 2, Happy Valley, OR"
  const searchAddressOne = "10915 SE Valley View Ter Unit 2"
  const searchCity = "Happy Valley, OR"
  const addressOne = "10915 SE Valley View Ter Unit 2"
  const city = "Happy Valley"
  const state = "OR"
  const zip = "97086"
  
  const searchAddress2 = "216 NW Royal Blvd"
  const addressLineOne2 = "Portland, OR 97210"
  
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  //--------------------------------------Step 1------------------------------------
  //--------------------------------------------------------------------------------
  
  // Log in user
  const {page, context} = await logInHomegeniusUser()
  
  // Unclaim property if needed
  await unclaimProperty(page,{searchAddress,addressLineOne:searchAddressOne})
  
  // Click "Find a home"
  await page.locator(`[data-testid="undecorate"] #nav-hyperlink-Find\\ a\\ Home`).click();
  
  // Search neighborhood
  await page.locator(`p:has-text("Search active listings or claim your home and view value estimates and owner tools") + div input[id^="downshift"]`).fill(searchCity);
  
  // Click the correct result
  await page.locator(`li:visible p:has-text("${city}") + p:text-is("${state}")`).first().click({delay:3000})
  
  // Click "Search"
  await page.locator(`p:has-text("Search active listings or claim your home and view value estimates and owner tools") + div button:has-text("Search")`).click();
  
  // Close the overlay
  await page.locator(`div:has(> pre) button:has-text("Close")`).click()
  
  // Wait for search results to appear
  await page.waitForTimeout(10000)
  
  //--------------------------------------Step 3 AND Step 7 ------------------------------------
  //--------------------------------------------------------------------------------
  
  //--------------------------------
  // Act: Grab the price and navigate to the home
  //--------------------------------
  
  let iteration = 0
  let found = false;
  let listPrice = ""
  
  // Iterate and search until we find the address
  while (!found && iteration<20) {
    
    const found = await page.locator(`div[type="LARGE_CARD"]:text-is("${addressOne}")`).isVisible()
  
    // If found, click into the property
    if (found) {
      listPrice = await page.locator(`div.card-media-container + div:has-text("${addressOne}") > div:has-text("$")`).innerText()
      console.log("List Price: ", listPrice)
      await page.locator(`div[type="LARGE_CARD"]:text-is("${addressOne}")`).click();
      break;
    }
  
    const nextButton = page.locator(`button:has(span:has-text("chevron_left")) + p + button:not([disabled]) > span:has-text("chevron_right"):visible`);
    const isNextButtonEnabled = await nextButton.count() > 0;
  
    if (isNextButtonEnabled) {
      await page.locator(`button:has(span:has-text("chevron_left")) + p + button > span:has-text("chevron_right"):visible`).click();
    } else {
      break;
    }
    
    iteration++;
  }
  
  // Close the overlay
  await page.locator(`div:has(> pre) button:has-text("Close")`).click()
  
  //--------------------------------
  // Assert: Assert that we see the high price on the property detail page and map view
  //--------------------------------
  
  // Assert that we are on the correct property page
  await expect(page.locator(`p:has-text("${addressOne}") + p:has-text("${city}, ${state} ${zip}")`)).toBeVisible()
  
  // Assert that the "High Price", is the list price shown on the property card
  const highPrice = await page.locator(`div:has-text("$") + p:has-text(" - ") + div p`).first().innerText()
  expect(highPrice).toEqual(listPrice)
  
  // Click on "Map View"
  await page.locator(`span:has-text("map") + span:has-text("Map View")`).click();
  
  // Click on the map locator
  await page.locator(`[src="https://maps.gstatic.com/mapfiles/transparent.png"]`).click();
  
  // Assert that the card has the "high" price
  const propertyDetailCard = await page.locator(`div.card-media-container + div:has-text("${listPrice}"):has-text("${addressOne}")`).first().innerText();
  
  // Close the map
  await page.locator(`button span > span:has-text("Close"):visible`).click()
  
  //--------------------------------------Step 6------------------------------------
  //--------------------------------------------------------------------------------
  
  //--------------------------------
  // Assert: Assert that we see the high price on the "Saved home" page
  //--------------------------------
  
  // Save the home
  await page.locator(`svg[name="favorite"]:visible >> nth=0`).click();
  
  // Look for the card on the "Saved Home" page
  await page.locator(`#login-btn`).click();
  await page.locator(`a:has-text("Saved Homes")`).click();
  
  // Assert that the price is the high value
  await expect(page.locator(`div:has(>div>img):has-text("${addressOne}"):has-text("${listPrice}")`)).toBeVisible()
  
  // Unlike the property
  await page.locator(`div:has(>div>img):has-text("${addressOne}") button:has-text("Favorite")`).click()
 // Step 2. Assert that geniusprice is higher than the highprice
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  // Wait for email
  const { waitForMessage } = await getInbox({address: process.env.DEFAULT_USER});
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  //--------------------------------------Step 5------------------------------------
  //--------------------------------------------------------------------------------
  
  // Click on Claim a Home
  await page.locator(`[data-testid="undecorate"] #nav-hyperlink-Claim\\ a\\ Home`).click();
  
  // Fill in Address
  await page.locator(`[placeholder="Enter an Address"]`).first().fill(searchAddress2);
  
  await expect(async () => {
    // Click the search bar until we see the results
    await page.locator(`[placeholder="Enter an Address"]`).first().click({timeout:10_000});
  
    // Expect the search results to appear
    await expect(page.locator(`ul li:visible`).first()).toBeVisible({timeout:10_000})
  
  }).toPass({timeout:60_000})
  
  // Click on Claim
  await page.locator(`li:has-text("${addressLineOne2}")`).first().click();
  
  // Click on I own this home
  await page.locator(`#Own`).click();
  
  // Save date for the email
  const after = new Date()
  
  // Click on Yes, add it to my profile
  await page.locator(`button:text("Yes, add it to my profile")`).click(); 
  
  // Close the helper modal
  await page.waitForSelector(`button:text("Skip and Close")`);
  await page.locator(`main button span span:text("close"):visible`).first().click({delay: 5000});
  
  //--------------------------------
  // Assert: Assert that we see that the geniusprice is higher than the high price 
  // in the claim home process, as well as email after claiming home process 
  //--------------------------------
  
  // Assert genius price here
  // TODO - once genius price is available, add it here
  
  throw new Error(`If the genius price is higher than the list price ${listPrice},
                    then please reach out to @JasonAllen or @Koalas.`)
  
  // Click on Skip and Close
  await page.locator(`button:text("Skip and Close")`).click();
  
  // Soft Assert property was successfully claimed
  await expect(page.locator(`p:text("This property has been successfully claimed.")`)).toBeVisible();
  await expect(page.locator(`p:text("Now that it is claimed, you can come back and make edits later.")`)).toBeVisible();
  
  const { subject, urls, html } = await waitForMessage({after});
  
  // TODO - Assert that the genius price in the email, if it is there, is higher than the list price
  console.log(html)
  console.log(subject)
});