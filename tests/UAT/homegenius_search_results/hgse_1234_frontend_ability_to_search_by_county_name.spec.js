import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_1234_frontend_ability_to_search_by_county_name", async () => {
 // Step 1. HGSE-1234 - Frontend - Ability to Search by County Name
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const partialName = "Livin";
  const fullName = "Livingston";
  const stateName = "Michigan";
  const stateAbbr = "MI";
  const countySelector = `div:has(p:text("Counties")) ~ ul li:has(button:has-text("LivingstonMI"))`;
  
  //--------------------------------------Step 1------------------------------------
  //--------------------------------------------------------------------------------
  // https://qa-portal.homegeniusrealestate.com/
  // Enter valid credentials userId & a Password
  // https://qa-portal.homegeniusrealestate.com/ is launched
  
  // Login to Homeogenius UAT-Portal
  const {page,context} = await logInHomegeniusUser()
  
  // Go to Search page
  await goToSearchPage(page);
  
  //--------------------------------
  // Act & Assert:
  //--------------------------------
  
  //--------------------------------------Step 2------------------------------------
  //--------------------------------------------------------------------------------
  // When searched, County recommendation displayed under its own Category called 
  // County, should placed under the Places category and above the Neighborhood 
  // category, by searching with these 5 recognizable patterns
  
  // Recognizable search patterns should include:
  // >Partial County Name
  // >Full County Name
  // >County Name and State Name
  // >County Name and State Abbr.
  // >The word "County" is not necessary to provide County recommendations
  
  // County recommendation displayed under its own Category called County, is placed 
  // under the Places category and above the Neighborhood category. Searching by these 
  // 5 recognizable patterns
  
  //--------------------------------------Step 3------------------------------------
  //--------------------------------------------------------------------------------
  // The county matches should be sorted by population size (or by proximity to the 
  // user if they have shared their location)
  // The county matches is sorted by population size (or by proximity to the user if 
  // they have shared their location)
  
  //--------------------------------------Step 4------------------------------------
  //--------------------------------------------------------------------------------
  // When a user inputs a County name (full or partial), the recommendations display 
  // the County and State
  // When a user inputs a County name (full or partial), the recommendations displayed 
  // the County and State
  
  // Enter Partial Name
  await page.getByPlaceholder(`Address, city, neighborhood,`).fill(partialName);
  
  // Assert result shows up under Counties category with School District and State
  await expect(page.locator(countySelector)).toBeVisible();
  
  // Empty search input
  await page.getByPlaceholder(`Address, city, neighborhood,`).fill("");
  
  // Enter Full Name 
  await page.getByPlaceholder(`Address, city, neighborhood,`).fill(fullName);
  
  // Assert result shows up under Counties category with School District and State
  await expect(page.locator(countySelector)).toBeVisible();
  
  // Empty search input
  await page.getByPlaceholder(`Address, city, neighborhood,`).fill("");
  
  // Enter Full Name and State Name and assert and empty input
  await page.getByPlaceholder(`Address, city, neighborhood,`).fill(`${fullName} ${stateName}`);
  
  // Assert result shows up under Counties category with School District and State
  await expect(page.locator(countySelector)).toBeVisible();
  
  // Empty search input
  await page.getByPlaceholder(`Address, city, neighborhood,`).fill("");
  
  // Enter Full Name and State Abbriviation and assert
  await page.getByPlaceholder(`Address, city, neighborhood,`).fill(`${fullName} ${stateAbbr}`);
  
  // Assert result shows up under Counties category with School District and State
  await expect(page.locator(countySelector)).toBeVisible();
  
  
 // Step 2. Click on County and verify home listed are within the county
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const boundaryList = [
    `Pinckney Vlg`,
    `Hamburg Twp`,
    `Genoa Twp`,
    `Whitmore Lake`,
    `Pinckney`,
    `Putnam Twp`,
    `Dexter Twp`,
    `Tyrone Twp`,
    `Fowleville Vllg`,
    `Fowlerville Vlg`,
    `Fowlerville`,
    `Oceola Twp`,
    `Brighton`,
    `Unadilla Twp`,
    `Deerfield Twp`,
    `Brighton Twp`,
    `Howell`,
    `Howell Twp`,
    `Green Oak Twp`,
    `Handy Twp`,
    `Marion Twp`,
    `Conway Twp`,
    `Milford`,
    'Hartland Twp', 
    'South Lyon',
    'Cohoctah Twp',
    'Lyon Twp',
    'Iosco Twp',
    'Gregory',
    'Fenton',
    'Handy',
  ]
  
  //--------------------------------------Step 5------------------------------------
  //--------------------------------------------------------------------------------
  // When a County is selected, the search results should display the County boundary 
  // on the map and ALL the properties contained within that boundary
  // When a County is selected, the search results displayed the County boundary on 
  // the map and ALL the properties contained within that boundary
  
  //--------------------------------------Step 6------------------------------------
  //--------------------------------------------------------------------------------
  // The user should be able to successfully find the correct county recommendation 
  // using the recognizable search patterns listed above
  // The user is able to successfully find the correct county recommendation using 
  // the recognizable search patterns listed above
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Click on the County
  await page.locator(countySelector).click(); 
  
  // Close the helper modal so we can assert with screenshot
  await page.getByRole(`button`, { name: `close` }).nth(1).click();
  await page.waitForTimeout(5000);
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert map with boundary
  await expect(async () => {
    await expect(page.locator(
      `[id="deckgl-overlay"]`
    )).toHaveScreenshot('county_livingston', {maxDiffPixelRatio: 0.05})
  }).toPass({timeout: 30_000})
  
  // Grab all the City/Town of properties listed
  const properties = await page.locator(`[type="LARGE_CARD"] + [font-size="0.875rem"]`).allTextContents(); 
  // console.log(properties)
  const propertiesList = properties.map((e) => e.split(", ")[0]);
  
  // Assert Properties shown are within Boundary list
  for (let property of propertiesList){
    console.log(`property: ` + property)
    expect(boundaryList.includes(property)).toBeTruthy(); 
  }
  
  
});