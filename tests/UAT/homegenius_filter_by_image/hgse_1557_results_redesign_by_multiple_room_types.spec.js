import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_1557_results_redesign_by_multiple_room_types", async () => {
 // Step 1. HGSE-1557: Results Redesign By Multiple Room Types
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Login to Homeogenius UAT-Portal
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
  await page.getByRole(`button`, { name: `New York` }).click({delay: 1000});
  
  // Click on Search
  await page.getByRole(`button`, { name: `Search` }).first().click({delay: 5000});
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Filter by image and uploads image
  await page.locator(`button:has-text("search with ai")`).click()
  await page.getByText(`Search with My Photos`).click();
  const elementSelector = `:text("Choose a file")`;
  const filePaths = [`/home/wolf/team-storage/1557rm1.jpg`,`/home/wolf/team-storage/1557rm2.jpg`,`/home/wolf/team-storage/1557rm3.jpg`]
  
  await uploadMultipleImages(page, elementSelector, filePaths)
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert prompt and button
  await expect(page.locator(`p:text("Your images have been successfully uploaded! homegeniusIQ has identified new filters that will be applied to your search.")`)).toBeVisible({ timeout: 90 * 1000 });
  
  // Assert multiple purpose room
  await page.locator(`button:text("Multi-Purpose Room")`).click();
  await expect(page.locator(`div:text("hgIQ Filters Identified: 3")`)).toBeVisible();
  await expect(page.locator(`span:has-text("Room Condition:")`)).toBeVisible();
  // Hover and remove buton visible
  await page.locator(`div:text("1/1")`).hover({force:true});
  await expect(page.locator(`span:text("delete")`)).toBeVisible();
  
  // Assert order, check and unchecked filter
  await expect(page.locator(`label:has-text("Ceiling: Beam")`)).toBeVisible();
  await expect(page.locator(`label:has-text("Flooring: Wood"):below(label:has-text("Ceiling: Beam"))`)).toBeVisible();
  await expect(page.locator(`label:has-text("Room Condition: Good"):below(label:has-text("Flooring: Wood"))`)).toBeVisible();
  // uncheck middle
  await page.locator(`label:has-text("Flooring: Wood"):below(label:has-text("Ceiling: Beam"))`).click();
  await expect(page.locator(`label:has-text("Ceiling: Beam")`)).toBeVisible();
  await expect(page.locator(`label:has-text("Flooring: Wood"):below(label:has-text("Room Condition: Good"))`)).toBeVisible();
  await expect(page.locator(`label:has-text("Room Condition: Good"):below(label:has-text("ceiling: beam"))`)).toBeVisible();
  // recheck
  await page.locator(`label:has-text("Flooring: Wood"):below(label:has-text("Ceiling: Beam"))`).click();
  await expect(page.locator(`label:has-text("Ceiling: Beam")`)).toBeVisible();
  await expect(page.locator(`label:has-text("Flooring: Wood"):below(label:has-text("Ceiling: Beam"))`)).toBeVisible();
  await expect(page.locator(`label:has-text("Room Condition: Good"):below(label:has-text("Flooring: Wood"))`)).toBeVisible();
  
  // Assert Bathroom
  await page.locator(`button:text("Bathroom")`).click();
  await expect(page.locator(`div:text("hgIQ Filters Identified: 3")`)).toBeVisible();
  await expect(page.locator(`span:has-text("Room Condition:")`)).toBeVisible();
  // Hover and remove buton visible
  await page.locator(`div:text("1/1")`).hover({force:true});
  await expect(page.locator(`span:text("delete")`)).toBeVisible();
  
  // Assert order, check and unchecked filter
  await expect(page.locator(`label:has-text("Countertop: Stone")`)).toBeVisible();
  await expect(page.locator(`label:has-text("Flooring: Tile"):below(label:has-text("Countertop: Stone"))`)).toBeVisible();
  await expect(page.locator(`label:has-text("Room Condition: Good"):below(label:has-text("Flooring: Tile"))`)).toBeVisible();
  // uncheck middle
  await page.locator(`label:has-text("Flooring: Tile"):below(label:has-text("Countertop: Stone"))`).click();
  await expect(page.locator(`label:has-text("Countertop: Stone")`)).toBeVisible();
  await expect(page.locator(`label:has-text("Flooring: Tile"):below(label:has-text("Room Condition: Good"))`)).toBeVisible();
  await expect(page.locator(`label:has-text("Room Condition: Good"):below(label:has-text("Countertop: Stone"))`)).toBeVisible();
  // recheck
  await page.locator(`label:has-text("Flooring: Tile"):below(label:has-text("Countertop: Stone"))`).click();
  await expect(page.locator(`label:has-text("Countertop: Stone")`)).toBeVisible();
  await expect(page.locator(`label:has-text("Flooring: Tile"):below(label:has-text("Countertop: Stone"))`)).toBeVisible();
  await expect(page.locator(`label:has-text("Room Condition: Good"):below(label:has-text("Flooring: Tile"))`)).toBeVisible();
  
  // Assert kitchen
  await page.locator(`button:text("Kitchen")`).click();
  await expect(page.locator(`div:text("hgIQ Filters Identified: 5")`)).toBeVisible();
  await expect(page.locator(`span:has-text("Room Condition:")`)).toBeVisible();
  // Hover and remove buton visible
  await page.locator(`div:text("1/1")`).hover({force:true});
  await expect(page.locator(`span:text("delete")`)).toBeVisible();
  
  // Assert order, check and unchecked filter
  await expect(page.locator(`label:has-text("Flooring: Wood"):below(label:has-text("Dishwasher: stainless"))`)).toBeVisible();
  await expect(page.locator(`label:has-text("Room Condition: Good"):below(label:has-text("Flooring: Wood"))`)).toBeVisible();
  await expect(page.locator(`label:has-text("Skylight: yes"):below(label:has-text("Room Condition: Good"))`)).toBeVisible();
  // uncheck middle
  await page.locator(`label:has-text("Room Condition: Good"):below(label:has-text("Flooring: Wood"))`).click();
  await expect(page.locator(`label:has-text("Flooring: Wood"):below(label:has-text("dishwasher: stainless"))`)).toBeVisible();
  await expect(page.locator(`label:has-text("Skylight: Yes"):below(label:has-text("Flooring: Wood"))`)).toBeVisible();
  await expect(page.locator(`label:has-text("Room Condition: Good"):below(label:has-text("Skylight: Yes"))`)).toBeVisible();
  // recheck
  await page.locator(`label:has-text("Room Condition: Good"):below(label:has-text("Flooring: Wood"))`).click();
  await expect(page.locator(`label:has-text("Flooring: Wood"):below(label:has-text("Dishwasher: stainless"))`)).toBeVisible();
  await expect(page.locator(`label:has-text("Room Condition: Good"):below(label:has-text("Flooring: Wood"))`)).toBeVisible();
  await expect(page.locator(`label:has-text("Skylight: yes"):below(label:has-text("Room Condition: Good"))`)).toBeVisible();
  
  // Click Apply
  await page.getByRole("button", { name: "Apply" }).click();
  
  // Prompt
  await expect(page.locator(`:text("Running Search with AI")`)).toBeVisible();
  await expect(page.locator(`:text("Running Search with AI")`)).not.toBeVisible({timeout: 60_000});
  
  // Assert first 19 listing are some % match the hgiq 
  for(let i=0; i < 19 ;i++) {
    const picCard = page.locator(`[data-testid="undecorate"]:has-text("MLS") .card-media-container >> nth=${i}`)
    await expect(picCard.locator(`:text("% match")`)).toBeVisible()
  }
  
  // Open filter
  await page.locator(`button:has-text("search with ai")`).click()
  
  // Start Over
  await page.getByRole(`button`, { name: `Start Over` }).click();
  
  // Click on Confirm
  await page.getByRole(`button`, { name: `Confirm` }).click();
  
  // Assert filter is reset
  for(let i=0; i < 20 ;i++) {
    const picCard = page.locator(`[data-testid="undecorate"]:has-text("MLS") .card-media-container >> nth=${i}`)
    await expect(picCard.locator(`:text("% match")`)).not.toBeVisible()
  }
  
});