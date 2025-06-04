const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_953_only_listings_in_vow_status_id_1_5_6_and_9_should_display_on_the_application", async () => {
 // Step 1. HGSE-953 Only Listings in VOWStatusID 1, 5,6, and 9 should Display on the Application
  // ---- Context
  // We found that MLS data from listings in VOWStatusIDs that are not 1 (Active), 5 (Pending), 6(Sold), or 9 (Coming Soon) are visible on the property details page for searching for the property.
  // Expected Behavior: Only listings in VOWStatusID 1, 5,6, and 9 should be displayed on the application.
  // Steps to Recreate:
  // 	•	Search for any address that has an MLS listing in VOWStatusID that is not 1,5,6, or 9.
  // https://docs.google.com/document/d/1C9P5IkVRlv-C0I4b-FNhfMC6AuAM1_Vv7D7EKK3EHrA/edit?usp=sharing
  
  //--------------------------------
  // Arrange:
  //--------------------------------
  // constants
  const searchAddress = {
    searchAddress: "4510 E Stevens Way, Rimrock AZ, 86335",
    searchAddr2: "4510 E Stevens Way",
    addressLineOne: "4510 E Stevens Way",
    addressLineTwo: "Rimrock AZ, 86335",
    addressAssert: "4510 E Stevens Way",
    addressAssert2: "Rimrock AZ, 86335",
    bed: `3  Beds`,
    bath: `1  Bath`,
  }
  
  const state = "CA"
  
  //--------------------------------------Step 1------------------------------------
  //--------------------------------------------------------------------------------
  // Login to https://qa-portal.homegeniusrealestate.com/
  // Enter a valid credentials, user id & a Password
  // https://qa-portal.homegeniusrealestate.com/ is launched
  
  // Login to Homeogenius UAT-Portal
  const { page, context } = await logInHomegeniusUser()
  
  // Take current url
  const url = page.url()
  console.log(url)
  
  // Go to home search and wait for load
  await page.goto(`${url}home-search`);
  
  // Close helper modal
  await page.locator(`span:text("close"):visible`).first().click();
  
  //--------------------------------
  // Act & Assert:
  //--------------------------------
  
  //--------------------------------------Step 2------------------------------------
  //--------------------------------------------------------------------------------
  // Enter a state or a city in the search bar
  // Fill in first address
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).type("Los Angeles, CA");
  
  // Click on the suggested location
  await page.locator(`button:has-text("Los AngelesCA")`).first().click();
  
  // Property results are displayed
  await expect(async () => {
    const propertyCount = await page.locator(`[data-testid="undecorate"]:has-text("CA")`).count();
    expect(propertyCount).toBeGreaterThanOrEqual(1);
  }).toPass({timeout: 30_000})
  
  //--------------------------------------Step 3------------------------------------
  //--------------------------------------------------------------------------------
  // Select any property from the property results page and search for VOWStatusID 9 & VOWStatusName 'COMINGSOON'
  // >'COMING SOON' status is displayed as 9
  
  try {
    // Click on the first listing showing coming soon
    await page.locator(
      `[data-testid="undecorate"]:has-text("${state}") [title="Coming Soon"]`
    ).first().click({timeout: 5000});
  } catch {
    // Check next page if none 
    await expect(async () => {
      await page.locator(`span:text("chevron_right"):visible`).last().click(); 
      await page.locator(
        `[data-testid="undecorate"]:has-text("${state}") [title="Coming Soon"]`
      ).first().click({timeout: 10_000});
    }).toPass({timeout: 280_000})
  }
  
  // Assert Vow data info
  // Assert Vow data info (robust)
  await expect(page.locator('pre')).toContainText('"vowStatusId": 9');
  await expect(page.locator('pre')).toContainText('"uiVowStatusName": "Coming Soon"');
  await expect(page.locator('pre')).toContainText('"vowStatusName": "Coming Soon"');
  
  
  // Assert Coming Soon status shows on property
  await expect(page.locator(
    `[font-size="0.875rem"]:text("Coming Soon")`
  )).toBeVisible();
  
  // Go back to search page
  await page.goBack();
  
  //--------------------------------------Step 4------------------------------------
  //--------------------------------------------------------------------------------
  // Search for any property, from the property results page which is in 'Active' status and 'Vow' Status id should be '1'(ACTIVE)
  // Property with 'ACTIVE' listing is displaying 'Vow' status id as '1' (ACTIVE)
  
  // Click on the first listing showing for Sale
  await page.locator(
    `[data-testid="undecorate"]:has-text("${state}") div:text("For Sale")`
  ).first().click();
  
  // Assert Vow data info
  await expect(page.locator(
    `div:text('"vowStatusId": 1')`
  )).toBeVisible();
  await expect(page.locator(
    `div:text('"uiVowStatusName": "Active"')`
  )).toBeVisible();
  try {
    await expect(page.locator(
      `div:text('"vowStatusName": "Active"')`
    )).toBeVisible({timeout: 10_000});
  } catch {
    await expect(page.locator(
      `div:text('"vowStatusName": "Active Under Contract"')`
    )).toBeVisible({timeout: 10_000});
  }
  
  // Assert Active status shows on property
  await expect(page.locator(
    `[font-size="0.875rem"]:text("Active")`
  )).toBeVisible();
  
  // Go back to search page
  await page.goBack();
  
  //--------------------------------------Step 5------------------------------------
  //--------------------------------------------------------------------------------
  // Search for any property, from the property results page which is in 'PENDING' status and 'Vow' Status id should be '5'(PENDING)
  // Property with 'PENDING'' listing is displaying 'Vow' status id as '5' (PENDING)
  
  try {
    // Click on the first listing showing Pending
    await page.locator(
      `[data-testid="undecorate"]:has-text("${state}") div:text("Pending")`
    ).first().click();
  } catch {
    // Check next page if none 
    await expect(async () => {
      await page.locator(`span:text("chevron_right"):visible`).last().click(); 
      // Click on the first listing showing Pending
      await page.locator(
        `[data-testid="undecorate"]:has-text("${state}") div:text("Pending")`
      ).first().click();
    }).toPass({timeout: 60_000})
  }
  
  // Assert Vow data info
  await expect(page.locator(
    `div:text('"vowStatusId": 5')`
  )).toBeVisible();
  await expect(page.locator(
    `div:text('"uiVowStatusName": "Pending"')`
  )).toBeVisible();
  await expect(page.locator(
    `div:text('"vowStatusName": "Pending"')`
  )).toBeVisible();
  
  // Assert Pending status shows on property
  await expect(page.locator(
    `[font-size="0.875rem"]:text("Pending")`
  )).toBeVisible();
  
  // Go back to search page
  await page.goBack();
  
  //--------------------------------------Step 6------------------------------------
  //--------------------------------------------------------------------------------
  // Search for any property, from the property results page which is in 'SOLD' status and 'Vow' Status id should be '6'(SOLD)
  // Search for any property, from the property results page which is in 'SOLD' status and 'Vow' Status id should be '6'(SOLD)
  
  await expect(async () => {
    // Click more
    await page.locator(`button:text("moreexpand_more")`).click();
  
    // Click on Listing Status
    await page.locator(`button:has-text("Listing Status")`).click({timeout: 3000});
  }).toPass({timeout: 30_000})
  
  // Click on Sold
  await page.locator(`[value="Sold"]`).click();
  
  // Click on Apply
  await page.locator(`button:text("Apply"):visible`).click();
  
  // Click on the first listing showing Sold
  await page.locator(
    `[data-testid="undecorate"]:has-text("${state}") div:text("Sold")`
  ).first().click();
  
  // Click on the Sold tab
  await page.locator(`button:text("Active") + button:text("Sold")`).click();
  
  // Assert Vow data info
  await expect(page.locator(
    `div:text('"vowStatusId": 6')`
  )).toBeVisible();
  await expect(page.locator(
    `div:text('"uiVowStatusName": ""')`
  )).toBeVisible();
  try {
    await expect(page.locator(
      `div:text('"vowStatusName": "Sold"')`
    )).toBeVisible({ timeout: 3 * 1000 });
  } catch {
    await expect(page.locator(
      `div:text('"vowStatusName": "Closed"')`
    )).toBeVisible({ timeout: 3 * 1000 });  
  }
  await expect(page.locator(
    `div:text('"sourceType": "Sold"')`
  )).toBeVisible();
  
  // Assert Sold status shows on property
  await expect(page.locator(
    `[font-size="0.875rem"]:text("Off Market: Sold")`
  )).toBeVisible();
  
});