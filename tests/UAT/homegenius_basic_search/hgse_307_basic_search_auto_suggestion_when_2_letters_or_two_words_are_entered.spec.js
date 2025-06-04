import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_307_basic_search_auto_suggestion_when_2_letters_or_two_words_are_entered", async () => {
 // Step 1. HGSE-307 Searching with two letters 
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  // Navigate to homegenius home search
  const {page} = await goToHomegenius();
  await page.goto(`${process.env.URL_HOMEGENIUS}/home-search`)
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Enter N 
  await page.getByPlaceholder(`Address, city, neighborhood,`).fill(`N`);
  
  // SOft assert no drop down 
  await expect(page.locator(
    `p:text("Places")`
  )).not.toBeVisible();
  
  // Enter E
  await page.getByPlaceholder(`Address, city, neighborhood,`).fill(`NE`);
  
  // Soft assert drop down appears
  await expect(page.locator(
    `p:text("Places")`
  )).toBeVisible();
  
  
  // Enter full text -> NEw YORk 
  // SHould not be cap sensitive
  await page.getByPlaceholder(`Address, city, neighborhood,`).fill(`NEW YORK`);
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert cities show up 
  await expect(page.locator(
    `li:has-text("New York"):visible`
  )).toHaveCount(12);
  
  
});