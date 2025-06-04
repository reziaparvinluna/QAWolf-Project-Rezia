const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_1559_results_redesign_my_uploads_reset_remove_my_upload", async () => {
 // Step 1. HGSE-1559: Results Redesign-upload, My Uploads, Reset
  //--------------------------------
  // Arrange:
  //--------------------------------
  const mlsNumber = "879876"
  const { readFile } = await import("node:fs/promises");
  
  // Login to Homeogenius UAT-Portal
  const {page,context} = await logInHomegeniusUser()
  
  // Take current url
  const url = page.url()
  console.log(url)
  
  // Go to home search and wait for load
  await page.goto(`${url}home-search`);
  await page.waitForSelector(`:text("Total Listings")`)
  
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Filter by image and uploads image
  await page.locator(`button:has-text("SEARCH WITH AI")`).click()
  
  // Click on Search with My Photos
  await page.getByText(`Search with My Photos`).click();
  
  const elementSelector = `:text("Choose a file")`;
  const filePaths = [`/home/wolf/team-storage/room1.jpg`,`/home/wolf/team-storage/room2.jpg`,`/home/wolf/team-storage/room3.jpg`]
  
  await uploadMultipleImages(page, elementSelector, filePaths)
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert prompt and button
  await expect(page.getByText(`Your images have been successfully uploaded!`)).toBeVisible();
  await expect(page.getByRole(`button`, { name: `Apply` })).toBeVisible();
  
  // Assert multiple purpose room
  await expect(page.getByRole(`button`, { name: `Multi-Purpose Room` })).toBeVisible();
  await page.getByRole(`button`, { name: `Multi-Purpose Room` }).click();
  await expect(page.locator(`:text("1/2")`)).toBeVisible();
  await expect(page.locator(`:text("hgIQ Filters Identified: 4")`)).toBeVisible();
  await expect(page.locator(`div:text("Room Condition:")`)).toBeVisible();
  
  // go to next page
  await page.locator(`div button + button span span:text("chevron_right")`).click();
  await expect(page.locator(`:text("2/2")`)).toBeVisible();
  
  // Assert multiple bedroom
  await expect(page.getByRole(`button`, { name: `Bedroom` })).toBeVisible();
  await page.getByRole(`button`, { name: `Bedroom` }).click();
  
  // Assert correct info
  await expect(page.locator(`:text("hgIQ Filters Identified: 3")`)).toBeVisible();
  await expect(page.locator(`div:text("Room Condition:")`)).toBeVisible();
  
  // Assert checkable, when unchecked go to bottom, alphabetically order
  await expect(page.locator(`label:has-text("Flooring: Wood")`)).toBeVisible();
  await expect(page.locator(`label:has-text("Hanging Lights: Yes"):below(label:has-text("Flooring: Wood"))`)).toBeVisible();
  await expect(page.locator(`label:has-text("Room Condition: Good"):below(label:has-text("Hanging Lights: Yes"))`)).toBeVisible();
  // click middle one
  await page.locator(`label:has-text("Hanging Lights: Yes"):below(label:has-text("Flooring: Wood"))`).click();
  // order changed
  await expect(page.locator(`label:has-text("Flooring: Wood")`)).toBeVisible();
  await expect(page.locator(`label:has-text("Room Condition: Good"):below(label:has-text("Flooring: Wood"))`)).toBeVisible();
  await expect(page.locator(`label:has-text("Hanging Lights: Yes"):below(label:has-text("Room Condition: Good"))`)).toBeVisible();
  
 // Step 2. HGSE-1559: Results Redesign-Remove my Upload
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Click
  await page.locator(`button:has-text("Apply")`).last().click();
  
  // Prompt
  await expect(page.locator(`:text("Running Search with AI")`)).toBeVisible();
  await expect(page.locator(`:text("Running Search with AI")`)).not.toBeVisible();
  
  // Zoom out 4 times to ensure there are enough results (random number)
  for (let i = 0; i < 4; i++) {
    await page.getByLabel(`Zoom out`).click();
  }
  
  // Prompt again after zooming out
  await expect(page.locator(`:text("Running Search with AI")`)).toBeVisible();
  await expect(page.locator(`:text("Running Search with AI")`)).not.toBeVisible({timeout: 2 * 60_000});
  
  // Assert first 20 listing are 100% match the hgiq 
  for(let i=0; i < 20 ;i++) {
    const picCard = page.locator(`[data-testid="undecorate"]:has-text("MLS") .card-media-container >> nth=${i}`)
    await expect(picCard.locator(`:text("% match")`)).toBeVisible()
  }
  
  // Open filter
  await page.locator(`button:has-text("SEARCH WITH AI")`).click()
  
  // Reset
  await page.getByRole(`button`, { name: `Advanced Filters check` }).click();
  await page.locator(`button:text("Reset")`).click();
  
  // Prompt
  await expect(page.locator(`:text("Running Search with AI")`)).toBeVisible();
  await expect(page.locator(`:text("Running Search with AI")`)).not.toBeVisible({timeout: 60_000});
  
  // Assert filter is reset
  for(let i=0; i < 20 ;i++) {
    const picCard = page.locator(`[data-testid="undecorate"]:has-text("MLS") .card-media-container >> nth=${i}`)
    await expect(picCard.locator(`:text("% match")`)).not.toBeVisible()
  }
  
  // Open filter
  await page.locator(`button:has-text("SEARCH WITH AI")`).click()
  
  // Click on Start Over
  await page.getByRole(`button`, { name: `Start Over` }).click();
  
  // Click on Confirm 
  await page.getByRole(`button`, { name: `Confirm` }).click();
  
  // Click on My Uploads dropdown
  await page.getByText(`My uploads`).click();
  
  // Count before remove upload
  const picCount = await page.locator(`div:has(div:text("My uploads")) + div div div span:text("close")`).count();
  console.log(picCount)
  
  // Remove first pic
  await page.locator(`div:has(div:text("My uploads")) + div`).first().hover();
  await page.locator(`div:has(div:text("My uploads")) + div span:text("close"):visible`).click();
  
  // Wait for deletion to complete
  await expect(page.locator(`.loader`).first()).toBeVisible();
  await expect(page.locator(`.loader`).first()).not.toBeVisible({ timeout: 60 * 1000 });
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert pic number 1 less than before
  // Open filter
  await page.reload();
  await page.locator(`button:has-text("SEARCH WITH AI")`).click()
  await page.waitForTimeout(5000);
  
  // Click on Search with My Photos
  await page.getByText(`Search with My Photos`).click();
  
  // Click on My Uploads dropdown
  await page.getByText(`My uploads`).click();
  
  const newPicCount = await page.locator(`div:has(div:text("My uploads")) + div div div span:text("close")`).count();
  expect(newPicCount).toEqual(picCount-1)
  
});