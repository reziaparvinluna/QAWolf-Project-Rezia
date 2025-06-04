const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius, unclaimProperty } = require("../../../lib/node_20_helpers");

test("hgse_864_sign_in_through_claim_home_modal", async () => {
 // Step 1. HGSE-864 Sign in through Claim Home Modal
  //--------------------------------
  // Arrange:
  //--------------------------------
  const searchAddress = {
    searchAddress: "11630 Newton Pl, Westminster, CO 80031",
    addressLineOne: "11630 Newton Pl",
    addressLineTwo : "Westminster, CO 80031",
    city: "Westminster",
    state:"CO",
    zip:"80031"
  }
  
  // Clean Up
  try {
    const { page: cleanUpPage } = await logInHomegeniusUser();
    await unclaimProperty(cleanUpPage, searchAddress);
    await cleanUpPage.close();
  } catch (e){
    console.log(e)
  }
  
  //--------------------------------------Step 1------------------------------------
  //--------------------------------------------------------------------------------
  // Search for a property and User must be unauthenticated
  // Example:11630 Newton Pl, Westminster, CO 80031
  // Property page will be open
  
  // - Go to URL
  const { browser, context, page } = await goToHomegenius();
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Fill in Address
  await page.locator(`[placeholder="Enter an Address"]`).first().fill(searchAddress.searchAddress);
  
  await expect(async () => {
    // Click the search bar until we see the results
    await page.locator(`[placeholder="Enter an Address"]`).first().click({timeout:10_000});
  
    // Expect the search results to appear
    await expect(page.locator(`ul li:visible`).first()).toBeVisible({timeout:10_000})
  
  }).toPass({timeout:60_000})
  
  // Click on Claim
  await page.locator(`li:has-text("${searchAddress.addressLineOne}")`).first().click();
  
  //--------------------------------------Step 2------------------------------------
  //--------------------------------------------------------------------------------
  // Select either I own this home or I do not own this home option and click Yes, add it to my profile
  // Sign in modal will open
  // Click on I own this home
  await page.locator(`#Own`).click();
  
  // Click on Yes, add it to my profile
  let [page2] = await Promise.all([
    page.waitForEvent("popup"),
    page.locator(`button:text("Yes, add it to my profile")`).click()
  ]);
  
  //--------------------------------------Step 3------------------------------------
  //--------------------------------------------------------------------------------
  // Enter password to authenticate
  // Once logged in the user would go to the new Edit Home Facts/Photos modal
  // Fill in "Email"
  await page2.locator(`[aria-label="Email Address"]`).fill(process.env.DEFAULT_USER);
  
  // Fill in "Password"
  await page2.locator(`[aria-label="Password"]`).fill(process.env.DEFAULT_PASS);
  
  // Click "Sign in"
  await page2.locator(`#next`).click();
  
  throw `Let the Koalas/Yong know once bug clears. Currently Bugged at "Once logged in the user would go to the new Edit Home Facts/Photos modal" - user is not routed to the Edit Home Facts/Photos modal and failed to claim the home`
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  
  
});