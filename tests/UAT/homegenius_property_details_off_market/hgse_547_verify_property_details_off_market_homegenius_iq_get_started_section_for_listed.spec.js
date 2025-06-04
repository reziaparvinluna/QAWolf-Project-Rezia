import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_547_verify_property_details_off_market_homegenius_iq_get_started_section_for_listed", async () => {
 // Step 1. HGSE-547: Verify Property Details - Off Market: homegeniusIQ Get Started Section for Listed - Active/Pending
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Step 1
  // Login_ HGCOM-3050
  // User should be on the Application
  const { page, context } = await logInHomegeniusUser();
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Step 2
  // Search with a City/State and select a property card from the Home-Search Page
  // https://uat-portal.homegeniusrealestate.com/find-a-home
  // https://qa-portal.homegeniusrealestate.com/find-a-home
  // User should click 1st property card in listing.
  // User should be on Property Details Page.
  // User should be able to claim the Active/Pending Status home from the tri-dot Claim Home option.
  // Home should be claimed.
  
  // Click on Find a Home
  await page.getByRole(`link`, { name: `Find a Home`, exact: true }).click();
  
  // Fill in City State
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).first().fill(`Roseville, CA`);
  
  // Click on Search
  await page.getByRole(`button`, { name: `Search` }).first().click({delay: 3000});
  
  const saleProperty = await page.locator(
    `[data-testid="undecorate"]:has-text("$") >> nth=2 >> [type="LARGE_CARD"] [type="LARGE_CARD"]`
  ).first().innerText();
  
  // Click on the first property card
  await page.locator(`[data-testid="undecorate"]:has-text("$") >> nth=2`).click();
  
  // Soft assert we are at the property details page
  await expect(() => {
    expect(page.url()).toContain('/property-details')
  }).toPass({timeout: 30_000})
  
  // Check if the home is already claimed and release claim
  try {
    // Soft assert home is claimed
    await expect(page.locator(`span:text("Claimed View")`)).toBeVisible({timeout: 10_000});
    // Click on the tri-dot option
    await page.locator(`[aria-label="Claimed property options menu button"]`).click();
    // Click on Release Claim
    await page.getByText(`Release Claim`).click();
    // Click Yes, release property
    await page.getByRole(`button`, { name: `Yes, release property` }).click();
    // Soft assert home is Not claimed
    await expect(page.locator(`span:text("Claimed View")`)).not.toBeVisible();
  } catch (e){
    console.log(e)
  }
  
  // Click on the tri-dot option
  await page.locator(`[aria-label="Property options menu button"]`).click();
  
  // Click on Claim Home
  await page.locator(`div`).filter({ hasText: /^Claim Home$/ }).click();
  
  // Click on I own this home
  await page.locator(`#Own`).click();
  
  // Click Yes, add it to my profile
  await page.getByRole(`button`, { name: `Yes, add it to my profile` }).click();
  
  // Click to close the helper modal
  await page.locator(`[id="__next"]`).getByRole(`button`, { name: `close` }).click();
  
  // Click on Skip and Close
  await page.getByRole(`button`, { name: `Skip and Close` }).click();
  
  try {
    // Click on Continue to property view
    await page.getByRole(`button`, { name: `Continue to property view` }).click({timeout: 5000});
  } catch {
    // Click Close to close confirm modal
    await page.getByRole(`button`, { name: `Close`, exact: true }).click();
  }
  
  // Soft assert home is claimed
  await expect(page.locator(`span:text("Claimed View")`)).toBeVisible();
  await page.waitForTimeout(2000);
  
  // Create a regex pattern to handle spelling variations
  const addressRegex = createFlexibleAddressRegex(
      saleProperty.replace(/\s*(Unit|#)\s*\d+/, '').trim()
    );
  
  try{
  // Soft Assert address is correct
  await expect(page.locator('[id="CLAIMED_VIEW_PRICES"]', { hasText: addressRegex }))
  .toBeVisible({timeout: 10_000});
  } catch {
  
    // Remove suffixes (St, Ave, Blvd, etc.)
    const cleanedAddress = saleProperty
      .replace(/\s*(Unit|#)\s*\d+/, '') 
      .replace(/\b(Street|St|Road|Rd|Lane|Ln|Avenue|Ave|Boulevard|Blvd|Drive|Dr|Court|Ct|Place|Pl|Square|Sq|Highway|Hwy|Parkway|Pkwy|Terrace|Ter|Circle|Cir|Trail|Trl|Way)\b/gi, '')
      .replace(/\s+/g, ' ') 
      .trim();
  
    await expect(
      page.locator('[id="CLAIMED_VIEW_PRICES"]').filter({ hasText: new RegExp(cleanedAddress, 'i') })
    ).toBeVisible({ timeout: 10_000 });
  }
  
  
  // Step 3
  // Verify if Visible on property details page
  // homegeniusIQ
  // HomegeniusIQ section should display and remain the same as currently on Claimed View and Public View.
  
  // Soft assert we are at the property details page
  expect(page.url()).toContain('/property-details')
  
  // Assert homegeniusIQ tab
  await expect(page.getByRole(`button`, { name: `homegeniusIQ` })).toBeVisible();
  
  // Assert homegeniusIQ section
  await expect(page.locator(
    `[id="CLAIMED_VIEW_HG_IQ"]`
  )).toHaveScreenshot('hgiq', {maxDiffPixelRatio: 0.01});
  
  
 // Step 2. HomegeniusIQ for Sold Listings
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Step 4
  // Select Search Button from the top of Property Details Page.
  // Click on Sold Radio Button from For Sale field on top from Home Search Page
  // Select a sold property card from the Home-Search Page
  // Wait for redirected to property details off market page
  // User should click 1st property card in listing (Off Market). 
  // User should be on Property Details Page.
  // User should be able to claim the Off market Status home from the tri-dot Claim Home option or Claim Home Icon on top. Edit the claim home on Edit Home Facts Modal.
  // Home should be claimed.
  
  // Click on Back Search Button
  await page.getByRole(`button`, { name: `arrow_back Search` }).click();
  
  // Click on For Sale Dropdown
  await page.getByRole(`button`, { name: `FOR SALE expand_more` }).click();
  
  // Click on Sold
  await page.getByRole(`button`, { name: `Sold` }).click();
  
  // Click on Done
  await page.getByRole(`button`, { name: `Done` }).click();
  
  // wait for results to fully load
  await page.waitForTimeout(5000);
  
  const soldProperty = await page.locator(
    `[data-testid="undecorate"]:has-text("$") >> nth=2 >> [type="LARGE_CARD"] [type="LARGE_CARD"]`
  ).first().innerText();
  console.log(soldProperty)
  
  // Click on the first property card displaying for Sold
  await page.locator(`[data-testid="undecorate"]:has-text("$")`).nth(2).click({delay: 1000});
  
  // Soft assert we are at the property details page
  await expect(() => {
    expect(page.url()).toContain('/property-details')
  }).toPass({timeout: 60_000})
  
  // Check if the home is already claimed and release claim
  try {
    // Soft assert home is claimed
    await expect(page.locator(`span:text("Claimed View")`)).toBeVisible({timeout: 10_000});
    // Click on the tri-dot option
    await page.locator(`[aria-label="Claimed property options menu button"]`).click();
    // Click on Release Claim
    await page.getByText(`Release Claim`).click();
    // Click Yes, release property
    await page.getByRole(`button`, { name: `Yes, release property` }).click();
    // Soft assert home is Not claimed
    await expect(page.locator(`span:text("Claimed View")`)).not.toBeVisible();
  } catch (e){
    console.log(e)
  }
  
  // Click on the tri-dot option
  await page.getByLabel(`Property options menu button`).click();
  
  // Click on Claim Home
  await page.locator(`div`).filter({ hasText: /^Claim Home$/ }).click();
  
  // Click on I own this home
  await page.locator(`#Own`).click();
  
  // Click Yes, add it to my profile
  await page.getByRole(`button`, { name: `Yes, add it to my profile` }).click();
  
  // Click to close the helper modal
  await page.locator(`[id="__next"]`).getByRole(`button`, { name: `close` }).click();
  
  // Click on Skip and Close
  await page.getByRole(`button`, { name: `Skip and Close` }).click({timeout: 60_000});
  
  try {
    // Click on Continue to property view
    await page.getByRole(`button`, { name: `Continue to property view` }).click({timeout: 5000});
  } catch {
    // Click Close to close confirm modal
    await page.getByRole(`button`, { name: `Close`, exact: true }).click();
  }
  
  // Soft assert home is claimed
  await expect(page.locator(`span:text("Claimed View")`)).toBeVisible();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Step 5
  // Verify if Visible on property details page
  // homegeniusIQ
  // HomegeniusIQ section should display and remain the same as currently on Claimed View and Public View.
  
  // Preprocess the soldProperty address to remove the unit and number
  const formattedAddress = soldProperty.replace(/\s*(Unit|#)\s*\d+/, '').trim();
  
  try {
    // Create a regex pattern to handle spelling variations
    const addressSoldProperty = createFlexibleAddressRegex(formattedAddress);
  
    // Soft assert address is correct
    await expect(
      page.locator('[id="CLAIMED_VIEW_PRICES"]').filter({ hasText: addressSoldProperty })
    ).toBeVisible({ timeout: 10_000 });
  
  } catch {
    // Now clean the original string, not the regex
    let cleanAddress = formattedAddress
      .replace(/\s*(Unit|#)\s*\d+/, '') 
      .replace(/\b(Street|St|Road|Rd|Lane|Ln|Avenue|Ave|Boulevard|Blvd|Drive|Dr|Court|Ct|Place|Pl|Square|Sq|Highway|Hwy|Parkway|Pkwy|Terrace|Ter|Circle|Cir|Trail|Trl|Way)\b/gi, '')
      .replace(/\s+/g, ' ') 
      .trim();
  
    // Assert again, lighter
    await expect(
      page.locator('[id="CLAIMED_VIEW_PRICES"]').filter({ hasText: new RegExp(cleanAddress, 'i') })
    ).toBeVisible({ timeout: 10_000 });
  }
  
  
  // Assert we are at the property details page
  expect(page.url()).toContain('/property-details')
  
  // Assert homegeniusIQ tab
  await expect(page.getByRole(`button`, { name: `homegeniusIQ` })).toBeVisible();
  
  // Assert homegeniusIQ Section
  await expect(page.locator(
    `[id="CLAIMED_VIEW_HG_IQ"]`
  )).toHaveScreenshot('hgiq', {maxDiffPixelRatio: 0.01});
  
});