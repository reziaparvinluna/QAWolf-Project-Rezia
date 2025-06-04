const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser } = require("../../../lib/node_20_helpers");

test("hgse_1173_verify_prices_for_off_market_properties_in_non_disclosure_states", async () => {
 // Step 1. HGSE-1173 - Verify prices for off market properties in non disclosure states
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Test Case required an off market property in one of the states below:
  /* Non disclosure states:
  Alaska (AK)
  Idaho (ID)
  Kansas (KS)
  Missouri (MO)
  Mississippi (MS)
  Lousiana (LA)
  Wyoming (WY)
  Utah (UT)
  Texas (TX)
  North Dakota (ND)
  New Mexico (NM)
  Montana (MT)
  */
  
  const nonStates = [
    "Alaska",
    "Idaho",
    "Kansas",
    "Missouri",
    "Mississippi",
    "Louisiana",
    "Wyoming",
    "Utah",
    "Texas",
    "North Dakota",
    "New Mexico",
    "Montana"
  ]
  
  const comparableHomes = [];
  
  // // Randomly select a non State for test is a bit flakey
  // const nonState = nonStates[faker.datatype.number({max: nonStates.length-1})]
  
  const nonState = "Kansas"
  console.log(nonState)
  
  const email = "yong@qawolf.com"
  
  // Log in with default user
  const {page, context} = await logInHomegeniusUser()
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Click on Find a Home
  await page.locator(`[data-testid="undecorate"] #nav-hyperlink-Find\\ a\\ Home`).click();
  
  // Fill in non state
  await page.locator(
    `[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`
  ).first().fill(nonState);
  
  // Choose the house in the list
  const nthResult = 2
  
  // Click on the nth result with the state
  await page.locator(`li button:has-text("${nonState}")`).nth(nthResult).hover({force: true});
  await page.locator(`li button:has-text("${nonState}")`).nth(nthResult).click({timeout: 5000});
  
  // Click on Search
  await page.locator(`button:text("Search")`).first().click();
  
  // Click the For Sale Dropdown
  await page.locator(`button:text("For Sale")`).click();
  
  // Click on Sold
  await page.locator(`[value="Sold"]`).click();
  
  // Click on Done
  await page.locator(`button:text("Done")`).click();
  
  // Click on Beds & Baths -- Cannot claim a land property so filtering out land properties
  await page.locator(`button:has-text("Beds & Baths")`).click();
  
  // Click on 1+ on Bed
  await page.locator(`button[name="numberOfBedrooms"]:has-text("1+")`).click();
  
  // Click on Done
  await page.locator(`button:text("Done")`).click();
  
  // Grab the address of the first property listed for later assertion
  await page.waitForSelector(`a:has(button:text("Sold on")) >> nth=${nthResult}`)
  const homeAddress = await page.locator(
    `a:has(button:text("Sold on")) >> nth=${nthResult} >> [type="LARGE_CARD"]`
  ).allInnerTexts();
  
  // Click on the first property listed
  await page.locator(`a:has(button:text("Sold on")) >> nth=${nthResult}`).click();
  
  // Clean up if the property was previously claimed
  try {
    await expect(page.locator(`span:text("Claimed View")`)).toBeVisible({timeout: 5000});
      // Click on the meat icon next to Claimed View
    await page.locator(`[aria-label="Claimed property options menu button"]`).click(); 
    // Click on Release Claim
    await page.locator(`div:text("Release Claim")`).click();
    // Click on Yes, release property
    await page.locator(`button:text("Yes, release property")`).click(); 
    console.log(`${homeAddress[1]} unclaimed`)
  } catch (err) {
    console.log(err)
  }
  
  // Close the helper modal
  await page.waitForSelector(`button:text("Property Details")`);
  await page.locator(`main button span span:text("close")`).last().click({delay: 5000});
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert property is off market and sold price is not displayed on property details page
  const offMarketPrice = page.locator(`div:text("Off Market:")`);
  await expect(offMarketPrice).toBeVisible();
  expect(offMarketPrice).not.toContain("$");
  
  // Assert Similar Sold Properties are all showing $-- on prices
  const soldPropertiesCount = await page.locator(`button:has-text("Sold on")`).count();
  await expect(page.locator(
    `[class*="card-media-container"] + div:has-text("$--")`
  )).toHaveCount(soldPropertiesCount);
  
  // Click on Claim Home
  await page.locator(`button:has-text("Claim Home")`).first().click();
  
  // Click on I own this home
  await page.locator(`#Own`).click();
  
  // Click on Yes, add it to my profile
  await page.locator(`button:text("Yes, add it to my profile")`).click(); 
  
  // Click on Next
  await page.locator(`button:text("Next")`).click();
  
  // Assert Comparable homes listed are all showing $-- on prices
  const comparableHomesCount = await page.locator(`[class*="SelectablePropCard"]`).count();
  await expect(page.locator(`[class*="SelectablePropCard"]:has-text("$--")`)).toHaveCount(comparableHomesCount);
  
  // Assert all pins are also showing $-- on prices
  await expect(page.locator(`div:text("$--")`)).toHaveCount(comparableHomesCount * 2);
  
  // Wait for loader to dissapear
  await expect(page.locator(`.loader`).first()).not.toBeVisible({timeout: 5 * 60 * 1000});
  
  // Select 3 comparables and Click done
  for (let i = 0; i < 3; i++){
    // Click on each home to select as comparable homes
    await page.locator(
      `[class*="SelectablePropCard"] >> nth=${i}`
    ).click();
    // Save the home for later Assertion
    const homeInfo = await page.locator(
      `[class*="SelectablePropCard"] >> nth=${i} >> [type="LARGE_CARD"]`
    ).allInnerTexts();
    comparableHomes.push(homeInfo);
  }
  console.log(comparableHomes)
  
  // Click on Done
  await page.locator(`button:text("Done")`).click();
  
  // Click on Continue to property view
  await page.locator(`button:text("Continue to property view")`).click();
  
  // Assert Sold comparable homes are displaying $-- on prices
  await page.reload();
  for (let i = 0; i < comparableHomes.length; i++){
    await expect(page.locator(
      `[data-testid="undecorate"]:has-text("${comparableHomes[i][2]}") div:text("$--")`
    )).toBeVisible();
  }
  
  // Click on account
  await page.locator(`#login-btn`).click();
  
  // Click on Claimed Homes
  await page.locator(`a:text("Claimed Homes")`).click();
  
  // Regex format address
  const newAddress = await expandStreetAbbreviations(homeAddress[1]);
  
  
  // Locator using the fixed inline regex
  const homeLocator = page.locator('[data-testid="undecorate"]', {
    hasText: newAddress
  });
  
  // Visibility assertion
  await expect(homeLocator.locator('div', { hasText: '$--' }).first()).toBeVisible();
  
  // Clean Up - unclaim property
  try {
    await page.locator(`[data-testid="undecorate"]:has-text("${homeAddress[1]}")`).click();
    // Click on the meat icon next to Claimed View
    await page.locator(`[aria-label="Claimed property options menu button"]`).click(); 
    // Click on Release Claim
    await page.locator(`div:text("Release Claim")`).click();
    // Click on Yes, release property
    await page.locator(`button:text("Yes, release property")`).click(); 
    console.log(`${homeAddress[1]} unclaimed`)
  } catch (err) {
    console.log(err)
  }
});