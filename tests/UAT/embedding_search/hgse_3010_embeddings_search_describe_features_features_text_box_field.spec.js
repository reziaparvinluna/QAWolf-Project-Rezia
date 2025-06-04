const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_3010_embeddings_search_describe_features_features_text_box_field", async () => {
 // Step 1. HGSE-3010 [Embeddings Search] Describe Features - Features Text Box Field
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Login
  const {page,context} = await logInHomegeniusUser()
  
  /** Click the 'Find a Home' link in the navigation menu */
  await page.getByRole("link", { name: "Find a Home", exact: true }).click();
  await page.waitForTimeout(5000);
  
  // Fill in two letters
  await page
    .getByPlaceholder("Address, city, neighborhood,")
    .first()
    .fill('Ne');
  
  // Click on New York
  await page.getByRole(`button`, { name: `New York` }).click({ delay: 100 });
  
  // Click on Search
  await page.getByRole(`button`, { name: `Search` }).first().click({delay: 5000});
  
  //--------------------------------
  // Act:
  //--------------------------------
  // When user select SEARCH WITH AI and in the Describe Features tab
  // Click on Search with AI
  await page.getByRole(`button`, { name: `SEARCH WITH AI` }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // 1. The Features text box will be enabled. If Room Type is not entered, then the field will remain disabled.
  // Assert text area is disabled
  await expect(page.locator(
    `label:text("My ideal room includes") + textarea:visible`
  )).toBeDisabled();
  
  // Assert Apply Button is disabled
  await expect(page.locator(`
    button:text("Apply"):visible
  `)).toBeDisabled();
  
  // Fill in a Room Type
  await page.getByRole(`combobox`, { name: `Room Type` }).fill(`Kitchen`);
  await page.keyboard.press("Tab");
  
  // Assert text area is enabled
  await expect(page.locator(
    `label:text("My ideal Kitchen includes") + textarea:visible`
  )).toBeEnabled();
  
  // 2. Pre-populated text: "My ideal [Room Type] includes ex. green cabinets, white counter"
  // 3. Room Type is dynamic and will be replaced with the user entry for Room Type
  await expect(page.locator(
    `label:text("My ideal Kitchen includes") + [placeholder="e.g., white cabinets, wood floors and brass hardware"]:visible`
  )).toBeVisible();
  
  // 4. Once user engages the Features text box, the cursor will begin after "My ideal [Room Type] includes" and the "ex. green cabinets, white counter" pre-populated text will disappear.
  
  // Fill in Stainless
  await page.locator(
    `label:text("My ideal Kitchen includes") + [placeholder="e.g., white cabinets, wood floors and brass hardware"]:visible`
  ).fill('Stainless');
  
  // Assert placeholder text is now gone
  await expect(page.locator(
    `label:text("My ideal Kitchen includes") + [placeholder="e.g., white cabinets, wood floors and brass hardware"]:visible`
  )).toHaveValue('Stainless')
  
  // 5 "My ideal [Room Type] includes" will not be editable.
  await expect(page.locator(
    `label:text("My ideal Kitchen includes"):visible`
  )).toBeVisible();
  
  // 1. Field type should be memo/paragraph and allow alphanumeric characters.
  // 2. Field will have a 1000 character limit with a counter that indicates how many character have been used.  When the limit is reached, the user will not be able to enter anymore characters.
  // 3. Field will have a selected state when the user is inside the field. (Blue border), clicking anywhere outside the field will remove the blue border.
  const memo = faker.random.words(10) + faker.random.alphaNumeric(5);
  const memo2 = faker.random.alphaNumeric(5) + faker.random.words(200);
  
  // Fill in memo
  await page.locator(
    `label:text("My ideal Kitchen includes") + [placeholder="e.g., white cabinets, wood floors and brass hardware"]:visible`
  ).fill(memo);
  
  // Assert memo is display
  await expect(page.locator(
    `label:text("My ideal Kitchen includes") + [placeholder="e.g., white cabinets, wood floors and brass hardware"]:visible`
  )).toHaveValue(memo)
  
  // Assert charater limit updated
  await expect(page.locator(
    `div:text("${memo.length}/1000"):visible`
  )).toBeVisible();
  
  // Fill in memo2
  await page.locator(
    `label:text("My ideal Kitchen includes") + [placeholder="e.g., white cabinets, wood floors and brass hardware"]:visible`
  ).fill(memo2);
  
  // Assert memo2 is display
  await expect(page.locator(
    `label:text("My ideal Kitchen includes") + [placeholder="e.g., white cabinets, wood floors and brass hardware"]:visible`
  )).toHaveValue(memo2.slice(0, 1000));
  
  // Assert charater limit updated to 1000 max
  await expect(page.locator(
    `div:text("1000/1000"):visible`
  )).toBeVisible();
  
  // Assert blue border around textbox
  await expect(page.locator(
    `[class="css-ncwo9r"]:visible`
  )).toHaveCSS('border-color', 'rgb(31, 31, 255)');
  
  // 1. Once user starts typing in the Features text box, then Apply button will become enabled, otherwise it will remain disabled.
  // 2. Selecting Start Over will clear Features field for all rooms
  // 3. Selecting Delete Room will clear Features field for that respective room
  // 4. If Features field has user entry and then Room Type is cleared, then Features field will also be cleared
  
  // Assert Apply Button is now enabled
  await expect(page.locator(`
    button:text("Apply"):visible
  `)).toBeEnabled();
  
  // Click on Room Type 2
  await page.getByRole(`button`, { name: `Room Type 2` }).click();
  
  // Fill in a Room Type
  await page.getByRole(`combobox`, { name: `Room Type` }).fill(`Bedroom`);
  await page.keyboard.press("Tab");
  
  // Fill in memo2
  await page.locator(
    `label:text("My ideal Bedroom includes") + [placeholder="e.g., white cabinets, wood floors and brass hardware"]:visible`
  ).fill(memo2);
  
  // Click on Start Over
  await page.getByRole(`button`, { name: `Start Over` }).click();
  
  // Click on Confirm
  await page.getByRole(`button`, { name: `Confirm` }).click();
  
  // Assert the Kitchen and Bedroom are both removed
  await expect(page.locator(
    `label:text("My ideal Kitchen includes") + [placeholder="e.g., white cabinets, wood floors and brass hardware"]`
  )).not.toBeVisible()
  await expect(page.locator(
    `label:text("My ideal Bedroom includes") + [placeholder="e.g., white cabinets, wood floors and brass hardware"]`
  )).not.toBeVisible()
  
  // Refill Kitchen and Bedroom to test Delete Room Button
  // Fill in a Room Type
  await page.locator(`[placeholder="Enter Room Type"]:visible`).click({delay: 5000});
  await page.locator(`[placeholder="Enter Room Type"]:visible`).fill(`Kitchen`);
  await page.keyboard.press("Tab");
  
  // Fill in memo2
  await page.locator(
    `label:text("My ideal Kitchen includes") + [placeholder="e.g., white cabinets, wood floors and brass hardware"]:visible`
  ).fill(memo2);
  
  // Click on Room Type 2
  await page.getByRole(`button`, { name: `Room Type 2` }).click({delay: 3000});
  
  // Fill in a Room Type
  await page.getByRole(`combobox`, { name: `Room Type` }).fill(`Bedroom`, {delay: 3000});
  await page.keyboard.press("Tab");
  
  // Fill in memo2
  await page.locator(
    `label:text("My ideal Bedroom includes") + [placeholder="e.g., white cabinets, wood floors and brass hardware"]:visible`
  ).fill(memo2);
  
  // Click on Delete Room
  await page.getByRole(`button`, { name: `Delete Room` }).click({delay: 5000});
  
  // Click on Confirm
  await page.getByRole(`button`, { name: `Confirm` }).click();
  
  // Assert Bedroom id now removed
  await expect(page.locator(
    `label:text("My ideal Bedroom includes") + [placeholder="e.g., white cabinets, wood floors and brass hardware"]`
  )).not.toBeVisible()
  
  // Click on Kitchen
  await page.getByRole(`button`, { name: `Kitchen` }).click();
  
  // Assert Kitchen is still available
  await expect(page.locator(
    `label:text("My ideal Kitchen includes") + [placeholder="e.g., white cabinets, wood floors and brass hardware"]:visible`
  )).toBeVisible()
 // Step 2. Error State
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  
  
  //--------------------------------
  // Act & Assert:
  //--------------------------------
  // Error state, If user do the following ( Create a step for each of these)
  // 1) Enters data into the Features field and then clears it and clicks away,
  // 1. The pre-populated text will re-appear "x. green cabinets, white counter"
  
  // Clean the memo
  await page.locator(
    `label:text("My ideal Kitchen includes") + [placeholder="e.g., white cabinets, wood floors and brass hardware"]:visible`
  ).fill("");
  
  // Assert Placeholder message
  await expect(page.locator(
    `label:text("My ideal Kitchen includes") + [placeholder="e.g., white cabinets, wood floors and brass hardware"]:visible`
  )).toBeVisible();
  
  // (2) Tries to select another Room selection across the top without enter Features field,
  // 2. A red border will appear on the field
  
  // Click on Room Type 2 tab
  await page.getByRole(`button`, { name: `Room Type 2` }).click({delay: 3000});
  
  // Assert red border
  await expect(page.locator(
    `[class="css-10v4mg"]:visible`
  )).toHaveCSS('border', '1px solid rgb(223, 38, 33)');
  
  // Assert error message
  await expect(page.locator(
    `div:text("Please describe room features in order to proceed."):visible`
  )).toBeVisible();
  
  // (3) Tries to select Search with My Photos tab
  // 3. A message will appear in red: "Please fill out features in order to proceed."
  
  // Click on the textbox to clear Errors
  await page.locator(
    `label:text("My ideal Kitchen includes") + [placeholder="e.g., white cabinets, wood floors and brass hardware"]:visible`
  ).fill("Test");
  
  // Clean the memo
  await page.locator(
    `label:text("My ideal Kitchen includes") + [placeholder="e.g., white cabinets, wood floors and brass hardware"]:visible`
  ).fill("");
  
  // Click on Search with Photo tab
  await page.getByText(`Search with My Photos`).click();
  
  // Assert red border
  await expect(page.locator(
    `[class="css-10v4mg"]:visible`
  )).toHaveCSS('border', '1px solid rgb(223, 38, 33)');
  
  // Assert error message
  await expect(page.locator(
    `div:text("Please describe room features in order to proceed."):visible`
  )).toBeVisible();
  
  // 4. Apply button will be disabled
  // Assert Apply Button is disabled
  await expect(page.locator(`
    button:text("Apply"):visible
  `)).toBeDisabled();
  
});