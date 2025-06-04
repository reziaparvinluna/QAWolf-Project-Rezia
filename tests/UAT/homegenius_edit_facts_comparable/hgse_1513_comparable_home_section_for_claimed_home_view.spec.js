import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_1513_comparable_home_section_for_claimed_home_view", async () => {
 // Step 1. HGSE-1513 - Comparable Home Section for Claimed Home View
  // Constants and Helpers
  
  const property = {
    searchAddress: "421 Westview Drive, KY 42134",
    addressLineOne: "421 Westview Dr",
    city: "Franklin",
    state:"KY",
    zip:"42134"
  }
  
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  // Log in user
  const {page, context} = await logInHomegeniusUser()
  
  // Clean up if needed
  await unclaimProperty (page, property)
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Click on Claim a Home
  await page.locator(`[data-testid="undecorate"] #nav-hyperlink-Claim\\ a\\ Home`).click();
  
  // Fill in Address
  await page.locator(`[placeholder="Enter an Address"]`).first().fill(property.searchAddress);
  
  await expect(async () => {
    // Click the search bar until we see the results
    await page.locator(`[placeholder="Enter an Address"]`).first().click({timeout:10_000});
  
    // Expect the search results to appear
    await expect(page.locator(`ul li:visible`).first()).toBeVisible({timeout:10_000})
  
  }).toPass({timeout:60_000})
  
  // Click on Claim
  await page.locator(`li:has-text("${property.addressLineOne}")`).first().click();
  
  // Click on I own this home
  await page.locator(`#Own`).click();
  
  // Click on Yes, add it to my profile
  await page.locator(`button:text("Yes, add it to my profile")`).click(); 
  
  // Click "Next"
  await page.locator(`button:has-text("Next")`).click({ timeout: 75 * 1000 }); 
  
  // Assert that there are a maximum of 15 comparable homes in grid view
  expect(await page.locator(`button:has-text("Select home")`).count()).toBeLessThanOrEqual(15)
  
  // Click "List"
  await page.locator(`span:has-text("List")`).click()
  
  // Assert that there are a maximum of 15 comparable homes in list view
  const rowLocator = page.locator(`tr:has(input[type="checkbox"])`)
  expect(await rowLocator.count()).toBeLessThanOrEqual(15)
  
  // Select a random number of homes [3-5] homes
  const randomNumber = faker.datatype.number({ min: 3, max: 5 });
  const homes = []
  
  for(let i=0;i<randomNumber;i++) {
    const savedHome = {}
    const address = await rowLocator.nth(i).locator(`td`).nth(0).innerText()
    const soldPrice = await rowLocator.nth(i).locator(`td`).nth(1).innerText()
  
    savedHome.address = address;
    savedHome.soldPrice = soldPrice;
    homes.push(savedHome)
    await rowLocator.nth(i).click()
  }
  
  console.log("Homes! ", homes)
  
  // Click "Done"
  await page.locator(`button:has-text("Done")`).click(); 
  
  // Click "Continue to property view"
  await page.getByRole(`button`, { name: `Continue to property view` }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // Assert the comparable homes appear on the property details page
  await expect(page).toHaveURL(/property-details/)
  await expect(page.locator(`.card-media-container + div`)).toHaveCount(homes.length)
  
  // Click on comparable homes tab
  await page.locator(`button:has-text("Comparables Properties")`).click();
  
  // Iterate to make sure the homes are the same as the ones we claimed
  for( let i=0; i<homes.length;i++) {
    const home = homes[i]
    await expect(page.locator(`.card-media-container + div:has-text("${home.address}"):has-text("${home.soldPrice}")`)).toBeVisible()
  }
  
  // Assert we "Remove" and "Select New Comparables" button next to "Your Selected Comparables" header
  await expect(page.locator(`p:Has-text("Your Selected Comparables") + div:has(button:has-text("Remove")):has(button:has-text("Select New Comparables"))`)).toBeVisible()
  
  // Click "Remove"
  await page.locator(`p:Has-text("Your Selected Comparables") + div button:has-text("Remove")`).click();
  
  // Assert that the modal appears
  await expect(page.locator(`div:text-is("Confirm Remove Comparables")`)).toBeVisible()
  
  // Click "Close"
  await page.locator(`div:text-is("Confirm Remove Comparables") span:text-is("close"):visible`).click()
  
  // Assert we still see the homes
  await expect(page.locator(`.card-media-container + div`)).toHaveCount(homes.length)
  
  // Click "Remove"
  await page.locator(`p:Has-text("Your Selected Comparables") + div button:has-text("Remove")`).click();
  
  // Click "Remove"
  await page.locator(`button:has-text("cancel") + button:has-text("Remove"):visible`).click();
  
  // Assert that the homes are now gone
  await expect(page.locator(`.card-media-container + div`)).toHaveCount(0)
  await expect(page.locator(`.card-media-container + div`)).not.toHaveCount(homes.length)
  
  // Click "Select" under comparable homes
  await page.locator(`#CLAIMED_VIEW_COMPARABLES [width="auto"]`).click();
  
  // Assert that there are a maximum of 15 comparable homes in grid view
  expect(await page.locator(`button:has-text("Select home")`).count()).toBeLessThanOrEqual(15)
  
  // Click "List"
  await page.locator(`span:has-text("List")`).click()
  
  // Assert that there are a maximum of 15 comparable homes in list view
  const rowLocator1 = page.locator(`tr:has(input[type="checkbox"])`)
  expect(await rowLocator1.count()).toBeLessThanOrEqual(15)
  
  // Click "Close"
  await page.locator(`div:has(>div > p:has-text("${property.addressLineOne}")) button:Has-text("close"):visible`).click()
  
  // Click "Close"
  await page.locator(`button:has-text("Continue Editing") + button:has-text("Close"):visible`).click();
  
  // Assert we're back on the property details page
  await expect(page).toHaveURL(/property-details/)
  
  //--------------------------------
  // Clean up:
  //--------------------------------
  
  // Clean up
  await unclaimProperty (page, property)
});