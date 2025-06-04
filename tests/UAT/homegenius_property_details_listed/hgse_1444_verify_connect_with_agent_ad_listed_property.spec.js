const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_1444_verify_connect_with_agent_ad_listed_property", async () => {
 // Step 1. HGSE-1444 - Verify Connect with Agent ad. Listed Property
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Need to find a property that's listed
  const searchAddress = {
    searchAddress: "609 E Main St, Pinckney, MI 48169",
    searchAddr2: "609 E Main Street",
    addressLineOne: "609 E Main St",
    addressLineTwo: "Pinckney Vlg, MI 48169",
    propertyType: "house",
  }
  
  //--------------------------------------Step 1------------------------------------
  //--------------------------------------------------------------------------------
  // Login to HGRE.com
  // Search for a listed property.
  // Verify Connect ad is displayed
  // verify text in connect ad:
  // header:
  // "hgConnect"
  // Connect with an
  // Body:
  // "Buying or selling a home is a big deal. Homegenius connect puts you in touch 
  // with agents you can trust to help you navigate the deal."
  // "Find an Agent" button
  
  // Login
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
  // Click "claim a home"
  await page.locator(`[data-testid="undecorate"] #nav-hyperlink-Find\\ a\\ Home`).click();
  
  // Search mlsNumber
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]:visible`).first().pressSequentially(searchAddress.searchAddress, { delay: 100 });
  
  // Wait for search to load properly
  await page.waitForSelector(`div ul li:visible`)
  
  // Click the correct result
  await page.locator(`li:visible p:has-text("${searchAddress.addressLineOne}")`).first().click({delay:3000})
  
  
  // Assert Connect with an Agent Ad Header
  await expect(page.locator(
    `p:text("homegenius connect") + p:text("Connect with an Agent")`
  )).toBeVisible(); 
  
  // Assert Body Text
  await expect(page.locator(
    `p:text("Buying or selling a home is a big deal. Homegenius connect puts you in touch with agents you can trust to help you navigate the deal.")`
  )).toBeVisible(); 
  
  // Assert Find an Agent button
  await expect(page.locator(
    `a button:text("Find an Agent")`
  )).toBeVisible(); 
  
  //--------------------------------------Step 2------------------------------------
  //--------------------------------------------------------------------------------
  // Click on Claim home button and clam home
  // Claim home view page will be displayed
  
  // Go to proerpty details claim home
  try {
    await page.locator(`button:has-text("property details"):visible`).click();
    await page.locator(`button:has-text("claim home")`).first().click();
  } catch (e) {
    console.log(e)
  }
  
  // Click on I own this home
  await page.locator(`#Own`).click();
  
  // Click on Yes, add it to my profile
  await page.getByRole(`button`, { name: `Yes, add it to my profile` }).click();
  
  // Close the modal
  await page.locator(`[id="__next"]`).getByRole(`button`, { name: `close` }).click({delay: 5000});
  
  // Click on Skip and Close
  await page.getByRole(`button`, { name: `Skip and Close` }).click();
  await page.getByRole(`button`, { name: `Close`, exact: true }).click();
  
  // Assert we are in claimed view
  await expect(page.getByLabel(`Property options menu button`, { exact: true })).toBeVisible();
  
  // Assert we see the address
  await expect(page.getByText(`${searchAddress.searchAddr2}`)).toBeVisible();
  
  //--------------------------------------Step 3------------------------------------
  //--------------------------------------------------------------------------------
  // go back to public view page
  // Verify Connect ad is displayed
  // verify text in connect ad:
  // header:
  // "hgConnect"
  // Connect with an
  // Body:
  // "Buying or selling a home is a big deal. Homegenius connect puts you in touch 
  // with agents you can trust to help you navigate the deal."
  // Find an agent button
  
  // Click on dropdown button next to Claimed View
  await page.reload();
  await page.getByLabel(`Property options menu button`, { exact: true }).click();
  
  // Click on Public View
  await page.getByText(`Public View`).click();
  
  // Assert Connect with an Agent Ad Header
  await expect(page.locator(
    `p:text("homegenius connect") + p:text("Connect with an Agent")`
  )).toBeVisible(); 
  
  // Assert Body Text
  await expect(page.locator(
    `p:text("Buying or selling a home is a big deal. Homegenius connect puts you in touch with agents you can trust to help you navigate the deal.")`
  )).toBeVisible(); 
  
  // Assert Find an Agent button
  await expect(page.locator(
    `a button:text("Find an Agent")`
  )).toBeVisible(); 
  
  //--------------------------------------Step 4------------------------------------
  //--------------------------------------------------------------------------------
  // Click on the find an agent button
  // User should be redirected to connect page
  
  // Click on Find an Agent Button
  const [page2] = await Promise.all([
    page.waitForEvent("popup"),
    page.getByRole(`button`, { name: `Find an Agent` }).click()
  ]);
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // Assert user landed on a connect page
  expect(page2.url()).toBe(`${process.env.URL_HOMEGENIUS}/connect`)
  
  // Assert text "Find the real estate agent who's right for you"
  await expect(page2.locator(
    `div:text("Find the real estate agent who’s right for you")`
  )).toBeVisible();
  
});