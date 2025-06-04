import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_921_pressing_go_enter_in_search_bar_selects_top_recommendation", async () => {
 // Step 1. HGSE-921 Pressing go/enter in search bar selects top recommendation - Partial Address
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const searchAddress = {
    address1: "Main Street District Dallas TX",
    address2: "8766 Voyager Trl Harbor Springs MI"
  }
  
  //--------------------------------------Step 1------------------------------------
  //--------------------------------------------------------------------------------
  // Login to https://qa-portal.homegeniusrealestate.com/
  // Enter valid credentials userid & a password
  // https://qa-portal.homegeniusrealestate.com/ is launched
  
  // Login to Homeogenius UAT-Portal
  const { page, context } = await logInHomegeniusUser()
  
  // Go to Search page
  await goToSearchPage(page);
  
  // Close helper modal
  await page.locator(`span:text("close"):visible`).click();
  
  //--------------------------------------Step 2------------------------------------
  //--------------------------------------------------------------------------------
  // When the user inputs search criteria that return recommendations and presses enter 
  // or clicks on the "Go" button, the application should run the search using the top 
  // recommendation on the list
  // Fill in first address
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).fill(searchAddress.address1);
  
  // Soft Assert Address displays
  await expect(page.locator(
    `ul button:has-text("Main Street DistrictDallas TX")`
  )).toBeVisible();
  
  // Click on the result
  await page.locator(
    `ul button:has-text("Main Street DistrictDallas TX")`
  ).click();
  
  //--------------------------------------Step 3------------------------------------
  //--------------------------------------------------------------------------------
  // A pill using the top recommendation on the list has to be created so the user can 
  // see the search input applied to the search
  
  // Assert pill
  await expect(page.locator(
    `[title="Main Street District, Dallas TX"]`
  )).toBeVisible();
    await page.waitForTimeout(5000);
  
  //--------------------------------------Step 4------------------------------------
  //--------------------------------------------------------------------------------
  // If the first recommendation that is an individual address, then open the Property 
  // Details page in a new tab
  // -- Note -- 
  // Pressing enter on /home-search page for a full addresss search leads back to main page.
  // per Rezia Step 4 will be an enhancement story
  // https://drive.google.com/file/d/10J4ak1VadVFMyDx6l4eiSf5ttVxk3JeF/view?usp=sharing
  
 // Step 2. HGSE-921 Enter an address with no results
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const nonResult = faker.random.words(5);
  
  // Clean up - clear the pill
  await expect(async () => {
    await page.locator(`[title="Main Street District, Dallas TX"] + button`).click();
    await expect(
      page.locator(`[title="Main Street District, Dallas TX"] + button`)
    ).not.toBeVisible()
  }).toPass({timeout: 60_000})
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  //--------------------------------------Step 5------------------------------------
  //--------------------------------------------------------------------------------
  // If there are no results, then enter/go will not perform search
  // When there are no results, then enter/go did not performed a search
  //--------------------------------------Step 6------------------------------------
  //--------------------------------------------------------------------------------
  // This was applied to the Landing page search bar but should apply to all search bars
  // Applied to all search bars
  
  // Fill in random text
  await page.waitForTimeout(5000);
  await page.locator(
    `[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`
  ).fill(nonResult);
  
  // Press enter
  await page.waitForTimeout(5000);
  await page.keyboard.press("Enter");
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert no action was performed
  // Assert we are still at home-search page
  expect(page.url()).toContain('/home-search')
  
  // Assert we see error message
  await expect(page.locator(
    `p:text('We couldn\\'t find "${nonResult}".')`
  )).toBeVisible(); 
  
  
 // Step 3. HGSE-921 Enter an address after a pill
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const pills = {
    one: "Putnam",
    two: "Pinckney"
  }
  
  // Clear search result
  await page.locator(
    `[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`
  ).fill('');
  
  //--------------------------------
  // Act:
  //--------------------------------
  //--------------------------------------Step 7------------------------------------
  //--------------------------------------------------------------------------------
  // When there is already a pill created, search and hitting enter should add the 
  // search pill and perform the search for all pills, right now, it is not selecting 
  // the top option when a pill has already been created
  // Performing search for all pills & has to select the to pill
  
  // Fill in Pill 1
  await page.locator(
    `[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`
  ).fill(pills.one);
  
  // Press enter
  await page.waitForSelector('button:has-text("Putnam Valley")')
  await page.keyboard.press("Enter");
  await page.waitForTimeout(5000);
  
  // Fill in Pill 2
  await page.locator(
    `[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`
  ).fill(pills.two);
  
  // Press enter
  await page.waitForSelector('button:has-text("Pinckneyville")')
  await page.keyboard.press("Enter");
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert search results have results from both Putnam Valley, NY & Pinckneyville, IL
  await expect(page.locator(
    `[data-testid="undecorate"]:has-text("$"):has-text("Putnam Valley")`
  ).first()).toBeVisible();
  await expect(page.locator(
    `[data-testid="undecorate"]:has-text("$"):has-text("Pinckneyville, IL")`
  ).first()).toBeVisible();
  
  // Assert Pills are showing
  await expect(page.locator(
    `[title="Putnam Valley, NY"]`
  )).toBeVisible();
  await expect(page.locator(
    `[title="1 more"]`
  )).toBeVisible();
  
 // Step 4. HGSE-921 Enter a Zipcode
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Clean up pills
  await page.getByRole(`button`, { name: `close` }).first().click();
  await page.waitForTimeout(5000);
  await page.getByRole(`button`, { name: `close` }).first().click();
  await page.waitForTimeout(5000);
  
  // Constants
  const zipCode = '33458';
  
  //--------------------------------
  // Act:
  //--------------------------------
  //--------------------------------------Step 8------------------------------------
  //--------------------------------------------------------------------------------
  // Enter any Zipcode 33458, when the top recommendation is Zip, selectinga. the 
  // search takes you to the first property under address recommendations instead of 
  // searching in the 33458 zip code.
  // When searched with the Zip and when Zipcode is top of the recommendations, search 
  // is not taking Property under address recommendations
  
  // Fill in with zip code 33458
  await page.getByPlaceholder(`Address, city, neighborhood,`).fill(zipCode);
  
  // Press enter 
  await page.waitForTimeout(5000);
  await page.keyboard.press("Enter");
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert Zip code pill
  await expect(page.locator(
    `[title="33458, FL"]`
  )).toBeVisible();
  
  // Assert results show zipcode
  await expect(page.locator(
    `[data-testid="undecorate"]:has-text("$"):has-text("33458")`
  )).toHaveCount(30);
  
 // Step 5. HGSE-921 Enter second and third option cities
  //--------------------------------
  // Arrange:
  //--------------------------------
  const boundaryList = [
    'Jupiter',
    'Putnam Valley',
    'Pinckneyville',
    'FL 33458'
  ]
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  //--------------------------------------Step 9------------------------------------
  //--------------------------------------------------------------------------------
  // Navigate and select a second or a third option City suggestion from dropdown list 
  // and if the user clicks 'GO' it is showing 2 pins on search bar but the results is 
  // "No properties meet your criteria"a. If we remove the second pill we can see the 
  // property results
  // When selecting a second or a third option City suggestion from dropdown list and 
  // if the user clicks 'GO' it is showing 2 pins on search bar but the results NOT 
  // showing as "No properties meet your criteria"a. Without removing the second pill 
  // we can see the property results
  
  // Fill in Pill 1
  await page.locator(
    `[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`
  ).fill(pills.one);
  
  // Press enter
  await page.waitForSelector('button:has-text("Putnam Valley")')
  await page.keyboard.press("Enter");
  await page.waitForTimeout(5000);
  
  // Fill in Pill 2
  await page.locator(
    `[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`
  ).fill(pills.two);
  
  // Press enter
  await page.waitForSelector('button:has-text("Pinckneyville")')
  await page.keyboard.press("Enter");
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Grab all the City/Town of properties listed
  const properties = await page.locator(`[type="LARGE_CARD"] + [font-size="0.875rem"]`).allTextContents(); 
  console.log(properties)
  const propertiesList = properties.map((e) => e.split(", ")[0]);
  
  // Assert Properties shown are within Boundary list
  for (let property of propertiesList){
    console.log(property)
    expect(boundaryList.includes(property)).toBeTruthy(); 
  }
  
  
 // Step 6. HGSE-921 Pressing go/enter in search bar selects top recommendation - Full Address
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Clean up pills
  await page.getByRole(`button`, { name: `close` }).first().click();
  await page.waitForTimeout(5000);
  await page.getByRole(`button`, { name: `close` }).first().click();
  await page.waitForTimeout(5000);
  await page.getByRole(`button`, { name: `close` }).first().click();
  await page.waitForTimeout(5000);
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  //--------------------------------------Step 10-----------------------------------
  //--------------------------------------------------------------------------------
  // Individually when search is entered as a first recommendation, property detail 
  // page is not opening in the same tab
  // Individually search is entered as a first recommendation, property detail page
  // is opening in the same tab
  
  // Fill in second address
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).fill(searchAddress.address2);
  
  // Soft Assert Address enter is first selection
  await expect(page.locator(
    `ul button >> nth=0`
  )).toHaveText("8766 Voyager TrlHarbor Springs MI");
  
  // Click on result 
  // (Not using press enter per Rezia it will be an enhancement story)
  // https://drive.google.com/file/d/10J4ak1VadVFMyDx6l4eiSf5ttVxk3JeF/view?usp=sharing
  await page.getByRole(`button`, { name: `Voyager Trl Harbor Springs MI` }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert property Details page is open
  await expect(page.getByRole(`button`, { name: `Property Details` })).toBeVisible();
  await expect(page.locator(
    `p:text("8766 Voyager Trl")`
  )).toBeVisible();
  
});