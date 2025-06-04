const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius, cleanUpSavedHomes } = require("../../../lib/node_20_helpers");


test("hgse_256_platform_homepage_create_specific_header_quick_links", async () => {
 // Step 1. HGSE-256 - Platform Homepage- Create Specific Header Quick Links - Chrome
  //--------------------------------
  // Arrange: Log in to Homegenius 
  //--------------------------------
  
  // Login to Application
  const {page, context} = await logInHomegeniusUser()
  
  //--------------------------------
  // Assert: Assert user sees elements on the page
  //--------------------------------
  
  // Assert that "Find a home" is visible
  await expect(page.locator(`[data-testid="undecorate"] #nav-hyperlink-Find\\ a\\ Home`)).toBeVisible();
  
  // Assert that "Find an Agent" is visible
  await expect(page.locator(`[data-testid="undecorate"] #nav-hyperlink-Find\\ an\\ Agent`)).toBeVisible();
  
  // Click the "Account" button
  await page.locator(`#login-btn`).click();
  
  // Assert that we see "Saved Homes"
  await expect(page.locator(`a:has-text("Saved Homes")`)).toBeVisible();
  
  // Assert that we see "Saved Searches"
  await expect(page.locator(`a:has-text("Saved Searches")`)).toBeVisible();
  
  // Click "Explore More"
  await page.locator(`a:has-text("Explore More")`).click();
  
  // Assert that we see "Title", "Insurance", and "FAQs" in the "Explore More" menu
  await expect(page.locator(`#NavLinkSubMenu a:has-text("Title")`)).toBeVisible();
  await expect(page.locator(`#NavLinkSubMenu a:has-text("Insurance")`)).toBeVisible();
  await expect(page.locator(`#NavLinkSubMenu a:has-text("FAQs")`)).toBeVisible();
  
  //--------------------------------
  // Arrange: Go to homegenius (not logged in)
  //--------------------------------
  
  // Navigate to homegenius main page without login to the application 
  const {page:page2, context:context2} = await goToHomegenius()
  
  //--------------------------------
  // Act: Click Insurance and Title 
  //--------------------------------
  
  // Click "Explore More"
  await page2.locator(`a:has-text("Explore More")`).click();
  
  // Click "Title"
  await page2.locator('#NavLinkSubMenu a:has-text("Title")').click();
  
  // Set up a listener, click on "Title"
  const [newPage] = await Promise.all([
    context2.waitForEvent('page'),
    // Click the link that opens a new tab
    page2.click('button:has-text("Acknowledge")')
  ]);
  
  //--------------------------------
  // Assert: Assert that the links are opened in a new tab
  //--------------------------------
  
  // Ensure the new page is loaded
  await newPage.waitForLoadState();
  
  // Assert the new page's URL
  await expect(newPage).toHaveURL(`https://orders.mytitlegenius.com/`)
  
  // Close the page
  await newPage.close()
  await page2.bringToFront()
  
  // Click "Explore More"
  await page2.locator(`a:has-text("Explore More")`).click();
  
  // Set up a listener, click on "Insurance"
  const [newPage2] = await Promise.all([
    context2.waitForEvent('page'),
    // Click the link that opens a new tab
    page2.click('#NavLinkSubMenu a:has-text("Insurance")')
  ]);
  
  // Ensure the new page is loaded
  await newPage2.waitForLoadState();
  
  // Assert the new page's URL
  await expect(newPage2).toHaveURL(`https://getquote.itscovered.com/homegenius`)
  
  // Close the page
  await newPage2.close()
  
  //--------------------------------
  // Arrange: Navigate to homegenius main page logout from the application 
  //--------------------------------
  
  // Bring page back to front
  await page.bringToFront()
  
  //--------------------------------
  // Act: Logout
  //--------------------------------
  
  // Click the "Account" button
  await page.locator(`#login-btn`).click();
  
  // Click "Sign out"
  await page.locator(`button:has-text("Sign out")`).click();
  
  //--------------------------------
  // Assert: We see values, and clicking "Title Genius" and "Covered Insurance" hearder opens new tabs
  //--------------------------------
  
  // Assert that "Find a home" is visible
  await expect(page.locator(`[data-testid="undecorate"] #nav-hyperlink-Find\\ a\\ Home`)).toBeVisible();
  
  // Assert that "Find an Agent" is visible
  await expect(page.locator(`[data-testid="undecorate"] #nav-hyperlink-Find\\ an\\ Agent`)).toBeVisible();
  
  // Click "Explore More"
  await page.locator(`a:has-text("Explore More")`).click();
  
  // Assert that we see "Title", "Insurance", and "FAQs" in the "Explore More" menu
  await expect(page.locator(`#NavLinkSubMenu a:has-text("Title")`)).toBeVisible();
  await expect(page.locator(`#NavLinkSubMenu a:has-text("Insurance")`)).toBeVisible();
  
  // Click "Title"
  await page.locator('#NavLinkSubMenu a:has-text("Title")').click();
  
  // Set up a listener, click on "Title"
  const [newPage7] = await Promise.all([
    context.waitForEvent('page'),
    // Click the link that opens a new tab
    page.click('button:has-text("Acknowledge")')
  ]);
  
  // Ensure the new page is loaded
  await newPage7.waitForLoadState();
  
  // Assert the new page's URL
  await expect(newPage7).toHaveURL(`https://orders.mytitlegenius.com/`)
  
  // Close the page
  await newPage7.close()
  
  // Click "Explore More"
  await page.locator(`a:has-text("Explore More")`).click();
  
  // Set up a listener, click on "Insurance"
  const [newPage8] = await Promise.all([
    context.waitForEvent('page'),
    // Click the link that opens a new tab
    page.click('#NavLinkSubMenu a:has-text("Insurance")')
  ]);
  
  // Ensure the new page is loaded
  await newPage8.waitForLoadState();
  
  // Assert the new page's URL
  await expect(newPage8).toHaveURL(`https://getquote.itscovered.com/homegenius`)
  
});