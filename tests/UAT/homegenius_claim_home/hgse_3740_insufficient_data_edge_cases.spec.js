const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_3740_insufficient_data_edge_cases", async () => {
 // Step 1. HGSE-3740: Insufficient Data Edge Cases - Desktop
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const searchAddress = {
    searchAddress: "312 Jewell Avenue, Mc Donald, KS 67745",
    searchAddr2: "312 Jewell Ave",
    addressLineOne: "312 Jewell",
    addressLineTwo: "Mc Donald, KS 67745",
    addressAssert: "312 Jewell Ave",
    addressAssert2: "Mc Donald, KS 67745",
  };
  
  // 1
  // Go to application
  // https://www.figma.com/design/xTUVHgouXIfGOU8a7kjz0V/Choosing-Comparables?node-id=7016-45490&node-type=instance&t=WgN7l1giKMNh4VVg-0
  // App is launched
  
  const { page } = await logInHomegeniusQAUser();
  
  // Clean Up unclaim property
  await unclaimProperty(page, searchAddress)
  
  // 2
  // Perform a search for Insufficient Data properties.
  // 312 Jewell Ave Mcdonald, KS 67745
  // 601 Sherman, Atwood, KS 67730
  // 3
  // Claim home and go to Edit home facts page
  // While claiming this home make few edits to the property DNA
  // and Select 'Calculate' or directly selecting 'Next' without making any edits
  
  await claimProperty(page, searchAddress)
  
  // 4
  // Follow updated design for the edge case where there is "insufficient data" 
  // to run a mygeniusprice
  // See updated Figma designs: https://www.figma.com/design/xTUVHgouXIfGOU8a7kjz0V/Choosing-Comparables?node-id=7016-45490&t=Qe6rh4X0lPmYqoRZ-4
  // IF the backend returns either of these error types from HGSE-3118 as the 
  // sub-reason for a 404:
  // No Coverage
  // Key DNA data was not provided or found
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Click on Edit Home Facts
  await page.getByRole(`button`, { name: `edit Edit` }).click();
  
  // Click on Continue
  await page.getByRole(`button`, { name: `Continue` }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // 5
  // Check Edit home modal
  // On the edit home modal, after an attempt to run the mygeniusprice comes back 
  // with insufficient data response
  // Display a $-- for the mygeniusprice value
  // Display the triangle/exclamation point icon
  // When user hovers/taps on the triangle/exclamation point icon, display the text 
  // "There is insufficient data to determine a value estimate for this property."
  
  // Assert Insufficient Data message
  await expect(page.getByText(`Insufficient Data`)).toBeVisible();
  
  // Assert display $--
  await expect(page.locator(`form`).getByRole(`heading`, { name: `$--` })).toBeVisible();
  
  // Assert Display triangle/exclamation point icon next to Insufficient Data message
  await expect(page.locator(
    `p:text("Insufficient Data") + div span:text("warning")`
  )).toHaveScreenshot('triangleExclamation', {maxDiffPixelRatio: 0.01})
  
  // Assert Display triangle/exclamation point icon hover message
  await expect(async () => {
    await page.locator(
      `p:text("Insufficient Data") + div span:text("warning")`
    ).hover();
    await expect(page.locator(
      `div:text("There is insufficient data to determine a value estimate for this property.")`
    )).toBeVisible({timeout: 5000});
  }).toPass({timeout: 30_000})
  
  
  // 6
  // Check Edit modal summary page
  // On the edit modal summary page (last display on the edit modal 
  // where geniusprice and mygeniusprice values are summarized)
  // For each of mygeniusprice and geniusprice, where applicable, 
  // display a $-- for the value
  // Display the triangle/exclamation point icon (no tool-tip 
  // upon hover on the icon)
  // Display the summary messaging "There is insufficient data 
  // to determine a value estimate for this property." as displayed
  // in Figma
   
  // Click on Next
  await page.getByRole(`button`, { name: `Next` }).click();
  
  // Wait until loader is not visible
  await expect(page.locator(`.loader`).first()).not.toBeVisible();
  
  // Assert Insufficient Data message
  await expect(page.getByText(`Insufficient Data`)).toBeVisible();
  
  // Assert display $--
  await expect(page.locator(`.CalculateSectionContainer h6:text("$--")`)).toBeVisible();
  
  // Assert Display triangle/exclamation point icon next to Insufficient Data message
  await expect(page.locator(
    `p:text("Insufficient Data") + div span:text("warning")`
  )).toHaveScreenshot('triangleExclamation', {maxDiffPixelRatio: 0.05})
  
  // Assert Display triangle/exclamation point icon hover message
  await expect(async () => {
    await page.locator(
      `p:text("Insufficient Data") + div span:text("warning")`
    ).hover();
    await expect(page.locator(
      `div:text("There is insufficient data to determine a value estimate for this property.")`
    )).toBeVisible({timeout: 5000});
  }).toPass({timeout: 30_000})
  
  
  // 7
  // Claimed View Page
  // See Figma: https://www.figma.com/design/Ao1qRJgXYpeosu7Gjd0UXv/Claimed-Home-View?node-id=4625-45785&t=oZfGzL7vs5s2leLt-4
  // On the Claimed View Page, after an attempt to run the 
  // mygeniusprice comes back with insufficient data response
  // Display a $-- for the mygeniusprice value
  // Display the triangle/exclamation point icon
  // When user hovers/taps on the triangle/exclamation point icon, 
  // display the text "There is insufficient data to determine a 
  // value estimate for this property."
  
  // Click on Done
  await page.getByRole(`button`, { name: `Done` }).click();
  
  // Click on Continue to property view
  await page.getByRole(`button`, { name: `Continue to property view` }).click();
   
  // Assert $-- for mygeniusprice value
  await expect(page.getByRole(`heading`, { name: `$--` }).nth(1)).toBeVisible();
  
  // Assert triangle/exclamation point
  await expect(page.locator(
    `span:text("warning")`
  )).toHaveCount(2);
   
   // Assert Display triangle/exclamation point icon hover message
  await expect(async () => {
    await page.locator(
      `span:text("warning")`
    ).nth(1).hover();
    await expect(page.locator(
      `div:text("There is insufficient data to determine a value estimate for this property.")`
    )).toBeVisible({timeout: 5000});
  }).toPass({timeout: 30_000})
  
  
 // Step 2. HGSE-3740: Insufficient Data Edge Cases - Mobile
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  // 8
  // Check all the devices: Desktop, Mobile/Tablet
  // Check Insufficient Data Edge Cases on all devices
  
  // Set to Mobile View
  const mobileView = { height: 800, width: 360 }; 
  await page.setViewportSize(
    mobileView
  )
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Click on Edit Home Facts
  await page.getByRole(`button`, { name: `edit Edit` }).click();
  
  // Click on Continue
  await page.getByRole(`button`, { name: `Continue` }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // 5
  // Check Edit home modal
  // On the edit home modal, after an attempt to run the mygeniusprice comes back 
  // with insufficient data response
  // Display a $-- for the mygeniusprice value
  // Display the triangle/exclamation point icon
  // When user hovers/taps on the triangle/exclamation point icon, display the text 
  // "There is insufficient data to determine a value estimate for this property."
  
  // Assert Insufficient Data message
  await expect(page.getByText(`Insufficient Data`)).toBeVisible();
  
  // Assert display $--
  await expect(page.locator(`form`).getByRole(`heading`, { name: `$--` })).toBeVisible();
  
  // Assert Display triangle/exclamation point icon next to Insufficient Data message
  await expect(page.locator(
    `p:text("Insufficient Data") + div span:text("warning")`
  )).toHaveScreenshot('triangleExclamation', {maxDiffPixelRatio: 0.01})
  
  // Assert Display triangle/exclamation point icon hover message
  await expect(async () => {
    await page.locator(
      `p:text("Insufficient Data") + div span:text("warning")`
    ).hover();
    await expect(page.locator(
      `div:text("There is insufficient data to determine a value estimate for this property.")`
    )).toBeVisible({timeout: 5000});
  }).toPass({timeout: 30_000})
  
  
  // 6
  // Check Edit modal summary page
  // On the edit modal summary page (last display on the edit modal 
  // where geniusprice and mygeniusprice values are summarized)
  // For each of mygeniusprice and geniusprice, where applicable, 
  // display a $-- for the value
  // Display the triangle/exclamation point icon (no tool-tip 
  // upon hover on the icon)
  // Display the summary messaging "There is insufficient data 
  // to determine a value estimate for this property." as displayed
  // in Figma
   
  // Click on Next
  await page.getByRole(`button`, { name: `Next` }).click();
  
  // Wait until loader is not visible
  await expect(page.locator(`.loader`).first()).not.toBeVisible();
  
  // Assert Insufficient Data message
  await expect(page.getByText(`Insufficient Data`)).toBeVisible();
  
  // Assert display $--
  await expect(page.locator(`.claim-home-comparables-container h6:text("$--")`)).toBeVisible();
  
  // Assert Display triangle/exclamation point icon next to Insufficient Data message
  await expect(page.locator(
    `p:text("Insufficient Data") + div span:text("warning")`
  )).toHaveScreenshot('triangleExclamation', {maxDiffPixelRatio: 0.05})
  
  // Assert Display triangle/exclamation point icon hover message
  await expect(async () => {
    await page.locator(
      `p:text("Insufficient Data") + div span:text("warning")`
    ).hover();
    await expect(page.locator(
      `div:text("There is insufficient data to determine a value estimate for this property.")`
    )).toBeVisible({timeout: 5000});
  }).toPass({timeout: 30_000})
  
  
  // 7
  // Claimed View Page
  // See Figma: https://www.figma.com/design/Ao1qRJgXYpeosu7Gjd0UXv/Claimed-Home-View?node-id=4625-45785&t=oZfGzL7vs5s2leLt-4
  // On the Claimed View Page, after an attempt to run the 
  // mygeniusprice comes back with insufficient data response
  // Display a $-- for the mygeniusprice value
  // Display the triangle/exclamation point icon
  // When user hovers/taps on the triangle/exclamation point icon, 
  // display the text "There is insufficient data to determine a 
  // value estimate for this property."
  
  // Click on X to close modal
  await page.getByRole(`button`, { name: `close` }).click();
  
  // Click on Close
  await page.getByRole(`button`, { name: `Close`, exact: true }).click();
  
  // Assert $-- for mygeniusprice value
  await expect(page.getByRole(`heading`, { name: `$--` }).nth(1)).toBeVisible();
  
  // Assert triangle/exclamation point
  await expect(page.locator(
    `span:text("warning")`
  )).toHaveCount(2);
   
   // Assert Display triangle/exclamation point icon hover message
  await expect(async () => {
    await page.locator(
      `span:text("warning")`
    ).nth(1).hover();
    await expect(page.locator(
      `div:text("There is insufficient data to determine a value estimate for this property.")`
    )).toBeVisible({timeout: 5000});
  }).toPass({timeout: 30_000})
  
  
 // Step 3. HGSE-3740: Insufficient Data Edge Cases - Tablet
  //--------------------------------
  // Arrange:
  //--------------------------------
  // 8
  // Check all the devices: Desktop, Mobile/Tablet
  // Check Insufficient Data Edge Cases on all devices
  
  // Set to Tablet View
  const tabletView = { height: 1280, width: 800 };
  await page.setViewportSize(
    tabletView
  )
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Click on Edit Home Facts
  await page.getByRole(`button`, { name: `edit Edit` }).click();
  
  // Click on Continue
  await page.getByRole(`button`, { name: `Continue` }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // 5
  // Check Edit home modal
  // On the edit home modal, after an attempt to run the mygeniusprice comes back 
  // with insufficient data response
  // Display a $-- for the mygeniusprice value
  // Display the triangle/exclamation point icon
  // When user hovers/taps on the triangle/exclamation point icon, display the text 
  // "There is insufficient data to determine a value estimate for this property."
  
  // Assert Insufficient Data message
  await expect(page.getByText(`Insufficient Data`)).toBeVisible();
  
  // Assert display $--
  await expect(page.locator(`form`).getByRole(`heading`, { name: `$--` })).toBeVisible();
  
  // Assert Display triangle/exclamation point icon next to Insufficient Data message
  await expect(page.locator(
    `p:text("Insufficient Data") + div span:text("warning")`
  )).toHaveScreenshot('triangleExclamation', {maxDiffPixelRatio: 0.01})
  
  // Assert Display triangle/exclamation point icon hover message
  await expect(async () => {
    await page.locator(
      `p:text("Insufficient Data") + div span:text("warning")`
    ).hover();
    await expect(page.locator(
      `div:text("There is insufficient data to determine a value estimate for this property.")`
    )).toBeVisible({timeout: 5000});
  }).toPass({timeout: 30_000})
  
  
  // 6
  // Check Edit modal summary page
  // On the edit modal summary page (last display on the edit modal 
  // where geniusprice and mygeniusprice values are summarized)
  // For each of mygeniusprice and geniusprice, where applicable, 
  // display a $-- for the value
  // Display the triangle/exclamation point icon (no tool-tip 
  // upon hover on the icon)
  // Display the summary messaging "There is insufficient data 
  // to determine a value estimate for this property." as displayed
  // in Figma
   
  // Click on Next
  await page.getByRole(`button`, { name: `Next` }).click();
  
  // Wait until loader is not visible
  await expect(page.locator(`.loader`).first()).not.toBeVisible();
  
  // Assert Insufficient Data message
  await expect(page.getByText(`Insufficient Data`)).toBeVisible();
  
  // Assert display $--
  await expect(page.locator(`.claim-home-comparables-container h6:text("$--")`)).toBeVisible();
  
  // Assert Display triangle/exclamation point icon next to Insufficient Data message
  await expect(page.locator(
    `p:text("Insufficient Data") + div span:text("warning")`
  )).toHaveScreenshot('triangleExclamation', {maxDiffPixelRatio: 0.05})
  
  // Assert Display triangle/exclamation point icon hover message
  await expect(async () => {
    await page.locator(
      `p:text("Insufficient Data") + div span:text("warning")`
    ).hover();
    await expect(page.locator(
      `div:text("There is insufficient data to determine a value estimate for this property.")`
    )).toBeVisible({timeout: 5000});
  }).toPass({timeout: 30_000})
  
  
  // 7
  // Claimed View Page
  // See Figma: https://www.figma.com/design/Ao1qRJgXYpeosu7Gjd0UXv/Claimed-Home-View?node-id=4625-45785&t=oZfGzL7vs5s2leLt-4
  // On the Claimed View Page, after an attempt to run the 
  // mygeniusprice comes back with insufficient data response
  // Display a $-- for the mygeniusprice value
  // Display the triangle/exclamation point icon
  // When user hovers/taps on the triangle/exclamation point icon, 
  // display the text "There is insufficient data to determine a 
  // value estimate for this property."
  
  // Click on X to close modal
  await page.getByRole(`button`, { name: `close` }).click();
  
  // Click on Close
  await page.getByRole(`button`, { name: `Close`, exact: true }).click();
  
  // Assert $-- for mygeniusprice value
  await expect(page.getByRole(`heading`, { name: `$--` }).nth(1)).toBeVisible();
  
  // Assert triangle/exclamation point
  await expect(page.locator(
    `span:text("warning")`
  )).toHaveCount(2);
   
   // Assert Display triangle/exclamation point icon hover message
  await expect(async () => {
    await page.locator(
      `span:text("warning")`
    ).nth(1).hover();
    await expect(page.locator(
      `div:text("There is insufficient data to determine a value estimate for this property.")`
    )).toBeVisible({timeout: 5000});
  }).toPass({timeout: 30_000})
  
  // Clean up
  // Change back to normal window view
  await page.setViewportSize(
    {width: 1280, height: 800}
  )
  
  // Clean Up unclaim property
  await unclaimProperty(page, searchAddress)
  
  
});