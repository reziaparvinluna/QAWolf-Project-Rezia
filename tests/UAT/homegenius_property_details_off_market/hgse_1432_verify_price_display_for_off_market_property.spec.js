import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_1432_verify_price_display_for_off_market_property", async () => {
 // Step 1. HGSE-1432: Verify Price display for Off market property
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const address = {
    search: "4 Fairlawn Avenue Albany, NY 12203",
    click: "4 Fairlawn Ave",
    perSqft: '199'
  }
  const address2 = {
    search: "19 Cherrywood Way, Unit 9 Smyrna, NY 13436",
    click: "19 Cherrywood Way",
    text: "Off Market: Sold Feb 28, 2023 for $92,000"
  }
  
  // Go to URL
  const {page, context} = await goToHomegenius();
  
  // Click on Find a Home
  await page.getByRole(`link`, { name: `Find a Home`, exact: true }).click();
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Step 1 
  // Search for a property that was sold within a year an is from state that 
  // we allowed to display prices
  
  // Fill in Address
  await page.locator(
    `[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`
  ).first().fill(address.search);
  
  // Click on Addresss
  await page.locator(`button:has-text("${address.click}")`).click();
  
  // Verify:
  // under the price the will be the price per sqft in parentheses
  await expect(page.getByText(`($${address.perSqft}/sqft)`)).toBeVisible();
  
  // under the price per sqft will be this verbiage: "Last Sold Price"
  await expect(page.getByText(`Last Sold Price`)).toBeVisible();
  
  // Step 2
  // Search for a property that was sold more than a year ago
  
  // Click on Find a Home
  await page.getByRole(`link`, { name: `Find a Home`, exact: true }).click();
  
  // Fill in Address
  await page.locator(
    `[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`
  ).first().fill(address2.search);
  
  // Click on Addresss
  await page.locator(`button:has-text("${address2.click}")`).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Verify 
  // when an Off-Market property has a sale price that is older than a year old the price 
  // should display after the last sold date which is after the status
  await expect(page.getByText(`${address2.text}`)).toBeVisible();
  
  // price per sqft will not display and neither will "Last Sold Price"
  await expect(page.getByText(`(/sqft)`)).not.toBeVisible();
  await expect(page.getByText(`Last Sold Price`)).not.toBeVisible();
  
  
});