import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("login_logout", async () => {
 // Step 1. Login
  // Constants and Helpers
  
  const user = {
    firstName: "QAW",
    lastName: "Preferred",
    email: process.env.DEFAULT_USER,
    password: process.env.UPDATED_PASS
  }
  
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  // Go to Homegenius site
  const { page, browser, context } = await goToHomegenius();
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Click the "Sign In" button
  const [page2] = await Promise.all([
    page.waitForEvent("popup"),
    page.locator(`#login-btn`).click(),
  ]);
  
  // Fill in "Email"
  await page2.locator(`[aria-label="Email Address"]`).fill(user.email);
  
  // Fill in "Password"
  await page2.locator(`[aria-label="Password"]`).fill(user.password);
  
  // Click "Sign in"
  await page2.locator(`#next`).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // Assertion - We see "Account" in the upper right hand corner
  await expect(page.locator(`button:has-text("Account")`)).toBeVisible()
  
  // Assertion - We do not see the "Sign in button"
  await expect(page.locator(`button:has-text("Sign in")`)).not.toBeVisible()
  
  // Click "Account"
  await page.locator(`button:has-text("Account")`).click()
  
  // Assertion - We see the user's name
  await expect(page.locator(`p:has-text("${user.firstName} ${user.lastName}")`)).toBeVisible()
  
  // Assertion - We see "Account Settings"
  await expect(page.locator(`a:has-text("Account Settings")`)).toBeVisible()
 // Step 2. Logout
  //--------------------------------
  // Arrange:
  //--------------------------------
  // N/a
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Click "Sign Out"
  await page.locator(`button:has-text("Sign Out")`).click()
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // Assertion - We the "Sign in" button in the upper right hand corner
  await expect(page.locator(`button:has-text("Sign in")`)).toBeVisible()
  
  // Assertion - We do not see the "Account"
  await expect(page.locator(`button:has-text("Account")`)).not.toBeVisible()
  
  // Click the "Sign In" button
  const [page3] = await Promise.all([
    page.waitForEvent("popup"),
    page.locator(`#login-btn`).click(),
  ]);
  
  // Assertion - We see the "Sign in" screen again
  await expect(page3.locator(`div.title:has-text("Welcome")`)).toBeVisible()
  
});