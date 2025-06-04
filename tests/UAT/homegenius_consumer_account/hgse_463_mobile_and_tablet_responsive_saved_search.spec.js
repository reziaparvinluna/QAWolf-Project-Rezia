import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_463_mobile_and_tablet_responsive_saved_search", async () => {
 // Step 1. HGSE-463 [Mobile and Tablet Responsive] Create Saved Search
  //--------------------------------
  // Arrange:
  //--------------------------------
  //--------------------------------
  // Act:
  //--------------------------------
  //--------------------------------
  // Assert:
  //--------------------------------
  const searchkeyword = "santa clara"
  const savedSearchName = "newSearchName"+Date.now()
  const editedSavedSearchName = `${savedSearchName}Edited`
  
  //--------------------------------------------------------------------------------
  //---------------------------------    Step 1    ---------------------------------
  //--------------------------------------------------------------------------------
  // login
  const {page,context} = await logInHomegeniusUser({mobile: true})
  
  //--------------------------------------------------------------------------------
  //---------------------------------    Step 2    ---------------------------------
  //--------------------------------------------------------------------------------
  // Assert dropdown menu
  await page.locator(`#nav-link-menu-container`).click();
  await expect(page.locator(`[href="/claim-a-home"]`)).toBeVisible();
  await expect(page.locator(`[href="/find-a-home"] div:text("find a home")`)).toBeVisible();
  await expect(page.locator(`[href="/connect"]`)).toBeVisible();
  await expect(page.locator(`[href="https://orders.mytitlegenius.com/"]`)).toBeVisible();
  await expect(page.locator(`[href="https://getquote.itscovered.com/homegenius"]`)).toBeVisible();
  await expect(page.locator(`[href="/education-center"]`)).toBeVisible();
  await expect(page.locator(`[href="/geniusprice"] div:text-is("geniusprice")`)).toBeVisible();
  await expect(page.locator(`[href="/faq"]`)).toBeVisible();
  await expect(page.locator(`[href="/connect/agent"]`)).toBeVisible();
  
  // Assert account button
  await page.locator(`#login-btn`).click();
  await expect(page.locator(`[href$="consumer-account/saved-homes"]`)).toBeVisible();
  await expect(page.locator(`[href$="consumer-account/saved-searches"]`)).toBeVisible();
  await expect(page.locator(`[data-testid="undecorate"]:has-text("Account Settings")`)).toBeVisible();
  
  //--------------------------------------------------------------------------------
  //---------------------------------    Step 3    ---------------------------------
  //--------------------------------------------------------------------------------
  // Go to saved searches
  await page.locator(`[href$="consumer-account/saved-searches"]`).click();
  await expect(page.locator(`h1:has-text("Saved Searches")`)).toBeVisible();
  await page.waitForTimeout(5000);
  
  //--------------------------------------------------------------------------------
  //---------------------------------    Step 4 & 5  ---------------------------------
  //--------------------------------------------------------------------------------
  // Assert "saved searches" appears, and "save your searches and get ... appears"
  await expect(page.locator(`h1[color="#FFFFFF"]:has-text("saved searches")`)).toBeVisible();
  const element1 = page.locator(`h1[color="#FFFFFF"]:has-text("saved searches")`);
  await expect(element1).toHaveScreenshot(`element1.png`, { maxDiffPixelRatio: 0.1 });
  await expect(page.locator(`p[color="#FFFFFF"]:has-text("Save your searches and get notified when similar homes hit the market.")`)).toBeVisible();
  const element2 = page.locator(`p[color="#FFFFFF"]:has-text("Save your searches and get notified when similar homes hit the market.")`);
  await expect(element2).toHaveScreenshot(`element2.png`, { maxDiffPixelRatio: 0.1, delay:1000 });
  await expect(page.locator(`button[width="9.375rem"]:has-text("search")`)).toBeVisible();
  const element3 = page.locator(`button[width="9.375rem"]:has-text("search")`);
  await expect(element3).toHaveScreenshot(`element3.png`, { maxDiffPixelRatio: 0.1, delay:1000 });
  
  // Create a search record
  await page.locator(`h1:has-text("Saved Searches")+p+button:has-text("search")`).click();
  
  // wait for page to resolve 
  await page.waitForLoadState()
  await page.waitForTimeout(1000)
  
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).click();
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).fill(searchkeyword);
  
  // wait for page to resolve 
  await page.waitForLoadState()
  await page.waitForSelector(`div:has(ul) :text("Counties"):visible`)
  
  await page.locator(`button:has-text("${searchkeyword}")`).first().click();
  await page.waitForSelector(`:text("Listings")`)
  await page.waitForTimeout(5000);
  
  // save search
  await page.locator(`span:has-text("save")`).first().click();
  await page.locator(`[for="user-name"]`).click();
  await page.locator(`#user-name`).fill(savedSearchName);
  await page.locator(`button:has-text("save"):visible`).last().click();
  
  // Assert toaster
  await expect(page.locator(`#toast-container :text("search saved")`)).toBeVisible();
  await expect(page.locator(`#toast-container :text("search saved")`)).not.toBeVisible();
  
  
  
 // Step 2. Edit Saved Searches
  //--------------------------------
  // Arrange:
  //--------------------------------
  //--------------------------------
  // Act:
  //--------------------------------
  //--------------------------------
  // Assert:
  //--------------------------------
  
  //--------------------------------------------------------------------------------
  //---------------------------------   Step 6   ---------------------------------
  //--------------------------------------------------------------------------------
  
  // Assert the header menus are visible
  await page.mouse.wheel(0, -1000);
  await expect(page.locator(`#nav-link-menu-container`)).toBeVisible();
  await expect(page.locator(`#login-btn`)).toBeVisible();
  
  // Click account
  await page.locator(`#login-btn`).click();
  
  // Go to saved searches
  await page.locator(`[href$="consumer-account/saved-searches"]`).click();
  await expect(page.locator(`h1:has-text("Saved Searches")`)).toBeVisible();
  
  // Assert saved search is visible, 
  await expect(page.locator(`p:has-text("${savedSearchName}")`)).toBeVisible();
  
  // Assert edit and delete search button is visible
  await expect(page.locator(`div[overflow="visible"]:has-text("${savedSearchName}")+div button:has-text("edit")`)).toBeVisible();
  const editE = page.locator(`div[overflow="visible"]:has-text("${savedSearchName}")+div button:has-text("edit")`);
  await expect(editE).toHaveScreenshot(`editE1.png`, { maxDiffPixelRatio: 0.1, delay:1000 });
  
  await expect(page.locator(`div[overflow="visible"]:has-text("${savedSearchName}")+div button:has-text("delete")`)).toBeVisible();
  const deleteE = page.locator(`div[overflow="visible"]:has-text("${savedSearchName}")+div button:has-text("delete")`);
  await expect(deleteE).toHaveScreenshot(`deleteE1.png`, { maxDiffPixelRatio: 0.1, delay:1000 });
  
  await expect(page.locator(`div[overflow="visible"]:has-text("${savedSearchName}")+div button:has-text("search")`)).toBeVisible();
  const searchE = page.locator(`div[overflow="visible"]:has-text("${savedSearchName}")+div button:has-text("search")`);
  await expect(searchE).toHaveScreenshot(`searchE1.png`, { maxDiffPixelRatio: 0.1, delay:1000 });
  
  //--------------------------------------------------------------------------------
  //---------------------------------   Step 6 & 7  ---------------------------------
  //--------------------------------------------------------------------------------
  // Assert edit and delete text are not visible
  await expect(page.locator(`div[overflow="visible"]:has-text("${savedSearchName}") +div button:text("edit")`)).not.toBeVisible();
  await expect(page.locator(`div[overflow="visible"]:has-text("${savedSearchName}") +div button:text("delete")`)).not.toBeVisible();
  
  // click edit
  await page.locator(`div[overflow="visible"]:has-text("${savedSearchName}")+div button:has-text("edit")`).click();
  
  // edit name
  await page.locator(`label:has-text("Saved Search Name")+input`).click();
  await page.locator(`label:has-text("Saved Search Name")+input`).fill(editedSavedSearchName);
  await page.locator(`button:has-text("update"):visible`).last().click();
  
  // Assert toaster
  await expect(page.locator(`#toast-container[role="alert"]`)).toContainText(`Successfully updated saved search ${editedSavedSearchName}`)
  await expect(page.locator(`#toast-container[role="alert"]`)).not.toBeVisible()
  
 // Step 3. Delete Saved Searches
  //--------------------------------
  // Arrange:
  //--------------------------------
  //--------------------------------
  // Act:
  //--------------------------------
  //--------------------------------
  // Assert:
  //--------------------------------
  
  //--------------------------------------------------------------------------------
  //---------------------------------   Step 6 & 7 & 9   ---------------------------------
  //--------------------------------------------------------------------------------
  // Assert the header menus are visible while scrolling down
  await page.mouse.wheel(0, 1000);
  await expect(page.locator(`#nav-link-menu-container`)).toBeVisible();
  await expect(page.locator(`#login-btn`)).toBeVisible();
  await page.mouse.wheel(0, -1000);
  
  // Assert saved search is visible,
  await expect(
    page.locator(`p:has-text("${editedSavedSearchName}")`),
  ).toBeVisible();
  
  // Assert edit and delete button is visible
  await expect(
    page.locator(
      `div[overflow="visible"]:has-text("${editedSavedSearchName}")+div button:has-text("edit")`,
    ),
  ).toBeVisible();
  const editE1 = page.locator(
    `div[overflow="visible"]:has-text("${editedSavedSearchName}")+div button:has-text("edit")`,
  );
  await expect(editE1).toHaveScreenshot(`editE01new.png`, {
    maxDiffPixelRatio: 0.1,
    delay: 1000,
  });
  
  await expect(
    page.locator(
      `div[overflow="visible"]:has-text("${editedSavedSearchName}")+div button:has-text("delete")`,
    ),
  ).toBeVisible();
  const deleteE1 = page.locator(
    `div[overflow="visible"]:has-text("${editedSavedSearchName}")+div button:has-text("delete")`,
  );
  await expect(deleteE1).toHaveScreenshot(`deleteE1.png`, {
    maxDiffPixelRatio: 0.1,
    delay: 1000,
  });
  
  await page.waitForTimeout(3000);
  await expect(
    page.locator(
      `div[overflow="visible"]:has-text("${editedSavedSearchName}")+div button:has-text("search")`,
    ),
  ).toBeVisible();
  const searchE1 = page.locator(
    `div[overflow="visible"]:has-text("${editedSavedSearchName}")+div button:has-text("search")`,
  );
  
  try {
    await expect(searchE1).toHaveScreenshot(`searchE01.png`, {
      maxDiffPixelRatio: 0.2,
      delay: 1000,
    });
  } catch {
    await expect(searchE1).toHaveScreenshot(`searchE01B.png`, {
      maxDiffPixelRatio: 0.2,
      delay: 1000,
    });
  }
  
  
  
  // click delete
  await page
    .locator(
      `div[overflow="visible"]:has-text("${savedSearchName}")+div button:has-text("delete")`,
    )
    .click();
  await page.locator(`button:has-text("delete"):visible`).last().click();
  
  // Assert toaster
  await expect(
    page.locator(`#toast-container :text("saved search deleted")`),
  ).toBeVisible();
  await expect(
    page.locator(`#toast-container :text("saved search deleted")`),
  ).not.toBeVisible();
  
  // Assert saved search is not visible,
  await expect(
    page.locator(`p:has-text("${editedSavedSearchName}")`),
  ).not.toBeVisible();
  
 // Step 4. Verify Saved searches UI on iphone 14
  //--------------------------------
  // Arrange:
  //--------------------------------
  const url = process.env.URL_HOMEGENIUS;
  
  // Navigate to DEFAULT_URL
  const { browser, context: context1 } = await launch({...devices['iPhone 14']});
  
  await context1.grantPermissions(['geolocation'], { origin: url });
  const page1 = await context1.newPage();
  await page1.goto(url, { waitUntil: "domcontentloaded" });
  
  // Closes "Check out what's new" modal if it appears
  if (await page1.getByText(`Check out what’s new:`).count() > 0) {
    await page1.getByRole(`button`, { name: `close` }).click();
  }
  
  // Click the "Sign In" button
  const [page2] = await Promise.all([
    page1.waitForEvent("popup"),
    page1.locator(`#login-btn`).click(),
  ]);
  
  // Fill in "Email"
  await page2.locator(`[aria-label="Email Address"]`).fill(process.env.DEFAULT_USER);
  
  // Fill in "Password"
  await page2.locator(`[aria-label="Password"]`).fill(process.env.UPDATED_PASS);
  
  // Click "Sign in"
  await page2.locator(`#next`).click();
  
  // Assertion - We see "Account" in the upper right hand corner
  await expect(page1.locator(`button:has-text("Account")`)).toBeVisible()
  
  //--------------------------------------------------------------------------------
  //---------------------------------    Step 1,2,3    ---------------------------------
  //--------------------------------------------------------------------------------
  // Assert dropdown menu
  await page1.locator(`#nav-link-menu-container`).click();
  await expect(page1.locator(`[href="/claim-a-home"]`)).toBeVisible();
  await expect(page1.locator(`[href="/find-a-home"] div:text("find a home")`)).toBeVisible();
  await expect(page1.locator(`[href="/connect"]`)).toBeVisible();
  await expect(page1.locator(`[href="https://orders.mytitlegenius.com/"]`)).toBeVisible();
  await expect(page1.locator(`[href="https://getquote.itscovered.com/homegenius"]`)).toBeVisible();
  await expect(page1.locator(`[href="/education-center"]`)).toBeVisible();
  await expect(page1.locator(`[href="/geniusprice"] div:text-is("geniusprice")`)).toBeVisible();
  await expect(page1.locator(`[href="/faq"]`)).toBeVisible();
  await expect(page1.locator(`[href="/connect/agent"]`)).toBeVisible();
  
  // Assert account button
  await page1.locator(`#login-btn`).click();
  await expect(page1.locator(`[href$="consumer-account/saved-homes"]`)).toBeVisible();
  await expect(page1.locator(`[href$="consumer-account/saved-searches"]`)).toBeVisible();
  await expect(page1.getByRole(`link`, { name: `Claimed Homes` })).toBeVisible();
  await expect(page1.getByRole(`link`, { name: `Account Settings` })).toBeVisible();
  
  // Go to saved searches
  await page1.locator(`[href$="consumer-account/saved-searches"]`).click();
  await expect(page1.locator(`h1:has-text("Saved Searches")`)).toBeVisible();
  await page1.waitForTimeout(5000);
  
  //--------------------------------------------------------------------------------
  //---------------------------------    Step 4,5   ---------------------------------
  //--------------------------------------------------------------------------------
  // Assert "saved searches" appears, and "save your searches and get ... appears"
  await expect(page1.locator(`h1[color="#FFFFFF"]:has-text("saved searches")`)).toBeVisible();
  const element5 = page1.locator(`h1[color="#FFFFFF"]:has-text("saved searches")`);
  await expect(element5).toHaveScreenshot(`element1s.png`, { maxDiffPixelRatio: 0.1 });
  await expect(page1.locator(`button[width="9.375rem"]:has-text("search")`)).toBeVisible();
  const element4 = page1.locator(`button[width="9.375rem"]:has-text("search")`);
  await expect(element4).toHaveScreenshot(`element2s.png`, { maxDiffPixelRatio: 0.1, delay:1000 });
  
  // Create a search record
  await page1.locator(`h1:has-text("Saved Searches")+button:has-text("search")`).click();
  await page1.getByRole(`button`, { name: `search`, exact: true }).click();
  await page1.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).fill(searchkeyword);
  await page1.locator(`button:has-text("${searchkeyword}")`).first().click();
  await page1.waitForSelector(`:text("Listings")`)
  await page1.waitForTimeout(5000);
  
  // save search
  await page1.getByRole(`button`, { name: `search`, exact: true }).click();
  await page1.locator(`span:has-text("save")`).first().click();
  await page1.locator(`[for="user-name"]`).click();
  await page1.locator(`#user-name`).fill(savedSearchName);
  await page1.locator(`button:has-text("save"):visible`).last().click();
  
  // Assert toaster
  await expect(page1.locator(`#toast-container :text("search saved")`)).toBeVisible();
  await expect(page1.locator(`#toast-container :text("search saved")`)).not.toBeVisible();
  
  // Assert the header menus are visible
  await page1.mouse.wheel(0, -1000);
  await expect(page1.locator(`#nav-link-menu-container`)).toBeVisible();
  await expect(page1.locator(`#login-btn`)).toBeVisible();
  
  // Click account
  await page1.locator(`#login-btn`).click();
  
  // Go to saved searches
  await page1.locator(`[href$="consumer-account/saved-searches"]`).click();
  await expect(page1.locator(`h1:has-text("Saved Searches")`)).toBeVisible();
  
  // Assert saved search is visible, 
  await expect(page1.locator(`p:has-text("${savedSearchName}")`)).toBeVisible();
  
  //--------------------------------------------------------------------------------
  //---------------------------------    Step 6,7   ---------------------------------
  //--------------------------------------------------------------------------------
  
  // Assert edit, delete, search button is visible
  await expect(page1.locator(`div[overflow="visible"]:has-text("${savedSearchName}")+div button:has-text("edit")`)).toBeVisible();
  const editE2 = page1.locator(`div[overflow="visible"]:has-text("${savedSearchName}")+div button:has-text("edit")`);
  await expect(editE2).toHaveScreenshot(`editE2.png`, { maxDiffPixelRatio: 0.1, delay:1000 });
  
  await expect(page1.locator(`div[overflow="visible"]:has-text("${savedSearchName}")+div button:has-text("delete")`)).toBeVisible();
  const deleteE2 = page1.locator(`div[overflow="visible"]:has-text("${savedSearchName}")+div button:has-text("delete")`);
  await expect(deleteE2).toHaveScreenshot(`deleteE2.png`, { maxDiffPixelRatio: 0.1, delay:1000 });
  
  await expect(page1.locator(`div[overflow="visible"]:has-text("${savedSearchName}")+div+div button:has-text("search")`)).toBeVisible();
  const searchE2 = page1.locator(`div[overflow="visible"]:has-text("${savedSearchName}")+div+div button:has-text("search")`);
  await expect(searchE2).toHaveScreenshot(`searchE2.png`, { maxDiffPixelRatio: 0.1, delay:1000 });
  
  // cleanUP
  // click delete
  await page1.locator(`div[overflow="visible"]:has-text("${savedSearchName}")+div button:has-text("delete")`).click();
  await page1.locator(`button:has-text("delete"):visible`).last().click();
  
  // Assert toaster
  await expect(page1.locator(`#toast-container :text("saved search deleted")`)).toBeVisible();
  await expect(page1.locator(`#toast-container :text("saved search deleted")`)).not.toBeVisible();
  
  // Assert saved search is not visible, 
  await expect(page1.locator(`p:has-text("${savedSearchName}")`)).not.toBeVisible();
  
});