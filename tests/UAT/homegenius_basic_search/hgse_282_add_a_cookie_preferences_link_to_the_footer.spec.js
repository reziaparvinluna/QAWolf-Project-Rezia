import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_282_add_a_cookie_preferences_link_to_the_footer", async () => {
 // Step 1. HGSE-282: Add a “Cookie Preferences” Link to the Footer
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Step 1 
  // Login to https://qa-portal.homegeniusrealestate.com/
  
  const { page, context } = await logInHomegeniusUser();
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Step 2 
  // Navigate and validate if 'Cookie Preferences' link on the Footer of the main page
  await page.getByRole(`button`, { name: `Cookie Preferences` }).scrollIntoViewIfNeeded();
  
  // Assert Cookie Preferences button
  await expect(page.getByRole(`button`, { name: `Cookie Preferences` })).toBeVisible();
  
  // Step 3 
  // Navigate to search results page and validate  if 'Cookie Preferences' link on the Footer of the main page
  
  // Go to home-search
  await page.goto(`${process.env.URL_HOMEGENIUS}/home-search/`)
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // Step 4 
  // A link labeled 'Cookies Preferences' in the link list in the homegeniusrealestate footer; the link should be placed after the 'Licensing and Disclosure Information' link
  // Navigate and validate if 'Cookie Preferences' link on the Footer of the main page
  await page.getByRole(`button`, { name: `Cookie Preferences` }).scrollIntoViewIfNeeded();
  
  // Assert Cookie Preferences button
  await expect(page.locator(
    `div:has-text("Licensing and Disclosure Information") ~ button:text("Cookie Preferences")`
  )).toBeVisible();
  
  // Step 5 
  // When a user clicks the 'Cookie Preferences' link, a OneTrust sponsored modal will open
  
  // Click on Cookie Preference Button
  await page.getByRole(`button`, { name: `Cookie Preferences` }).click();
  
  // Assert Onetrust modal
  await expect(page.locator(`[alt="Powered by Onetrust"]`)).toBeVisible();
  
  // Assert header
  await expect(page.getByRole(`heading`, { name: `Your Privacy` })).toBeVisible();
  
  // Assert message
  await expect(page.locator(`#ot-pc-desc`)).toBeVisible();
  
  // Assert Privacy Preference Center header
  await expect(page.getByRole(`heading`, { name: `Privacy Preference Center` })).toBeVisible();
  
  // Assert Option Strictly Necessary Cookies
  await expect(page.getByLabel(`Strictly Necessary Cookies`)).toBeVisible();
  
  // Assert Performance Cookies
  await expect(page.getByRole(`button`, { name: `Performance Cookies` })).toBeVisible();
  
  // Assert Functional Cookies
  await expect(page.getByRole(`button`, { name: `Functional Cookies` })).toBeVisible();
  
  // Assert Targeting Cookies
  await expect(page.getByRole(`button`, { name: `Targeting Cookies` })).toBeVisible();
});