import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_885_edit_data_cancellation_modal", async () => {
 // Step 1. HGSE-885 Edit Data Cancellation Modal
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const searchAddress = {
    searchAddress: "421 Westview Drive, KY 42134",
    addressLineOne: "421 Westview Dr",
    addressLineTwo : "Franklin, KY 42134",
    city: "Franklin",
    state:"KY",
    zip:"42134"
  }
  
  // Log in user
  const {page, context} = await logInHomegeniusUser();
  
  // Clean up if needed
  await unclaimProperty(page, searchAddress);
  
  // Claim property
  await claimProperty(page, searchAddress);
  //--------------------------------------Step 1------------------------------------
  //--------------------------------------------------------------------------------
  // Claim a home and on claimed view go to 'Edit' icon on Your Home Facts Section
  await page.reload()
  await page.locator(`p:text("Your Home Facts") + button:has-text("Edit")`).click();
  
  // 'Edit Home Facts or Images' Modal should be popped up and then click on "Continue" button.
  await page.locator(`button:text("Continue")`).click();
  
  //--------------------------------
  // Act & Assert:
  //--------------------------------
  
  //--------------------------------------Step 2------------------------------------
  //--------------------------------------------------------------------------------
  //close pop up on the bottom left of the screen
  await page.locator(`[id="__next"]`).getByRole(`button`, { name: `close` }).click();
  // On 'Edit Home Facts (optional)' modal click on (X) icon
  await page.locator(`span:text("close"):visible`).click();
  
  // Error pop up will open. 
  // "The error message page will appear:
  // The header will have the title of "Confirm Exit" on the left and an 
  await expect(page.locator(`p:text("Confirm Exit")`)).toBeVisible();
  
  // ""X"" to close out the modal on the right
  await expect(page.locator(`div:has(p:text("Confirm Exit")) + button:has-text("close")`)).toBeVisible();
  
  // There will be a gray line to separate the header and message body
  await expect(page.locator(`[height="18.75em"]:visible`)).toHaveCSS(
    'border-color', 'rgb(184, 184, 184) rgba(0, 0, 0, 0)'
  )
  // The message body will contain the following message:1st sentence: 
  // This property has been successfully claimed.
  // 2nd sentence (next line): Now that it is claimed, you can come back and make edits later.There will be a gray line to separate the message body and footer
  await expect(page.locator(
    `p:text("This property has been successfully claimed.") + p:text("Now that it is claimed, you can come back and make edits later.")`
  )).toBeVisible();
  
  // Continue Ediiting and Close buttons"
  await expect(page.locator(
    `button:text("Continue Editing") + button:text("Close")`
  )).toBeVisible();
  
  //--------------------------------------Step 3------------------------------------
  //--------------------------------------------------------------------------------
  // Click Continue editing
  await page.locator(
    `button:text("Continue Editing")`
  ).click();
  
  // Error pop up will close Edit Home Facts modal will open
  await expect(page.locator(`p:text("Confirm Exit")`)).not.toBeVisible();
  
  //--------------------------------------Step 4------------------------------------
  //--------------------------------------------------------------------------------
  // Verify property has all required fields filled with valid data.
  await expect(page.locator(`label:text("Property Type") + div input`)).not.toHaveValue("")
  
  await expect(page.locator(`label:text("Bedroom") + div input`)).not.toHaveValue("")
  
  await expect(page.locator(`[for="yearBuilt"] + input`)).not.toHaveValue("")
  
  await expect(page.locator(`[for="sqft"] + input`)).not.toHaveValue("")
  
  await expect(page.locator(`label:text("Garage") + div input`)).not.toHaveValue("")
  
  await expect(page.locator(`[for="lotSizeInAcres"] + input`)).not.toHaveValue("")
  
  await expect(page.locator(`label:text("Full Bath") + div input`)).not.toHaveValue("")
  
  await expect(page.locator(`label:text("3/4 Bath") + div input`)).not.toHaveValue("")
  
  await expect(page.locator(`label:text("1/2 Bath") + div input`)).not.toHaveValue("")
  
  await expect(page.locator(`label:text("1/4 Bath") + div input`)).not.toHaveValue("")
  
  // click next and click back
  await page.locator(`button:text("Next")`).click();
  
  // User will navigate to comparable section and back to edit details modal
  await expect(page.locator(`p:text("Select Comparable Homes (Optional)")`)).toBeVisible({timeout: 60_000});
  
  // click on Back
  await page.locator(`button:text("Back")`).click();
  await expect(page.locator(`p:text("Edit Home Facts (optional)")`)).toBeVisible();
  
  //--------------------------------------Step 5------------------------------------
  //--------------------------------------------------------------------------------
  // Make edits and click Skip and Close
  await page.locator(`#halfBath button:nth-of-type(2)`).click();
  await page.locator(`button:text("Skip and Close")`).click();
  
  // Error pop up message will be displayed
  // The header will have the title of "Confirm Exit" on the left and an 
  await expect(page.locator(`p:text("Confirm Exit")`)).toBeVisible();
  
  // ""X"" to close out the modal on the right
  await expect(page.locator(`div:has(p:text("Confirm Exit")) + button:has-text("close")`)).toBeVisible();
  
  // There will be a gray line to separate the header and message body
  await expect(page.locator(`[height="18.75em"]:visible`)).toHaveCSS(
    'border-color', 'rgb(184, 184, 184) rgba(0, 0, 0, 0)'
  )
  // The message body will contain the following message:1st sentence: 
  // This property has been successfully claimed.
  // 2nd sentence (next line): Now that it is claimed, you can come back and make edits later.There will be a gray line to separate the message body and footer
  await expect(page.locator(
    `p:text("This property has been successfully claimed.") + p:text("Now that it is claimed, you can come back and make edits later.")`
  )).toBeVisible();
  
  // Continue Ediiting and Close buttons"
  await expect(page.locator(
    `button:text("Continue Editing") + button:text("Close")`
  )).toBeVisible();
  
  //--------------------------------------Step 6------------------------------------
  //--------------------------------------------------------------------------------
  // Click close
  await page.locator(
    `button:text("Close")`
  ).click();
  
  // Modal will close. property details page will display
  await expect(page.locator(`p:text("Confirm Exit")`)).not.toBeVisible();
  await expect(page.locator(`span:text("Claimed View")`)).toBeVisible();
  await expect(page.locator(`div:text-is("421 Westview Drive")`)).toBeVisible();
  
  
  
});