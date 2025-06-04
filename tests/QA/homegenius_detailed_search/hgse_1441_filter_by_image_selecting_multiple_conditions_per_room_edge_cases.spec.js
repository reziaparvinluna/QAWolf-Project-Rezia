const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser } = require("../../../lib/node_20_helpers");

test("hgse_1441_filter_by_image_selecting_multiple_conditions_per_room_edge_cases", async () => {
 // Step 1. HGSE-1441- (Filter by Image) Selecting multiple conditions per room edge cases
  //--------------------------------
  // Arrange:
  //--------------------------------
  const location = "Los Angeles CA"
  const privateSchool = "the gooden school"
  // Login to Homeogenius UAT-Portal
  const {page,context} = await logInHomegeniusUser()
  
  // Take current url
  const url = page.url()
  console.log(url)
  
  // Go to home search and wait for load
  await page.goto(`${url}home-search`);
  await page.waitForSelector(`:text("Total Listings")`)
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Search for LA
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).fill(location);
  
  // Wait for search to load properly
  await page.waitForSelector(`div ul li:visible`)
  
  // Click to search result
  await page.locator(`button:has-text("Los Angeles") >>nth=0`).click();
  await page.waitForSelector(`:text("Total Listings")`)
  
  // Filter by image and advanced filter
  await page.locator(`button:has-text("SEARCH WITH AI")`).click()
  await page.locator(`button:has-text("Advanced Filters")`).click();
  // kitchen
  await page.locator(`p:text("Kitchen") + div:has-text("Any") >> nth=0`).first().click();
  await page.locator(`li:has-text("Excellent"):visible`).click();
  await page.locator(`li:has-text("Good"):visible`).click();
  await page.locator(`li:has-text("Average"):visible`).click();
  await page.locator(`p:text("Kitchen") + div:has-text("Any") >> nth=0`).first().click();
  // bedrooms
  await page.locator(`p:text("Bedrooms") + div:has-text("Any") >> nth=0`).first().click({delay: 2000});
  await page.locator(`li:has-text("Excellent"):visible`).click();
  await page.locator(`li:has-text("Good"):visible`).click();
  await page.locator(`li:has-text("Average"):visible`).click();
  await page.locator(`p:text("Bedrooms") + div:has-text("Any") >> nth=0`).first().click();
  // pool
  await page.locator(`p:text("Pool") + div:has-text("Any") >> nth=0`).scrollIntoViewIfNeeded();
  await page.locator(`p:text("Pool") + div:has-text("Any") >> nth=0`).first().click();
  await page.locator(`li:has-text("Yes"):visible`).click()
  await page.locator(`button:has-text("Apply")`).last().click()
  await page.waitForSelector(`:text("Total Listings")`, {timeout: 50000})
  
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert there's a checkmark on SEARCH WITH AI button
  await expect(page.locator(
    `div:has(div p:text("SEARCH WITH AI")) + div:has(span span:text("Check"))`
  )).toBeVisible();
  
  // Assert first 20 listing are 100% match the hgiq 
  for(let i=0; i < 20 ;i++) {
    const picCard = page.locator(`[data-testid="undecorate"]:has-text("MLS") .card-media-container >> nth=${i}`)
    await expect(picCard.locator(`:text("% match")`)).toBeVisible()
  }
  
  // Assert after remove the pill, still 100% match, 3 filters are applied
  await page.locator(`button:has-text("los angeles, ca")+button:has-text("close")`).click();
  await page.waitForSelector(`:text("Total Listings")`, {timeout: 50000})
  // Assert there's a checkmark on SEARCH WITH AI button
  await expect(page.locator(
    `div:has(div p:text("SEARCH WITH AI")) + div:has(span span:text("Check"))`
  )).toBeVisible();
  // Assert first 20 listing are 100% match the hgiq 
  for(let i=0; i < 20 ;i++) {
    const picCard = page.locator(`[data-testid="undecorate"]:has-text("MLS") .card-media-container >> nth=${i}`)
    await expect(picCard.locator(`:text("% match")`)).toBeVisible()
  }
  
  // Assert after draw on map, still 100% match, 3 filters are applied
  await page.locator(`button:has-text("draw on map")`).click();
  await expect(page.locator(`[aria-label="Finish drawing on the map"]`)).toBeVisible();
  await page.mouse.move(421, 455);
  await page.mouse.down();
  await page.waitForTimeout(2000);
  await page.mouse.move(562, 460);
  await page.waitForTimeout(2000);
  await page.mouse.move(556, 232);
  await page.waitForTimeout(2000);
  await page.mouse.move(413, 236);
  await page.waitForTimeout(2000);
  await page.mouse.move(421, 455);
  await page.waitForTimeout(2000);
  await page.mouse.move(562, 460);
  await page.waitForTimeout(2000);
  await page.mouse.move(556, 232);
  await page.mouse.up();
  await page.waitForSelector(`:text("Total Listings")`)
  // Assert there's a checkmark on SEARCH WITH AI button
  await expect(page.locator(
    `div:has(div p:text("SEARCH WITH AI")) + div:has(span span:text("Check"))`
  )).toBeVisible();
  // Assert first 20 listing are 100% match the hgiq 
  for(let i=0; i < 20 ;i++) {
    const picCard = page.locator(`[data-testid="undecorate"]:has-text("MLS") .card-media-container >> nth=${i}`)
    await expect(picCard.locator(`:text("% match")`)).toBeVisible()
  }
  
  // Assert after clear boundraies, still 100% match, 3 filters are applied
  await page.locator(`button:has-text("clear boundaries")`).click();
  await page.waitForSelector(`:text("Total Listings")`, {timeout: 50_000})
  // Assert there's a checkmark on SEARCH WITH AI button
  await expect(page.locator(
    `div:has(div p:text("SEARCH WITH AI")) + div:has(span span:text("Check"))`
  )).toBeVisible();
  // Assert first 20 listing are 100% match the hgiq 
  for(let i=0; i < 20 ;i++) {
    const picCard = page.locator(`[data-testid="undecorate"]:has-text("MLS") .card-media-container >> nth=${i}`)
    await expect(picCard.locator(`:text("% match")`)).toBeVisible()
  }
  
  // Assert after choose school, still 100% match, 3 filters are applied
  // search for a private school
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).fill(privateSchool);
  // Wait for search to load properly
  await page.waitForSelector(`div ul li:visible`)
  await page.locator(`button:has-text("${privateSchool}")`).click();
  await page.waitForSelector(`:text("Total Listings")`)
  // Assert there's a checkmark on SEARCH WITH AI button
  await expect(page.locator(
    `div:has(div p:text("SEARCH WITH AI")) + div:has(span span:text("Check"))`
  )).toBeVisible();
  // Assert first 20 listing are 100% match the hgiq 
  for(let i=0; i < 20 ;i++) {
    const picCard = page.locator(`[data-testid="undecorate"]:has-text("MLS") .card-media-container >> nth=${i}`)
    await expect(picCard.locator(`:text("% match")`)).toBeVisible()
  }
});