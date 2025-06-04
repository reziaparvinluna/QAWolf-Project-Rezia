import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_3135_embedding_search_sort_by_field_changes", async () => {
 // Step 1. HGSE-3135 [Embedding Search] Sort By Field Changes - Photo Only
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const filePaths = [
    `/home/wolf/team-storage/uploadImage15.jpg`,
    `/home/wolf/team-storage/uploadImage16.jpg`,
    `/home/wolf/team-storage/uploadImage17.jpg`,
  ];
  const elementSelector = `#instructions-text`;
  
  async function assertSortByPercentMatch(page){
    const percentScores = await page.locator(`[data-testid="undecorate"] div:text("match")`).allInnerTexts();
    const formatScores = percentScores.map(score => Number(score.split("% ")[0]))
    const sortDescendScores = formatScores.sort((a, b) => b - a)
    for (let i = 0; i < sortDescendScores.length; i++){
      await expect(page.locator(
        `[data-testid="undecorate"]:has-text("$") >> nth=${i} >> div:text("${sortDescendScores[i]}% match")`
      )).toBeVisible();
    }
  }
  
  // 1) Login to https://qa-portal.homegeniusrealestate.com/
  // https://qa-portal.homegeniusrealestate.com/ is launched
  const {page, context} = await logInHomegeniusUser()
  
  // Click on Find a Home
  await page.getByRole(`link`, { name: `Find a Home`, exact: true }).click();
  
  // Fill in New York
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).first().fill(`New York`);
  
  // Click on New york
  await page.getByRole(`button`, { name: `New York`, exact: true }).click({ delay: 1000 });
  
  // Click on Search
  await page.getByRole(`button`, { name: `Search` }).first().click({delay: 3000});
  
  // Close the helper modal
  await page.getByRole(`button`, { name: `close` }).last().click({delay: 3000});
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // 2) Select Search with AI and upload 3 images
  // We should see Sort By Options & Applicability Rules
  // Sort By options are displayed, attached an image
  
  // Click on Search With AI
  await page.getByRole(`button`, { name: `SEARCH WITH AI` }).click();
  
  // Click on Search with My Photos
  await page.getByText(`Search with My Photos`).click();
  
  // Upload Images
  await uploadMultipleImages(page, elementSelector, filePaths);
  
  // Click on Apply
  await page.getByRole(`button`, { name: `Apply` }).click({timeout: 60_000});
  
  // Assert run finishes
  await expect(page.locator(`p:text("Running Search with AI")`)).toBeVisible({timeout: 45_000});
  await expect(page.locator(`p:text("Running Search with AI")`)).not.toBeVisible({timeout: 200_000});
  
  // Click on Best Match Dropdown
  await page.getByText(`Best Matchexpand_more`).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // Assert Sort By Fields Best Match, Photo Similarity, (Feature Similarity - Hidden)
  await expect(page.getByRole(`option`, { name: `Best Match` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Photo Similarity` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Feature Similarity` })).not.toBeVisible();
  await expect(page.getByRole(`option`, { name: `Recently Updated` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Price (High to Low)` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Price (Low to High)` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Bedrooms` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Bathrooms` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Price per sqft (High to Low)` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Price per sqft (Low to High)` })).toBeVisible();
  
  
  
  
  
 // Step 2. HGSE-3135 [Embedding Search] Sort By Field Changes - No Photos, no hgIQ Advanced Filters, no text prompts
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  
  //--------------------------------
  // Act:
  //--------------------------------
  // 3) User searches using Standard Filters Only (No photos, no hgIQ 
  // advanced filters, no text prompts) or no filters at all
  // As a result:
  // a. Sort By field remains as is currently; no change
  // b. Best Match, Photo Similarity, Feature Similarity are hidden
  
  // Click on Search With AI
  await page.getByRole(`button`, { name: `SEARCH WITH AI check` }).click();
  
  // Click on Start Over
  await page.getByRole(`button`, { name: `Start Over` }).click();
  
  // Click on Confirm on "Reset Features" modal
  await page.getByRole(`button`, { name: `Confirm` }).click();
  
  // Click on close to clsoe the modal
  await page.locator(`h3:text("Search with AI") + button`).click();
  
  // Click on Recently Updated Dropdown sort list
  await page.locator(`[role="combobox"] div:has-text("Recently Updated")`).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert Sort By Fields (Best Match, Photo Similarity, Feature Similarity - Hidden)
  await expect(page.getByRole(`option`, { name: `Best Match` })).not.toBeVisible();
  await expect(page.getByRole(`option`, { name: `Photo Similarity` })).not.toBeVisible();
  await expect(page.getByRole(`option`, { name: `Feature Similarity` })).not.toBeVisible();
  await expect(page.getByRole(`option`, { name: `Recently Updated` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Price (High to Low)` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Price (Low to High)` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Bedrooms` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Bathrooms` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Price per sqft (High to Low)` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Price per sqft (Low to High)` })).toBeVisible();
  
  
  
 // Step 3. HGSE-3135 [Embedding Search] Sort By Field Changes - hgIQ Advanced Only (no Photos or text prompts)
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  
  
  //--------------------------------
  // Act:
  //--------------------------------
  // 4) User searches using Standard Filters + hgIQ Advanced Only 
  // (no Photos or text prompts)
  // As a result:
  // a. Sort by option will include Best Match
  // b. Default value = Best Match; Sort using HGIQ Match % value in descending order
  // c. Photo Similarity, Feature Similarity will be hidden
  
  // Click on Search With AI
  await page.getByRole(`button`, { name: `SEARCH WITH AI` }).click();
  
  // Click on Advanced Filters
  await page.getByRole(`button`, { name: `Advanced Filters` }).click();
  
  // Click on Bathrooms dropdown
  await page.locator(`p:text("Bathrooms") + div >> nth=0`).click();
  
  // Click on Excellent
  await page.getByRole(`option`, { name: `Excellent` }).getByRole(`checkbox`).click();
  
  // Click on Bedrooms dropdown
  await page.locator(`p:text("Bedrooms") + div >> nth=0`).click();
  
  // Click on Excellent
  await page.getByRole(`option`, { name: `Excellent` }).getByRole(`checkbox`).click();
  
  // Click on Apply(2)
  await page.getByRole(`button`, { name: `Apply (2)` }).click();
  
  // Click on Best Match Dropdown
  await page.getByText(`Best Matchexpand_more`).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert Sort By Fields Best Match (Photo Similarity, Feature Similarity - Hidden)
  await expect(page.getByRole(`option`, { name: `Best Match` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Photo Similarity` })).not.toBeVisible();
  await expect(page.getByRole(`option`, { name: `Feature Similarity` })).not.toBeVisible();
  await expect(page.getByRole(`option`, { name: `Recently Updated` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Price (High to Low)` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Price (Low to High)` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Bedrooms` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Bathrooms` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Price per sqft (High to Low)` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Price per sqft (Low to High)` })).toBeVisible();
  
  // Assert Sort using HGIQ Match % value in descending order
  await assertSortByPercentMatch(page);
  
 // Step 4. HGSE-3135 [Embedding Search] Sort By Field Changes - Photos (incl. hgIQ Advanced) but no text prompts
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  
  //--------------------------------
  // Act:
  //--------------------------------
  // 5) User searches using Standard Filters + Photos (incl. hgIQ Advanced) 
  // but no text prompts
  // As a result:
  // a. Sort by option will include Best Match and Photo Similarity
  // b. Default value = Best Match; Sort using HGIQ Match % value in descending order, 
  // then by Asset Similarity Score - Photo in ascending order
  // c. If user chooses Photo Similarity, then Sort using Asset Similarity Score - Photo in ascending order
  // d. Feature Similarity will be hidden
  
  // Click on Search With AI
  await page.locator(`button :text("Search with ai")`).waitFor()
  await page.waitForTimeout(3000)
  await page.locator(`button :text("Search with ai")`).click({force: true});
  
  // Click on Search with My Photos
  await page.getByText(`Search with My Photos`).click();
  
  // Upload Images
  await uploadMultipleImages(page, elementSelector, filePaths);
  
  // Click on Apply
  await page.getByRole(`button`, { name: `Apply` }).click({timeout: 60_000});
  
  // Assert run finishes
  await expect(page.locator(`p:text("Running Search with AI")`)).toBeVisible({timeout: 45_000});
  await expect(page.locator(`p:text("Running Search with AI")`)).not.toBeVisible({timeout: 120_000});
  
  // Click on Best Match Dropdown
  await page.getByText(`Best Matchexpand_more`).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert Sort By Fields Best Match Photo Similarity, (Feature Similarity - Hidden)
  await expect(page.getByRole(`option`, { name: `Best Match` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Photo Similarity` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Feature Similarity` })).not.toBeVisible();
  await expect(page.getByRole(`option`, { name: `Recently Updated` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Price (High to Low)` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Price (Low to High)` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Bedrooms` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Bathrooms` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Price per sqft (High to Low)` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Price per sqft (Low to High)` })).toBeVisible();
  
  // Assert Sort using HGIQ Match % value in descending order
  await assertSortByPercentMatch(page);
  
 // Step 5. HGSE-3135 [Embedding Search] Sort By Field Changes - Text Prompts (No photos, no hgIQ advanced filters)
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const words = faker.random.words(50);
  
  
  //--------------------------------
  // Act:
  //--------------------------------
  // 6) User searches using Standard Filters + Text Prompts 
  // (No photos, no hgIQ advanced filters)
  // As a result:
  // a. Sort by option will include Best Match and Feature Similarity
  // b. Default value = Best Match; Sort using Asset Similarity Score - Text in ascending order
  // c. If user chooses Feature Similarity, then Sort using Asset Similarity Score - Text in ascending order (same as sort rule as Best Match)
  // d. Photo Similarity will be hidden
  
  // Click on Search With AI
  await page.getByRole(`button`, { name: `SEARCH WITH AI` }).click();
  
  // Click on Start Over
  await page.getByRole(`button`, { name: `Start Over` }).click();
  
  // Click on Confirm on "Reset Features" modal
  await page.getByRole(`button`, { name: `Confirm` }).click();
  
  // Click on Describe Features Tab
  await page.getByText(`Describe Features`, { exact: true }).click();
  
  // Click on Search With AI
  await page.getByRole(`button`, { name: `SEARCH WITH AI` }).click();
  
  // Fill in a Room Type
  await page.getByRole(`combobox`, { name: `Room Type` }).fill(`Kitchen`);
  
  // Fill in Descriptons for Room
  await page.getByRole(`textbox`, { name: `e.g., white cabinets, wood` }).fill(words);
  
  // Click on Apply
  await page.getByRole(`button`, { name: `Apply` }).click({delay: 3000});
  
  // Assert run finishes
  await expect(page.locator(`p:text("Running Search with AI")`)).toBeVisible({timeout: 45_000});
  await expect(page.locator(`p:text("Running Search with AI")`)).not.toBeVisible({timeout: 120_000});
  
  // Click on Best Match Dropdown
  await page.getByText(`Best Matchexpand_more`).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert Sort By Fields Best Match (Photo Similarity - Hidden), Feature Similarity
  await expect(page.getByRole(`option`, { name: `Best Match` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Photo Similarity` })).not.toBeVisible();
  await expect(page.getByRole(`option`, { name: `Feature Similarity` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Recently Updated` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Price (High to Low)` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Price (Low to High)` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Bedrooms` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Bathrooms` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Price per sqft (High to Low)` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Price per sqft (Low to High)` })).toBeVisible();
  
  // Assert Sort using HGIQ Match % value in descending order
  await assertSortByPercentMatch(page);
  
  
 // Step 6. HGSE-3135 [Embedding Search] Sort By Field Changes - Text Prompts AND hgIQ Advanced (but no Photos)
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  
  
  //--------------------------------
  // Act:
  //--------------------------------
  // 7) User searches using Text Prompts AND hgIQ Advanced 
  // (but no Photos)
  // As a result:
  // a. Sort by option will include Best Match and Feature Similarity
  // b. Default value = Best Match; Sort using HGIQ Match % value in descending order, then by Asset Similarity Score - c. Text in ascending order
  // c. If user chooses Feature Similarity, then Sort using Asset Similarity Score - Text in ascending order
  // d. Photo Similarity will be hidden
  
  // Click on Search With AI
  await page.getByRole(`button`, { name: `SEARCH WITH AI` }).click();
  
  // Click on Advanced Filters
  await page.getByRole(`button`, { name: `Advanced Filters` }).click();
  
  // Click on Bathrooms dropdown
  await page.locator(`p:text("Bathrooms") + div >> nth=0`).click();
  
  // Click on Excellent
  await page.getByRole(`option`, { name: `Excellent` }).getByRole(`checkbox`).click();
  
  // Click on Bedrooms dropdown
  await page.locator(`p:text("Bedrooms") + div >> nth=0`).click();
  
  // Click on Excellent
  await page.getByRole(`option`, { name: `Excellent` }).getByRole(`checkbox`).click();
  
  // Click on Apply(2)
  await page.getByRole(`button`, { name: `Apply (2)` }).click();
  
  // Assert run finishes
  await expect(page.locator(`p:text("Running Search with AI")`)).toBeVisible({timeout: 45_000});
  await expect(page.locator(`p:text("Running Search with AI")`)).not.toBeVisible({timeout: 120_000});
  
  // Click on Best Match Dropdown
  await page.getByText(`Best Matchexpand_more`).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert Sort By Fields Best Match (Photo Similarity - Hidden), Feature Similarity
  await expect(page.getByRole(`option`, { name: `Best Match` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Photo Similarity` })).not.toBeVisible();
  await expect(page.getByRole(`option`, { name: `Feature Similarity` })).not.toBeVisible();
  await expect(page.getByRole(`option`, { name: `Recently Updated` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Price (High to Low)` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Price (Low to High)` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Bedrooms` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Bathrooms` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Price per sqft (High to Low)` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Price per sqft (Low to High)` })).toBeVisible();
  
  // Assert Sort using HGIQ Match % value in descending order
  await assertSortByPercentMatch(page);
  
  
 // Step 7. HGSE-3135 [Embedding Search] Sort By Field Changes - Photos (incl. hgIQ Advanced) AND Text Prompts
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  
  
  //--------------------------------
  // Act:
  //--------------------------------
  // 8) User searches using Photos (incl. hgIQ Advanced) AND Text Prompts
  // As a result:
  // a. Sort by option will include Best Match, Photo Similarity, and Feature Similarity
  // b. Default value = Best Match; Sort using HGIQ Match % value in descending order, then by Asset Similarity Score - Photo in ascending order
  // c. If user chooses Photo Similarity, then Sort using Asset Similarity Score - Photo in ascending order 
  // d. If user chooses Feature Similarity, then Sort using Asset Similarity Score - Text in ascending order
  
  // Click on Search With AI
  await page.getByRole(`button`, { name: `SEARCH WITH AI` }).click();
  
  // Click on Search with My Photos
  await page.getByText(`Search with My Photos`).click();
  
  // Upload Images
  await uploadMultipleImages(page, elementSelector, filePaths);
  
  // Click on Apply
  await page.getByRole(`button`, { name: `Apply` }).click();
  
  // Assert run finishes
  await expect(page.locator(`p:text("Running Search with AI")`)).toBeVisible({timeout: 45_000});
  await expect(page.locator(`p:text("Running Search with AI")`)).not.toBeVisible({timeout: 200_000});
  
  // Click on Best Match Dropdown
  await page.getByText(`Best Matchexpand_more`).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert Sort By Fields Best Match Photo Similarity, Feature Similarity
  await expect(page.getByRole(`option`, { name: `Best Match` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Photo Similarity` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Feature Similarity` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Recently Updated` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Price (High to Low)` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Price (Low to High)` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Bedrooms` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Bathrooms` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Price per sqft (High to Low)` })).toBeVisible();
  await expect(page.getByRole(`option`, { name: `Price per sqft (Low to High)` })).toBeVisible();
  
  // Assert Sort using HGIQ Match % value in descending order
  await assertSortByPercentMatch(page);
  
  
});