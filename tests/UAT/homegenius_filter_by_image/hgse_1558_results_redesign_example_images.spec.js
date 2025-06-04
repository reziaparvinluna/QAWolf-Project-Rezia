import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_1558_results_redesign_example_images", async () => {
 // Step 1. HGSE-1558: Results Redesign-Example Images
  //--------------------------------
  // Arrange:
  //--------------------------------
  const mlsNumber = "879876"
  
  // Login to Homeogenius UAT-Portal
  const {page,context} = await logInHomegeniusUser()
  
  await goToSearchPage(page, mlsNumber)
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Filter by image and example image
  await page.locator(`button:has-text("search with ai")`).click()
  await page.getByText(`Search with My Photos`).click();
  await page.getByText(`Example Images`).click();
  
  // Chose 1st one
  await page.locator(`div[open] >div>> div `).first().click({force: true})
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert prompt and button
  await expect(page.getByRole(`button`, { name: `Kitchen` })).toBeVisible();
  await expect(page.locator(`:text("hgIQ Filters Identified: 9")`)).toBeVisible();
  await expect(page.locator(`span:has-text("Room Condition:")`)).toBeVisible();
  await expect(page.getByRole(`button`, { name: `Advanced Filters check` })).toBeVisible();
  
  // Assert checkable, when unchecked go to bottom, alphabetically order
  await expect(page.locator(`label:has-text("Countertop: Stone")`)).toBeVisible();
  await expect(page.locator(`label:has-text("Dishwasher: Stainless"):below(label:has-text("Countertop: Stone"))`)).toBeVisible();
  await expect(page.locator(`label:has-text("Flooring: Wood"):below(label:has-text("Dishwasher: Stainless"))`)).toBeVisible();
  await expect(page.locator(`label:has-text("Hanging Lights: Yes"):below(label:has-text("Flooring: Wood"))`)).toBeVisible();
  await expect(page.locator(`label:has-text("Hood: Yes"):below(label:has-text("Hanging Lights: Yes"))`)).toBeVisible();
  
  // uncheck middle one
  await page.locator(`label:has-text("Flooring: Wood"):below(label:has-text("Dishwasher: Stainless"))`).click();
  await expect(page.locator(`:text("hgIQ Filters Identified: 8")`)).toBeVisible();
  
  
  // order changed
  await expect(page.locator(`label:has-text("Flooring: Wood")`)).toBeVisible();
  await expect(page.locator(`label:has-text("Hanging Lights: Yes"):below(label:has-text("Dishwasher: Stainless"))`)).toBeVisible();
  await expect(page.locator(`label:has-text("Flooring: Wood"):below(label:has-text("Room Condition: Good"))`)).toBeVisible();
  
  // re-check 
  await page.locator(`label:has-text("Flooring: Wood"):below(label:has-text("Room Condition: Good"))`).click();
  
  // Assert checkable, when unchecked go to bottom, alphabetically order
  await expect(page.locator(`label:has-text("Countertop: Stone")`)).toBeVisible();
  await expect(page.locator(`label:has-text("Dishwasher: Stainless"):below(label:has-text("Countertop: Stone"))`)).toBeVisible();
  await expect(page.locator(`label:has-text("Flooring: Wood"):below(label:has-text("Dishwasher: Stainless"))`)).toBeVisible();
  await expect(page.locator(`label:has-text("Hanging Lights: Yes"):below(label:has-text("Flooring: Wood"))`)).toBeVisible();
  await expect(page.locator(`label:has-text("Hood: Yes"):below(label:has-text("Hanging Lights: Yes"))`)).toBeVisible();
  
  // Buttons available
  await expect(page.locator(`:text("hgIQ Filters Identified: 9")`)).toBeVisible();
  await expect(page.getByRole(`button`, { name: `Start Over` })).toBeVisible();
  await expect(page.locator(`button:has-text("Advanced Filters")`)).toBeVisible();
  
  // Apply
  await page.getByRole(`button`, { name: `Apply` }).click();
  
  // Assert first 20 listing are 100% match the hgiq 
  for(let i=0; i < 20 ;i++) {
    const picCard = page.locator(`[data-testid="undecorate"]:has-text("MLS") .card-media-container >> nth=${i}`)
    await expect(picCard.locator(`:text("% match")`)).toBeVisible()
  }
  
});