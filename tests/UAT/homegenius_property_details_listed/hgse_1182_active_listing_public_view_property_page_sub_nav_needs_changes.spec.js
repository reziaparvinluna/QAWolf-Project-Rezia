import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_1182_active_listing_public_view_property_page_sub_nav_needs_changes", async () => {
 // Step 1. HGSE-1182 - Verify Default State of PropertyPage
  // Constants
  
  const searchCity = "Dallas TX";
  const city = "Dallas";
  const state = "TX";
  const email = "yong@qawolf.com";
  const password = "Secret123456!";
  
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  // Log in user
  const { page, context } = await logInHomegeniusUser({ email, password });
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  //--------------------------------------Step 1------------------------------------
  //--------------------------------------------------------------------------------
  
  // Search for an active property and open property detail page
  //  Search for properties in regions: 1613, 1832, 1612,1864, 1966. Ex - Houston TX or Laytonville CA
  
  // Click "Find a home"
  await page
    .locator(`[data-testid="undecorate"] #nav-hyperlink-Find\\ a\\ Home`)
    .click();
  
  // Search
  await page
    .locator(
      `[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`,
    )
    .first()
    .fill(searchCity);
  
  // Click on Houston
  await page
    .locator(
      `li:has(p:has(b:text-is("${city}"))+p:text-is("${state}"):visible):visible`,
    )
    .first()
    .click({delay: 1000});
  
  // Click "Search"
  await page.getByRole(`button`, { name: `Search` }).first().click();
  
  // Close map overlay
  await page.getByRole(`button`, { name: `close` }).nth(1).click();
  
  // Pause for the UI
  await page.waitForTimeout(10_000);
  
  // Grab the first and second address
  const firstAddressN = 6;
  const secondAddressN = firstAddressN + 1;
  
  const firstAddressUnformat = await page
    .locator(
      `div[type="LARGE_CARD"]:visible > [type="LARGE_CARD"]:has(+div[font-size="0.875rem"])`,
    )
    .nth(firstAddressN)
    .innerText();
  const firstAddress = expandStreetAbbreviations(firstAddressUnformat);
  const secondAddressUnformat = await page
    .locator(
      `div[type="LARGE_CARD"]:visible > [type="LARGE_CARD"]:has(+div[font-size="0.875rem"])`,
    )
    .nth(secondAddressN)
    .innerText();
  const secondAddress = expandStreetAbbreviations(secondAddressUnformat);
  console.log({ firstAddress });
  console.log({ secondAddress });
  
  // Click on the first property
  await page.locator(`.card-media-container:visible`).nth(firstAddressN).click();
  
  // Pause for the page to load
  await page.waitForTimeout(5000);
  
  // Close the overlay
  await page.getByRole(`button`, { name: `close` }).click();
  
  // Uncliam property here if needed
  try {
    await expect(
      page.locator(`button:Has-text("Claimed View")`),
    ).not.toBeVisible();
  } catch (e) {
    // Click the tridot
    await page.getByLabel(`Claimed property options menu`).click();
  
    // Click "Release Claim"
    await page.getByText(`Release Claim`).click();
  
    // Confirm release claim
    await page.getByRole(`button`, { name: `Yes, release property` }).click();
  }
  
  // Unlike property here if needed
  try {
    await expect(page.getByRole(`button`, { name: `Save` })).toHaveScreenshot(
      "heartIcon.png",
      { maxDiffPixelRatio: 0.05 },
    );
  } catch (e) {
    // Click the saved button
    await page.getByRole(`button`, { name: `Saved` }).click();
  }
  
  // Pause for the UI
  await page.waitForTimeout(5000);
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // Verify we are on the correct page
  await expect(page.getByText(firstAddress, { exact: true })).toBeVisible();
  
  // Verify a heart with a white outline will appear in front of Save button. next to the tri dot
  
  // -- Verify the save icon is visible
  await expect(page.getByRole(`button`, { name: `Save` })).toBeVisible();
  
  // -- Verify that the heart icon is white
  await expect(page.getByRole(`button`, { name: `Save` })).toHaveScreenshot(
    "heartIcon.png",
  );
  
  // -- Verify that it is next to the tri dot
  await expect(
    page.locator(
      `button:Has-text("Save"):has(svg) + div button[aria-label="Property options menu button"]`,
    ),
  ).toBeVisible();
  
  // Search button is displayed
  await expect(
    page.getByRole(`button`, { name: `arrow_back Search` }),
  ).toBeVisible();
  
  // The next button should have a right arrow
  await expect(page.getByRole(`button`, { name: `arrow_forward` })).toBeVisible();
  await expect(
    page.getByRole(`button`, { name: `arrow_forward` }),
  ).toHaveScreenshot("nextProperty.png", { maxDiffPixelRatio: 0.1 });
  
  // Clicking will take the user to the property which displayed after the one that is being viewed in the search
  await page.getByRole(`button`, { name: `arrow_forward` }).click();
  await page.waitForTimeout(5000); // Pause for the UI
  await expect(page.getByText(secondAddress, { exact: true })).toBeVisible(); // Assert that the property address is visible
  
  // The next button should have a left arrow
  await expect(
    page.getByRole(`button`, { name: `arrow_back`, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole(`button`, { name: `arrow_back`, exact: true }),
  ).toHaveScreenshot("previousProperty.png", { maxDiffPixelRatio: 0.01 });
  
  // Clicking this will take the user to the property which displayed before the one that is being viewed in the search
  await page.getByRole(`button`, { name: `arrow_back`, exact: true }).click();
  await page.waitForTimeout(5000); // Pause for the UI
  await expect(page.getByText(firstAddress, { exact: true })).toBeVisible(); // Assert that the property address is visible
  
  //--------------------------------------Step 2 ------------------------------------
  //--------------------------------------------------------------------------------
  
  // click on Tridot
  await page.getByLabel(`Property options menu button`).click();
  // Save tridot menu
  // Claim Home
  await expect(
    page
      .locator(`div`)
      .filter({ hasText: /^Claim Home$/ })
      .first(),
  ).toBeVisible();
  // Save Home
  await expect(page.getByText(`Save Home`)).toBeVisible();
  // Share home
  await expect(page.getByText(`Share Home`)).toBeVisible();
  // Report a
  await expect(
    page.locator(`div`).filter({ hasText: /^Report a Problem$/ }),
  ).toBeVisible();
  
 // Step 2. Save the property
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  
  // Close the tri dot menu
  await page.getByLabel(`Property options menu button`).click();
  
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  //--------------------------------------Step 3 ------------------------------------
  //--------------------------------------------------------------------------------
  // Click on Heart
  await page.getByRole(`button`, { name: `Save` }).click();
  
  // Hover elsewhere
  await page.getByText(`Connect with an Agent`).hover();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // property should become saved
  // The heart will turn dark and Saved will be displayed to the tridot
  await expect(page.getByRole(`button`, { name: `Saved` })).toHaveScreenshot("savedHome.png", {maxDiffPixelRatio:0.01});
  
  //--------------------------------------Step 4 ------------------------------------
  //---------------------------------------------------------------------------------
  
  // click on Tridot
  await page.getByLabel(`Property options menu button`).click();
  // Verify options displayed:
  await expect(page.locator(`div`).filter({ hasText: /^Claim Home$/ }).first()).toBeVisible();
  // Save Home
  await expect(page.getByText(`Save Home`)).toBeVisible();
  // Share home
  await expect(page.getByText(`Share Home`)).toBeVisible();
  // Report a
  await expect(page.locator(`div`).filter({ hasText: /^Report a Problem$/ })).toBeVisible();
  
  //--------------------------------------Step 5 ------------------------------------
  //---------------------------------------------------------------------------------
  
  // go to saved homes and check if the save property was added
  await page.getByRole(`button`, { name: `ACCOUNT` }).click();
  await page.getByRole(`link`, { name: `Saved Homes` }).click();
  
  let found =false
  let iteration = 0
  
  // Iterate until we see the liked home
  while(!found && iteration<10) {
    try{ 
      // Saved Property was added and display in Saved Homes page
      await expect(page.getByRole(`link`, { name: firstAddress })).toBeVisible();
      found = true
    } catch {
  
      // Hover over "Saved homes"
      await page.getByText(`Saved Homes`).nth(1).hover();
  
      // Click the chevron right arrow
      await page.locator(`button:Has-text("chevron_right"):visible`).click();
    }
    iteration++
  }
  
  
 // Step 3. Unsave the property
  //--------------------------------
  // Arrange:
  //--------------------------------
  // N/A
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  //--------------------------------------Step 6 ------------------------------------
  //---------------------------------------------------------------------------------
  
  // go back to saved property page and click heart or Saved
  await page.goBack()
  
  await page.waitForTimeout(5000)
  
  // Click the save button
  await page.getByRole(`button`, { name: `Saved` }).click();
  
  // Hover elsewhere
  await page.getByText(`Connect with an Agent`).hover();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // Property will be Unsaved white herat and Save be displayed
  
  // -- Verify that the heart icon is white
  await expect(page.getByRole(`button`, { name: `Save` })).toHaveScreenshot("heartIcon.png");
  
  // Verify the property does not appear in the "Saved Homes" Section
  await page.getByRole(`button`, { name: `ACCOUNT` }).click();
  await page.getByRole(`link`, { name: `Saved Homes` }).click();
  
  // Saved Property was removed from the Saved Homes page
  await expect(page.getByRole(`link`, { name: firstAddress })).not.toBeVisible();
  
 // Step 4. Claim the Property
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  
  // Pause for weird UI behavior
  await page.waitForTimeout(10_000) 
  
  // Go back
  await page.goBack()
  
  // Pause
  await page.waitForTimeout(5000) 
  
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  //--------------------------------------Step 7 ------------------------------------
  //---------------------------------------------------------------------------------
  
  // From Tridot click on Claim home and claim home
  
  // - Click Tridot
  await page.getByLabel(`Property options menu button`).click();
  
  // - Click Claim Home
  await page.locator(`div`).filter({ hasText: /^Claim Home$/ }).first().click();
  
  // - Click "I own this home"
  await page.locator(`div`).filter({ hasText: /^I own this home$/ }).first().click();
  
  // - Click "Add to my profile"
  await page.getByRole(`button`, { name: `Yes, add it to my profile` }).click();
  
  // - Close the modal
  await page.locator(`form`).getByRole(`button`, { name: `close`, exact: true }).click();
  
  // - Close the modal
  await page.getByRole(`button`, { name: `Close`, exact: true }).click();
  
  // verify black house is displayed with Claimed View next to the tridot
  
  // - Verify the save icon is visible
  await expect(page.getByLabel(`Property options menu button`, { exact: true })).toBeVisible();
  
  // - Verify that the house is black next to "Claimed View"
  await expect(page.getByLabel(`Property options menu button`, { exact: true })).toHaveScreenshot("claimedIcon.png", {maxDiffPixelRatio:0.01});
  
  // - Verify that it is next to the tri dot
  await expect(page.locator(`div:has(>div>button[aria-label="Property options menu button"])+ div button[aria-label="Claimed property options menu button"]`)).toBeVisible();
  
  //--------------------------------------Step 8 ------------------------------------
  //---------------------------------------------------------------------------------
  
  // click on Tridot
  await page.getByLabel(`Claimed property options menu`).click();
  // Verify options displayed:
  // Release claim
  await expect(page.locator(`div`).filter({ hasText: /^Release Claim$/ })).toBeVisible();
  // Show Public View
  await expect(page.getByText(`Show Public View`)).toBeVisible();
  // Share home
  await expect(page.getByText(`Share Home`)).toBeVisible();
  // Report a Problem
  await expect(page.locator(`div`).filter({ hasText: /^Report a Problem$/ })).toBeVisible();
  
  //--------------------------------------Step 9 ------------------------------------
  //---------------------------------------------------------------------------------
  
  // Click on Black home or
  // Claimed View
  await page.getByLabel(`Property options menu button`, { exact: true }).click();
  
  // Click elsewhere
  await page.mouse.click(0,0)
  
  // Claimed view page remain open
  await expect(page.getByLabel(`Property options menu button`, { exact: true })).toBeVisible();
  await expect(page.getByLabel(`Property options menu button`, { exact: true })).toHaveScreenshot("claimedIcon.png", {maxDiffPixelRatio:0.01});
  await expect(page.getByText(`Your Home Facts`)).toBeVisible();
  
  //--------------------------------------Step 10 ------------------------------------
  //----------------------------------------------------------------------------------
  
  // go back to Public view and click on tridot. 
  
  // - Click Tri dot
  await page.getByLabel(`Claimed property options menu`).click(); 
  
  // - Click Show Public View
  await page.getByText(`Show Public View`).click();
  
  // - Click Tri dot
  await page.getByLabel(`Claimed property options menu`).click();
  
  // - Select Show Clamed View
  await page.getByText(`Show Claimed View`).click();
  
  // Claimed view page should open
  await expect(page.getByLabel(`Property options menu button`, { exact: true })).toBeVisible();
  await expect(page.getByLabel(`Property options menu button`, { exact: true })).toHaveScreenshot("claimedIcon.png", {maxDiffPixelRatio:0.01});
  await expect(page.getByText(`Your Home Facts`)).toBeVisible();
  
  //--------------------------------------Step 11 ------------------------------------
  //----------------------------------------------------------------------------------
  
  // Go to Saved Homes and
  // Check if the Saved property appear as saved
  await page.getByRole(`button`, { name: `ACCOUNT` }).click();
  await page.getByRole(`link`, { name: `Claimed Homes` }).click();
  
  // Property should appear as saved and have a house icon on property card
  await expect(page.locator(`[data-testid="undecorate"]:has-text("${firstAddress}") span:text-is("house")`)).toBeVisible()
  await expect(page.locator(`[data-testid="undecorate"]:has-text("${firstAddress}") span:text-is("house")`)).toHaveScreenshot("claimedHomeHouseIcon.png")
  
  
 // Step 5. Release the Property
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  //--------------------------------------Step 12 ------------------------------------
  //----------------------------------------------------------------------------------
  
  // Go back to Public view page and click tridot. Select Release
  // Claim
  // Release home modal will display
  await page.goBack();
  
  // pause
  await page.waitForTimeout(5000)
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Click the tridot
  await page.getByLabel(`Claimed property options menu`).click();
  
  // Click "Release Claim"
  await page.getByText(`Release Claim`).click();
  
  // Confirm release claim
  await page.getByRole(`button`, { name: `Yes, release property` }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  //--------------------------------------Step 13 ------------------------------------
  //----------------------------------------------------------------------------------
  
  // Confirm to Release property
  
  // - Verify we see elements of the public property page
  await expect(page.getByRole(`button`, { name: `Overview` })).toBeVisible();
  await expect(page.getByRole(`button`, { name: `Property Details` })).toBeVisible();
  await expect(page.getByText(`Your Home Facts`)).not.toBeVisible();
  
  // Verify white heart is displayed and Save is displayed next to tridot
  
  // -- Verify the save icon is visible
  await expect(page.getByRole(`button`, { name: `Save` })).toBeVisible();
  
  // -- Verify that the heart icon is white
  await expect(page.getByRole(`button`, { name: `Save` })).toHaveScreenshot("heartIcon.png", {maxDiffPixelRatio:0.1});
  
  // -- Verify that it is next to the tri dot
  await expect(page.locator(`button:Has-text("Save"):has(svg) + div button[aria-label="Property options menu button"]`)).toBeVisible();
  
  //--------------------------------------Step 14 ------------------------------------
  //----------------------------------------------------------------------------------
  
  // Verify the property does not appear in the "Saved Homes" Section
  await page.getByRole(`button`, { name: `ACCOUNT` }).click();
  await page.getByRole(`link`, { name: `Saved Homes` }).click();
  
  // Saved Property was removed from the Saved Homes page
  await expect(page.getByRole(`link`, { name: firstAddress })).not.toBeVisible();
  
  //--------------------------------------Step 15 ------------------------------------
  //----------------------------------------------------------------------------------
  // Go back to public view page a click to report a problem 
  await page.goBack();
  
  // Click to close out account modal
  await page.locator(`#header-auth-container`).getByRole(`button`, { name: `close` }).click();
  
  // Click on the property options
  await page.getByLabel(`Property options menu button`).click();
  
  // Click on Report a Problem
  await page.locator(`div:text("Report a Problem")`).click(); 
  
  // Assert Report a problem modal should open 
  await expect(page.locator(`:text("Let us know if you see an issue")`)).toBeVisible();
  await expect(page.getByText(`Enter Message`)).toBeVisible();
  
});