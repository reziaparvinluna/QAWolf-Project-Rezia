const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_1443_off_market_property_verify_claim_home_and_connect_with_agent_ads", async () => {
 // Step 1. HGSE-1443 - [Off Market Property] Verify Claim Home and Connect with Agent Ads
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const OFF_MARKET_PROPERTY_STREET = "514 Oak Dr A";
  const OFF_MARKET_PROPERTY_CITY = "Capitola, CA 95010";
  const OFF_MARKET_PROPERTY_ADDRESS = `${OFF_MARKET_PROPERTY_STREET} ${OFF_MARKET_PROPERTY_CITY}`;
  const OFF_MARKET_PROPERTY = {
    addressLineOne: OFF_MARKET_PROPERTY_STREET,
    searchAddress: OFF_MARKET_PROPERTY_ADDRESS,
  };
  
  // Expected message for assertion
  const EXPECTED_CONNECT_MESSAGE =
    "Buying or selling a home is a big deal. Homegenius connect puts you in touch with agents you can trust to help you navigate the deal.";
  
  // Step 1
  // Login to HGRE.com
  const { page } = await logInHomegeniusUser({slowMo: 1000});
  
  // Clean up: unclaim property in case it was already claimed
  await unclaimProperty(page, OFF_MARKET_PROPERTY);
  
  // Navigate back to home page
  await page.getByRole(`link`, { name: `homegenius-logo` }).click();
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Search for an off Market property.
  await page
    .getByPlaceholder("Enter an Address")
    .first()
    .fill(OFF_MARKET_PROPERTY.searchAddress); // Add empty space to prompt suggestions
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Expect "Claim this home" to be visible next to address search suggestion
  await expect(
    page
      .getByRole(`listbox`)
      .getByText(`${OFF_MARKET_PROPERTY.searchAddress}Claim this home`),
  ).toBeVisible();
  
  // Step 2
  // Claim the target property
  await page.getByPlaceholder("Enter an Address").first().fill("");
  await claimProperty(page, OFF_MARKET_PROPERTY);
  
  // Step 3
  // Click "Claimed View" to open menu to navigate back to "Public View"
  await page.getByLabel(`Property options menu button`, { exact: true }).click();
  await page.getByText(`Public View`).click();
  
  // Step 4
  // Expect "homegenius connect" header to be visible
  await expect(
    page.getByText(`homegenius connect`, { exact: true }),
  ).toBeVisible();
  
  // Expect "Connect with an Agent" header to be visible
  await expect(page.getByText(`Connect with an Agent`)).toBeVisible();
  
  // Expect connect message to be visible
  await expect(page.getByText(EXPECTED_CONNECT_MESSAGE)).toBeVisible();
  
  // Expect "Find an agent" button to be visible
  await expect(page.getByRole(`button`, { name: `Find an Agent` })).toBeVisible();
  
  // Step 5
  // Click "Find an Agent" button to navigate to connect page
  const [agentPage] = await Promise.all([
    page.waitForEvent("popup"),
    page.getByRole(`button`, { name: `Find an Agent` }).click(),
  ]);
  
  // Expect "Fine the real estate agent" header to be visible
  await expect(agentPage.getByText(`Find the real estate agent`)).toBeVisible();
  
  // Expect url to end with "/connect"
  const isConnectPage = agentPage.url().endsWith("/connect");
  expect(isConnectPage).toBeTruthy();
  
  //--------------------------------
  // Clean up:
  //--------------------------------
  // Unclaim property used in workflow
  await page.bringToFront();
  await unclaimProperty(page, OFF_MARKET_PROPERTY);
  
});