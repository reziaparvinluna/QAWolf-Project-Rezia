const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_455_consumer_account_edit_saved_search", async () => {
 // Step 1. HGSE-455 - Consumer Account- Edit Saved Search
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Login to Homeogenius UAT-Portal
  const { page, context } = await logInHomegeniusUser();
  
  // Click account
  await page.locator(`#login-btn`).click();
  
  // Go to save searches
  await page.locator(`[href$="consumer-account/saved-searches"]`).click();
  
  // assert on the page
  await expect(page.locator(`h1:has-text("saved searches")`)).toBeVisible();
  
  try {
    // cleanup
    await page.waitForTimeout(5000);
    await page.locator(`button:has-text("edit")`).first().click();
    await page
      .locator(`label:has-text("Saved Search Name")+input`)
      .fill("Test List 4");
    await page.waitForTimeout(3000);
    await page.locator(`button:has-text("update")`).click();
    // Assert success prompt
    await expect(
      page.locator(
        `[type="SUCCESS"] :text("Successfully updated saved search Test List 4")`,
      ),
    ).toBeVisible();
    await expect(
      page.locator(
        `[type="SUCCESS"] :text("Successfully updated saved search Test List 4")`,
      ),
    ).not.toBeVisible();
  } catch {
    console.error();
  }
  
  //--------------------------------
  // Act: update button works
  //--------------------------------
  // Get list name and edit
  // await page.waitForLoadState();
  await page.waitForTimeout(10000);
  let list1 = await page
    .locator(`div:has(h3:has-text("Manage saved searches"))+div div >>nth=0`)
    .innerText();
  let listName = list1.split("\n")[0];
  await page.locator(`button:has-text("edit")`).first().click();
  console.log(listName);
  
  // Assert right name and update name
  // await page.waitForLoadState();
  await page.waitForTimeout(6000);
  await expect(
    page.getByRole("textbox").first(),
  ).toHaveValue(listName);
  let editedListName = `${listName} edited`;
  await page
    .locator(`label:has-text("Saved Search Name")+input`)
    .fill(editedListName);
  await page.locator(`button:has-text("update")`).click();
  
  //--------------------------------
  // Assert: update button works
  //--------------------------------
  // Assert success prompt
  await expect(page.locator(`#toast-container[role="alert"]`)).toContainText(`Successfully updated saved search ${editedListName}`)
  
  await expect(page.locator(`#toast-container[role="alert"]`)).not.toBeVisible()
  
  
  // Assert name is correct
  list1 = await page
    .locator(`div:has(h3:has-text("manage saved searches"))+div div >>nth=0`)
    .innerText();
  let onpageListName = list1.split("\n")[0];
  expect(onpageListName).toEqual(editedListName);
  
  //--------------------------------
  // Act: cancel button works
  //--------------------------------
  // Get list name and edit
  list1 = await page
    .locator(`div:has(h3:has-text("manage saved searches"))+div div >>nth=0`)
    .innerText();
  listName = list1.split("\n")[0];
  await page.locator(`button:has-text("edit")`).first().click();
  console.log(listName);
  
  // Assert right name and update name
  await expect(
    page.locator(`label:has-text("Saved Search Name")+input`),
  ).toHaveValue(listName);
  let cancelledListName = `${listName} cancelled`;
  await page
    .locator(`label:has-text("Saved Search Name")+input`)
    .fill(cancelledListName);
  await page.locator(`button:has-text("cancel"):visible`).click();
  
  //--------------------------------
  // Assert: cancel button works
  //--------------------------------
  // Assert no success prompt
  await expect(page.locator(`#toast-container`)).not.toBeVisible();
  
  // Assert name is unchanged
  list1 = await page
    .locator(`div:has(h3:has-text("manage saved searches"))+div div >>nth=0`)
    .innerText();
  onpageListName = list1.split("\n")[0];
  expect(onpageListName).toEqual(editedListName);
  expect(onpageListName).not.toEqual(cancelledListName);
  
  //--------------------------------
  // Act: exit modal x button works
  //--------------------------------
  // Get list name and edit
  list1 = await page
    .locator(`div:has(h3:has-text("manage saved searches"))+div div >>nth=0`)
    .innerText();
  listName = list1.split("\n")[0];
  await page.locator(`button:has-text("edit")`).first().click();
  console.log(listName);
  
  // Assert right name and update name
  await expect(
    page.locator(`label:has-text("Saved Search Name")+input`),
  ).toHaveValue(listName);
  let crossedListName = `${listName} crossed`;
  await page
    .locator(`label:has-text("Saved Search Name")+input`)
    .fill(crossedListName);
  await page.locator(`button:has-text("close"):visible`).click();
  
  //--------------------------------
  // Assert: exit modal x button works
  //--------------------------------
  // Assert no success prompt
  await expect(page.locator(`#toast-container`)).not.toBeVisible();
  
  // Assert input unchanged
  await page.locator(`button:has-text("edit")`).first().click();
  await expect(
    page.locator(`label:has-text("Saved Search Name")+input`),
  ).not.toHaveValue(crossedListName);
  
  // cleanup
  try {
    // await page.locator(`button:has-text("edit")`).first().click();
    await page
      .locator(`label:has-text("Saved Search Name")+input`)
      .fill("Test List 4");
    await page.locator(`button:has-text("update")`).click();
    // Assert success prompt
    await expect(
      page.locator(
        `#toast-container :text("Successfully updated saved search Test List 4")`,
      ),
    ).toBeVisible();
    await expect(
      page.locator(
        `#toast-container :text("Successfully updated saved search Test List 4")`,
      ),
    ).not.toBeVisible();
  } catch (error) {
    console.log(error);
  }
  
});