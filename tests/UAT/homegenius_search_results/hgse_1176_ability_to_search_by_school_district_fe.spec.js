const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_1176_ability_to_search_by_school_district_fe", async () => {
 // Step 1. HGSE-1176 - Ability to search by School District - FE
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const partialSchool = "Pinckney Comm";
  const fullSchool = "Pinckney Community Schools";
  const stateName = "Michigan";
  const stateAbbr = "MI";
  const schoolSelector = `div:has(p:text("Schools")) ~ ul li:has(button:has-text("Pinckney Community SchoolsPinckney MI"))`;
  
  //--------------------------------------Step 1------------------------------------
  //--------------------------------------------------------------------------------
  // Login to https://qa-portal.homegeniusrealestate.com/
  // Enter valid user id and a password
  // Login to https://qa-portal.homegeniusrealestate.com/ is launched
  
  // Login to Homeogenius UAT-Portal
  const {page,context} = await logInHomegeniusUser()
  
  //--------------------------------------Step 2------------------------------------
  //--------------------------------------------------------------------------------
  // Navigate to the search page and enter a school district.
  // The school district is sorted and School District matches by population size 
  // (or by proximity to the user if they have shared their location)
  
  // Go to Search page
  await goToSearchPage(page);
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  //--------------------------------------Step 3------------------------------------
  //--------------------------------------------------------------------------------
  // Enter in Search criteria
  // >Partial School District Name
  // >Full School District Name
  // >School District Name and >State Name
  // >School District Name and State Abbrivation
  // The user is able to successfully find the correct School District recommendation 
  // using the recognizable search 4 patterns listed
  
  //--------------------------------------Step 6------------------------------------
  //--------------------------------------------------------------------------------
  // The recommendations should only appear under the School Category
  // The recommendations appeared under the Schools Category
  
  //--------------------------------------Step 7------------------------------------
  //--------------------------------------------------------------------------------
  // When a user inputs a School District (full or partial), the recommendations 
  // should display the School District and State
  // When a user inputs a School District (full or partial), the recommendations 
  // displayed the School District and State
  
  // Enter Partial Name
  await page.getByPlaceholder(`Address, city, neighborhood,`).fill(partialSchool);
  
  // Assert result shows up under school category with School District and State
  await expect(page.locator(schoolSelector)).toBeVisible(); 
  
  // Empty search input
  await page.getByPlaceholder(`Address, city, neighborhood,`).fill("");
  
  // Enter Full Name 
  await page.getByPlaceholder(`Address, city, neighborhood,`).fill(fullSchool);
  
  // Assert result shows up under school category with School District and State
  await expect(page.locator(schoolSelector)).toBeVisible(); 
  
  // Empty search input
  await page.getByPlaceholder(`Address, city, neighborhood,`).fill("");
  
  // Enter Full Name and State Abbriviation and assert
  await page.getByPlaceholder(`Address, city, neighborhood,`).fill(`${fullSchool} ${stateAbbr}`);
  
  // Assert result shows up under school category with School District and State
  await expect(page.locator(schoolSelector)).toBeVisible(); 
  
  // Empty search input
  await page.getByPlaceholder(`Address, city, neighborhood,`).fill("");
  
  // Enter Full Name and State Name and assert and empty input
  await page.getByPlaceholder(`Address, city, neighborhood,`).fill(`${fullSchool} ${stateName}`);
  
  // Assert result shows up under school category with School District and State
  await expect(page.locator(schoolSelector)).toBeVisible(); 
  
  
 // Step 2. Click on School District and verify homes are within the district
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
    `Unadilla Twp`,
    `Hamburg`,
    `Pickney Vllg`, 
    `Brighton`,
    `Brighton Twp`,
    `Wayne`
  ]
  
  //--------------------------------------Step 4------------------------------------
  //--------------------------------------------------------------------------------
  // When a School District is selected, the search results should display the School 
  // District boundary on the map and ALL the properties contained within that boundary
  // When a School District is selected, the search results displayed the School 
  // District boundary on the map and ALL the properties contained within that boundary
  
  //--------------------------------------Step 5------------------------------------
  //--------------------------------------------------------------------------------
  // Properties were showing up outside of the boundary for schools – We should only 
  // show listings inside school boundaries
  // Properties were showing up inside of the boundary for schools
  
  //--------------------------------------Step 8------------------------------------
  //--------------------------------------------------------------------------------
  // The boundaries were missing for school districts
  // Boundaries were showing for school districts
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Click on the District
  await page.locator(schoolSelector).click(); 
  
  // Close the helper modal so we can assert with screenshot
  await page.getByRole(`button`, { name: `close` }).nth(1).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert map with boundary
  await expect(async () => {
    await expect(page.locator(
      `[id="deckgl-overlay"]`
    )).toHaveScreenshot('school_district_pinckney', {maxDiffPixelRatio: 0.05})
  }).toPass({timeout: 10_000})
  
  // Grab all the City/Town of properties listed
  const properties = await page.locator(`[type="LARGE_CARD"] + [font-size="0.875rem"]`).allTextContents(); 
  console.log(properties)
  const propertiesList = properties.map((e) => e.split(", ")[0]);
  
  // Assert Properties shown are within Boundary list
  for (let property of propertiesList){
    console.log(property)
    expect(boundaryList.includes(property)).toBeTruthy(); 
  }
});