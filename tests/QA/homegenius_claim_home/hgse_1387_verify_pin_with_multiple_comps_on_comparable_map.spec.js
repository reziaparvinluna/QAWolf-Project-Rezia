const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser } = require("../../../lib/node_20_helpers");

test("hgse_1387_verify_pin_with_multiple_comps_on_comparable_map", async () => {
 // Step 1. HGSE-1387 - Verify pin with multiple comps on comparable map
  //--------------------------------
  // Arrange:
  //--------------------------------
  const searchAddress = {
    searchAddress: "1010 Arch St Unit 610, Philadelphia, PA 19107",
    addressLineOne: "1010 Arch St Unit 610",
    addressLineTwo: "Philadelphia, PA 19107",
    comparableAddress: "1010 Arch St"
  }
  
  const comparableHomes = [];
  
  // Log in with default user
  const {page, context} = await logInHomegeniusUser()
  
  // Clean up - unclaim a property
  try {
    await unclaimProperty(page, searchAddress);
  } catch (err) {
    console.log(err)
  }
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Click on Claim a Home
  await page.locator(`[data-testid="undecorate"] #nav-hyperlink-Claim\\ a\\ Home`).click();
  
  // Fill in Address
  await page.locator(`[placeholder="Enter an Address"]`).first().fill(searchAddress.searchAddress);
  
  // Click on Claim
  await page.locator(
    `li:has-text("${searchAddress.addressLineOne}") p:text("Claim this home") >> nth=0`
  ).click();
  
  // Click on I own this home
  await page.locator(`#Own`).click();
  
  // Click on Yes, add it to my profile
  await page.locator(`button:text("Yes, add it to my profile")`).click(); 
  
  // Close the helper modal
  await page.waitForSelector(`button:text("Skip and Close")`);
  // await page.locator(`main button span span:text("close")`).click({delay: 5000});
  
  // Click on Next
  await page.locator(`button:text("Next")`).click();
  
  // Click on the Pin with three homes 
  await expect(async () => {
    await expect(page.locator(`[data-id="comparable-cards-container"]`)).toBeVisible();
    // await page.mouse.click(320, 300); // Can't click properly using unique selectors for 3 Homes Pin
    await page.locator(
      `[aria-label*="${searchAddress.comparableAddress}"] >> nth=0`
    ).click({ position: { x: 0, y: 0 }, force: true });
    
    // Wait for UI to update
    await page.waitForTimeout(3000)
    // Assert to see a list of 3 home prices
    expect(await page.locator(`[class*="claim-home-comparables-container"] li`).count()).toBeGreaterThanOrEqual(3);
  }).toPass({timeout: 40 * 1000})
  
  // Hover over each of the 3 Homes and grab address for later assertion
  for (let i = 0; i < 3; i++){
  
    // Check to see if the menu with prices is open
    const isVisible = await page.locator(`ul.overlay-dropdown:visible`).isVisible()
    
    // If not open, click on the prices on the map
    if(!isVisible){
      // Click on the map with {x} homes
      await page.locator(
        `[aria-label*="${searchAddress.comparableAddress}"] >> nth=0`
      ).click({ position: { x: 0, y: 0 }, force: true });
    }
  
    // Pause for the UI
    await page.waitForTimeout(4000)
  
    // Hover over price
    await page.locator(
      `[class*="claim-home-comparables-container"] li >> nth=${i}`
    ).hover({force: true});
  
    // Get the value of the home
    const houseValue = await page.locator(
      `[class*="claim-home-comparables-container"] li >> nth=${i}`
    ).innerText();
  
    const count = await page.locator(
      `[type="LARGE_CARD"]:has-text("${houseValue}") ~ [type="LARGE_CARD"]:has-text("${searchAddress.comparableAddress}")`).count()
    let houseAddress="";
  
    // If there are multiple houses with the same price and address, go with nth i
    if(count>1) {
      console.log("There are multiple houses with that address. Inside count if statement")
      // Assert house amount has comparable address
      await expect(page.locator(
        `[type="LARGE_CARD"]:has-text("${houseValue}") ~ [type="LARGE_CARD"]:has-text("${searchAddress.comparableAddress}")`
      ).nth(i)).toBeVisible();
      // Save the address of the home
      houseAddress = await page.locator(
        `[type="LARGE_CARD"]:has-text("${houseValue}") ~ [type="LARGE_CARD"]:has-text("${searchAddress.comparableAddress}")`
      ).nth(i).allTextContents()
  
      // Click on the home
      await page.locator(
        `[type="LARGE_CARD"]:has-text("${houseValue}") ~ [type="LARGE_CARD"]:has-text("${searchAddress.comparableAddress}")`
      ).nth(i).click()
    } else { // Else go with the one selector
  
      console.log("There is a single address. In else statement.")
  
      // Assert house amount has comparable address
      await expect(page.locator(
        `[type="LARGE_CARD"]:has-text("${houseValue}") ~ [type="LARGE_CARD"]:has-text("${searchAddress.comparableAddress}")`
      )).toBeVisible();
      // Save the address of the home
      houseAddress = await page.locator(
        `[type="LARGE_CARD"]:has-text("${houseValue}") ~ [type="LARGE_CARD"]:has-text("${searchAddress.comparableAddress}")`
      ).allTextContents()
  
      // Click on the home
      await page.locator(
        `[type="LARGE_CARD"]:has-text("${houseValue}") ~ [type="LARGE_CARD"]:has-text("${searchAddress.comparableAddress}")`
      ).click()
    }
  
    
  
    // Push to array for later assertion
    comparableHomes.push(
      {
        houseValue,
        houseAddress
      }
    )
  }
  console.log(comparableHomes)
  
  
  // Click on Done
  await page.locator(`button:text("Done")`).click();
  
  // Click on Continue to property view
  await page.locator(`button:text("Continue to property view")`).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // -- Assert Comparable Section 
  // Assert pin with multiple comparable display
  await expect(page.locator(`[id="CLAIMED_VIEW_COMPARABLES"] div:text("3 Homes")`)).toBeVisible()
  // Assert 3 comparable homes are showing with value and address
  for (let i = 0; i < 3; i++){
  
    // Assert Value and address shows
    await expect(page.locator(
      `[id="CLAIMED_VIEW_COMPARABLES"] [data-testid="undecorate"]:has-text("${comparableHomes[i].houseValue}"):has-text("${comparableHomes[i].houseAddress[0]}")`
    )).toBeVisible();
    
  }
  
  // Click on Expand map
  await expect(async () => {
    await expect(page.locator(`iframe ~ div button >> nth=1`)).toBeVisible({timeout: 3000})
    await page.locator(`iframe ~ div button >> nth=1`).click({force: true});
  }).toPass({timeout: 30 * 1000});
  
  // Assert the map is expanded
  await expect(page.locator(`[height="calc(100vh - 3rem)"] [id="map-container"]`)).toBeVisible();
  
  // Click on the pin with 3 homes
  await page.locator(`[height="calc(100vh - 3rem)"] [id="map-container"] div:text("3 Homes")`).click({position: { x: 0, y: 0 }, force: true, delay: 100});
  
  // Assert 3 comparable homes are showing with value and address
  for (let i = 0; i < 3; i++){
    // Assert Value and address shows
    await expect(page.locator(
      `[height="calc(100vh - 3rem)"] div:has(>.card-media-container):has-text("${comparableHomes[i].houseValue}"):has-text("${comparableHomes[i].houseAddress[0]}")`
    )).toBeVisible();
  
  }
  
});