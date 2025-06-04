const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_543_update_geniusprice_call_to_use_property_information_from_sold_index_when_available", async () => {
 // Step 1. HGSE-543 - Update geniusprice call to use property information from Sold Index when available
  // Constants
  
  const OFF_MARKET_PROPERTY_STREET = "514 Oak Dr A";
  const OFF_MARKET_PROPERTY_CITY = "Capitola, CA 95010";
  const OFF_MARKET_PROPERTY_ADDRESS = `${OFF_MARKET_PROPERTY_STREET} ${OFF_MARKET_PROPERTY_CITY}`;
  
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  // Step 1
  // Log in
  const { page, context } = await logInHomegeniusUser({
    args: ["--deny-permission-prompts"], // To prevent popups on production site later in the workflow
  });
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Step 2
  // Search for a Off Market property
  // Single Family or a Condo where it displays only Public Records and generate geniusprice in QA environment, and has all DNA data
  await page
    .getByPlaceholder("Enter an Address")
    .first()
    .fill(OFF_MARKET_PROPERTY_STREET + " "); // Add empty space to prompt suggestions
  
  // Click search suggestion for target property
  await page
    .getByRole(`listbox`)
    .getByText(`${OFF_MARKET_PROPERTY_ADDRESS}Claim this home`)
    .click();
  
  // Click "X" on debugging tool popup ("green" box)
  await page
    .locator(`[id="__next"]`)
    .getByRole(`button`, { name: `close` })
    .click();
  
  // Click "Cancel" to NOT "Claim" the home
  await page.getByRole(`button`, { name: `Cancel` }).click();
  
  // Wait for "$--" to display and then disappear, meaning geniusprice has been calculated
  await page.getByRole(`heading`, { name: `$--` }).waitFor();
  await page.getByRole(`heading`, { name: `$--` }).waitFor({ state: "hidden" });
  
  // Get "geniusprice" from listing
  const uatGeniusPrice = await page.getByRole(`heading`, { name: `$` }).innerText();
  
  // Step 3
  // Prod URL - https://homegeniusrealestate.com/
  const prodPage = await context.newPage();
  await prodPage.goto("https://homegeniusrealestate.com/");
  
  await page.waitForTimeout(3000)
  if(await prodPage.getByRole(`button`, { name: `Accept Cookies` }).count()){
    await prodPage.getByRole(`button`, { name: `Accept Cookies` }).click();
  }
  // Close the renovation studio popup
  try {
    await prodPage.getByRole(`button`, { name: `Maybe Later` }).click({ timeout: 15 * 1000 });
  } catch {
    console.log("Popup did not appear")
  }
  
  // Search for a Off Market property Single Family or a Condo where it displays only
  // Public Records and generate geniusprice in Prod environment for the same property
  await prodPage
    .getByPlaceholder("Enter an Address")
    .first()
    .fill(OFF_MARKET_PROPERTY_STREET + " "); // Add empty space to prompt suggestions
  
  
  // Click search suggestion for target property
  await prodPage
    .getByRole(`listbox`)
    .getByText(`${OFF_MARKET_PROPERTY_ADDRESS}Claim this home`)
    .click();
  
  // Click "Cancel" to NOT "Claim" the home
  await prodPage.getByRole(`button`, { name: `Cancel` }).click();
  
  // Wait for "$--" to display and then disappear, meaning geniusprice has been calculated
  await prodPage.getByRole(`heading`, { name: `$--` }).waitFor();
  await prodPage.getByRole(`heading`, { name: `$--` }).waitFor({ state: "hidden" });
  
  // Get "geniusprice" from listing
  const prodGeniusPrice = await prodPage.getByRole(`heading`, { name: `$` }).innerText();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // Step 5
  // Please compare the
  // geniusprice value you get in test environment to the same property in Prod. The value should be different and should typically be higher.
  const prodPriceInt = parseInt(prodGeniusPrice.replace(/[$,]/g, ''), 10);
  const uatGeniusInt = parseInt(uatGeniusPrice.replace(/[$,]/g, ''), 10);
  
  console.log(prodPriceInt)
  console.log(uatGeniusInt)
  
  // Assert that genius price in prod is greater than or equal to UAT
  // Allow for a deviation of 3 dollars
  expect(prodPriceInt + 3).toBeGreaterThanOrEqual(uatGeniusInt)
});