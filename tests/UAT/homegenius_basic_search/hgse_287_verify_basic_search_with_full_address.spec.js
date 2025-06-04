const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_287_verify_basic_search_with_full_address", async () => {
 // Step 1. HGSE-287 - Verify Basic Search with Full Address
  // Constants and Helpers
  
  // Construct search string
  function constructSearchString(sentence) {
    return sentence.split(" ").map(ele=>`:has-text("${ele}")`).join("")
  }
  
  const searchAddress = {
    searchAddress: "815 Northwinds Drive, Bryn Mawr, PA 19010",
    addressLineOne: "815 Northwinds Dr",
    addressLineTwo: "Bryn Mawr PA"
  }
  
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  // Log in with default user
  const {page, context} = await logInHomegeniusUser()
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Click "Find a Home"
  await page.locator(`[data-testid="undecorate"] #nav-hyperlink-Find\\ a\\ Home`).click({delay:4000});
  
  // Search address one in the search bar
  await page.locator(`ul + input:above(:text("Looking to Claim a Home?"))`).type(searchAddress.searchAddress, {delay:100});
  
  // Construct search string
  const searchString = `li${constructSearchString(searchAddress.addressLineOne)}:has-text("${searchAddress.addressLineTwo}")`
  
  // Click the first option that matches the address
  await page.locator(searchString).click({delay:4000})
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // Assert we are on the detailed listing page
  const addressOne = searchAddress.searchAddress.split(", ")[0]
  const addressTwo = searchAddress.searchAddress.split(", ").slice(1).join(", ")
  await expect(page.locator(`p:has-text("${searchAddress.addressLineOne}") + p:has-text("${addressTwo}")`)).toBeVisible()
  
  // Assert we are on the "Overview" tab
  await expect(page.locator(`button:has-text("Overview")`)).toHaveCSS(`border-bottom`,`4px solid rgb(31, 31, 255)`)
  
  // Assert we see the "Property Details"section
  await expect(page.locator(`div > div:text-is("Property Details")`)).toBeVisible()
  
  // Assert we see the "About" section
  await expect(page.locator(`div > p:text-is("About")`)).toBeVisible()
  
  // Assert the URL show's "/property-details/"
  await expect(page).toHaveURL(/property-details/)
  
});