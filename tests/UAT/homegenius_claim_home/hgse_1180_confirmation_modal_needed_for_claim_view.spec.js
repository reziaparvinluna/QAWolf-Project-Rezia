const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_1180_confirmation_modal_needed_for_claim_view", async () => {
 // Step 1. HGSE-1180 - Confirmation Modal Needed for Claim View
  //--------------------------------
  // Arrange:
  //--------------------------------
  const searchAddress = {
    searchAddress: "5036 Allison Ave, Des Moines, IA 50310",
    addressLineOne: "5036 Allison Ave",
    addressLineTwo: "Des Moines, IA 50310"
  }
  
  // Log in with default user
  const {page, context} = await logInHomegeniusUser();
  
  // Clean up - unclaim a property
  try {
    await unclaimProperty(page, searchAddress);
  } catch (err) {
    console.log(err)
  }
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Claim a property
  await claimProperty(page, searchAddress);
  
  // Click on Upload Photo
  await page.locator(`[id="CLAIMED_VIEW_HG_IQ"] button:text("Upload")`).click();
  
  // Click to browse and upload a picture
  const fileName = "bedroom.jpg"
  await dragAndDropFile(
    page, 
    `a:text("Click to browse")`, 
    `/home/wolf/team-storage/${fileName}`
  );
  
  // Click on Next 
  await page.locator(`button:text("Next")`).click();
  
  // Select 5 comparable houses
  for (let i = 0; i < 5; i++){
    await page.locator(`button:has-text("Select home") >> nth=${i}`).click({delay: 500})
  }
  
  // Click on Done
  await page.locator(`button:text("Done")`).click();
  
  // Click "Continue to property view" 
  await page.getByRole(`button`, { name: `Continue to property view` }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert Claimed View displaying
  // Assert page url
  expect(page.url()).toContain(`/property-details`);
  
  // Assert Claimed View is showing
  await expect(page.locator(`[aria-label="Property options menu button"]:has-text("Claimed View")`)).toBeVisible();
  
  // Assert header is showing with address
  await expect(page.locator(`div:text("${searchAddress.addressLineOne}")`)).toBeVisible();
  await expect(page.locator(`div:has-text("${searchAddress.addressLineOne}") + p:text("${searchAddress.addressLineTwo}")`).first()).toBeVisible();
  
  // Assert Home Facts Section
  await expect(page.locator(`[id="home-facts-widget"]:has-text("Your Home Facts")`)).toBeVisible();
  
  // Assert Add Photos Section
  await expect(page.getByText(`Photos with homegeniusIQ®`)).toBeVisible();
  
  // Assert Select Comparable Homes Section
  await expect(page.locator(`[id="CLAIMED_VIEW_COMPARABLES"]:has-text("Your Selected Comparables")`)).toBeVisible();
  
  // Assert Property History Section
  await expect(page.locator(`[id="CLAIMED_VIEW_HISTORY"]:has-text("Property History")`)).toBeVisible();
  
  // Click on Edit button on Home Facts
  await page.locator(`[id="home-facts-widget"]:has-text("Your Home Facts") button:has-text("Edit")`).click();
  
  // Assert modal appeared with background opaque
  await expect(
    page.locator(`[height="auto"]:has-text("Edit Home Facts or Images") ~ button`)
  ).toHaveCSS('background-color', 'rgb(0, 0, 0)');
  
  // Assert Header should have Edit Home Facts or Images
  await expect(page.locator(`div:text("Edit Home Facts or Images")`)).toBeVisible();
  
  // Assert X Button
  await expect(page.locator(`div:text("Edit Home Facts or Images") button:has-text("close")`)).toBeVisible();
  
  // Assert Edit Home Facts modal
  await assertEditHomeFactsModal(page);
  
  // Click on X button
  await page.locator(`div:text("Edit Home Facts or Images") button:has-text("close")`).click();
  
  // Assert Claim Home view page and Modal closed
  await expect(page.locator(`div:text("Edit Home Facts or Images")`)).not.toBeVisible();
  
  // Click on the Edit button of Home Facts again and Click Cancel
  await page.locator(`[id="home-facts-widget"]:has-text("Your Home Facts") button:has-text("Edit")`).click();
  await page.locator(`div:text("Edit Home Facts or Images") ~ div button:has-text("Cancel")`).click();
  
  // Assert Claim Home view page and Modal closed
  await expect(page.locator(`div:text("Edit Home Facts or Images")`)).not.toBeVisible();
  
  // Click on the edit button on homegeniusIQ section
  await page.locator(`#CLAIMED_VIEW_HG_IQ`).getByRole(`button`, { name: `edit Edit` }).click();
  
  // Assert Edit Home Facts modal
  await assertEditHomeFactsModal(page);
  
  // Click on X button
  await page.locator(`div:text("Edit Home Facts or Images") button:has-text("close")`).click();
  
  // Assert Claim Home view page and Modal closed
  await expect(page.locator(`div:text("Edit Home Facts or Images")`)).not.toBeVisible();
  
  // Click on the edit button on homegeniusIQ section again and Click Cancel
  await page.locator(`#CLAIMED_VIEW_HG_IQ`).getByRole(`button`, { name: `edit Edit` }).click();
  await page.locator(`div:text("Edit Home Facts or Images") ~ div button:has-text("Cancel")`).click();
  
  // Assert Claim Home view page and Modal closed
  await expect(page.locator(`div:text("Edit Home Facts or Images")`)).not.toBeVisible();
  
  // Click on Select New Comparables button on Comparables Section
  await page.locator(`[id="CLAIMED_VIEW_COMPARABLES"]:has-text("Your Selected Comparables") button:has-text("Select New Comparables")`).click();
  
  // Assert Confirm Select New Comparable modal
  await assertConfirmSelectModal(page);
  
  // Click on X button
  await page.locator(`div:text("Confirm Select New Comparables") button:has-text("close")`).click();
  
  // Assert Claim Home view page and Modal closed
  await expect(page.locator(`div:text("Confirm Select New Comparables")`)).not.toBeVisible();
  
  // Click on Select New Comparables button of Comparables Section again and Click Cancel
  await page.locator(`[id="CLAIMED_VIEW_COMPARABLES"]:has-text("Your Selected Comparables") button:has-text("Select New Comparables")`).click();
  await page.locator(`div:text("Confirm Select New Comparables") ~ div button:has-text("Cancel")`).click();
  
  // Assert Claim Home view page and Modal closed
  await expect(page.locator(`div:text("Confirm Select New Comparables")`)).not.toBeVisible();
  
  // Click on Remove button on comparable section
  await page.locator(`[id="CLAIMED_VIEW_COMPARABLES"]:has-text("Your Selected Comparables") button:has-text("Remove")`).click();
  
  // Assert modal should appear in the middle of the screen with an opaque background
  await assertConfirmRemoveModal(page);
  
  // Click on X button
  await page.locator(`div:text("Confirm Remove Comparables") button:has-text("close")`).click();
  
  // Assert Claim Home view page and Modal closed
  await expect(page.locator(`div:text("Confirm Remove Comparables")`)).not.toBeVisible();
  
  // Click on Remove button of comparable section again and Click cancel
  await page.locator(`[id="CLAIMED_VIEW_COMPARABLES"]:has-text("Your Selected Comparables") button:has-text("Remove")`).click();
  await page.locator(`div:text("Confirm Remove Comparables") ~ div button:has-text("Cancel")`).click();
  
  // Assert Claim Home view page and Modal closed
  await expect(page.locator(`div:text("Confirm Remove Comparables")`)).not.toBeVisible();
  
  
  
  
});