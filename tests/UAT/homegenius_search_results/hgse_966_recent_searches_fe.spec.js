import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_966_recent_searches_fe", async () => {
 // Step 1. HGSE-966: Recent Searches - FE
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  // Step 1 
  // Login 
  const {page, context} = await logInHomegeniusUser()
  
  // Click on Find a Home
  await page.getByRole(`link`, { name: `Find a Home`, exact: true }).click();
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Step 6
  // In the search bar when nothing is entered, we should not see the Recent Searches
  
  // Click on Search Input Field
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).first().click();
  
  // // Assert there are no Recent Searches appearing
  // await expect(page.getByRole(`listbox`).getByText(`Recent Searches`)).not.toBeVisible();
  
  // Step 7 
  // When Schools are selected from the search criteria, they are should displayed in Recent Searches
  // Fill in a School
  await page.locator(`
    [placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]
  `).first().pressSequentially(`Pinckney Community High School`, { delay: 100 });
  
  // Click on Search
  await page.getByRole(`button`, { name: `Search` }).first().click({delay: 3000});
  
  // Click on Find a Home
  await page.getByRole(`link`, { name: `Find a Home`, exact: true }).click();
  
  // Click on Search Input Field
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).first().click({delay: 3000});
  
  // Assert school is now appearing in recent searches
  await expect(page.getByRole(`button`, { name: `Pinckney Community High` })).toBeVisible();
  
  // Step 8 
  // The leftmost character is slightly cut off
  // The leftmost character is Not cut off
  // Clarification: In Step-8 We should validate that if you are searching with Ellicott City, MD 
  // then you need to see the "E" character properly and it should not cut off.
  
  // Reload page
  await page.reload();
  
  // Fill a City State
  await page.locator(`
    [placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]
  `).first().pressSequentially(`Ellicott City, MD`, { delay: 100 });
  
  // Click on Search
  await page.getByRole(`button`, { name: `Search` }).first().click({delay: 3000});
  
  // Click on Find a Home
  await page.getByRole(`link`, { name: `Find a Home`, exact: true }).click({delay: 15000});
  
  // Click on Search Input Field
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).first().click({delay: 3000});
  
  // Assert City is showing and left most character is not cuff off
  await expect(page.locator(
    `p:text("Ellicott City,"):visible`
  )).toHaveScreenshot('ellicottCity', {maxDiffPixelRatio: 0.01})
  
  // Step 9 
  // There are duplicates if a user searches the same search criteria multiple times. 
  // Ideally, we would filter the display to show only one of the same value 
  // (see Westminster, Co below)
  // There are NO  duplicates if a user searches the same search criteria multiple times. 
  // > displaying to show only one of the same value 
  // Clarification: In Step-9 We need to check there are NO duplicates if a user 
  // searches the same search criteria multiple times. We search for Denver, CO three 
  // times then it should be displaying to show only one (Denver, CO) in the search 
  // suggestion.
  
  // Perform another search of Ellicott City, MD
  // Fill a City State
  await page.locator(`
    [placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]
  `).first().fill(`Ellicott City, MD`);
  
  // Click on Search
  await page.getByRole(`button`, { name: `Search` }).first().click({delay: 3000});
  
  // Click on Find a Home
  await page.getByRole(`link`, { name: `Find a Home`, exact: true }).click({delay: 15000});
  
  await expect(async () => {
    // Click on Search Input Field
    await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).first().click({delay: 3000});
  
    // Assert Ellicott City, MD is showing up as 1 recent searches
    await expect(page.locator(
      `p:text("Ellicott City, MD"):visible`
    )).toHaveCount(1, {timeout: 5000});
  }).toPass({timeout: 30_000})
  
  // Step 10 
  // State abbreviation should be capitalized (CO vs. Co); for each of City, Zip code, school, neighborhood, count
  
  // Assert State abbreviation
  await expect(page.getByRole(`button`, { name: `Ellicott City, MD`, exact: true })).toBeVisible();
  
  // Step 12 
  // Neighborhoods for Recent Searches displays an Underscore between City & and Zipcode
  // Clarification: In Step-12 If we are searching for neighborhoods Lynwood, then in 
  // the Recent Searches it should NOT display any Underscore (_) between City & a Zip 
  // code.
  
  // Fill in a Neighborhood
  await page
    .getByPlaceholder("Address, city, neighborhood,")
    .first()
    .pressSequentially('48169', { delay: 100 });
  
  // Click on 48169
  await page.getByRole(`button`, { name: `48169 MI`, exact: true }).click({delay: 5000});
  
  // Click on Search
  await page.getByRole(`button`, { name: `Search` }).first().click({delay: 3000});
  
  // Click on Find a Home
  await page.getByRole(`link`, { name: `Find a Home`, exact: true }).click({delay: 15000});
  await page.waitForTimeout(5000);
  
  // Click on Search Input Field
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).first().click({delay: 3000});
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert there are no underscores
  await expect(page.locator(
    `p:text("_")`
  )).not.toBeVisible();
  
  // Assert there are no underscores between City and ZIP
  await expect(page.locator(
    `li p:text("48169, MI"):visible`
  )).toBeVisible();
  
  // Step 2 
  // When a user clicks into the search bar, if the user has performed prior searches on the application, 
  // 'Home page' & 'Home Search page', we will show the user's 3 most recent searches as drop-down recommendations.
  
  // Assert there are 3 most recent searches
  await expect(page.locator(
    `div:has-text("Recent Searches") ~ ul li:visible`
  )).toHaveCount(3);
  
  // Step 3 
  // The recent search drop-down recommendations will be located below the 'Current Location' recommendation
  await expect(page.locator(
    `div:has-text("Current Location") + div:has-text("Recent Searches"):visible`
  )).toBeVisible();
  
  // // Step 11 
  // When a new search is performed, that search is being placed at the bottom of the Recent Search list; 
  // the most recent search should go to the top of the Recent Search list.
  
  // Assert Most recent search is on top
  await expect(page.locator(
    `li:has-text("48169, MI") + li:has-text("Ellicott City, MD") + li:has-text("Pinckney Community High School, Pinckney MI"):visible`
  )).toBeVisible()
  
  // Step 13
  // Navigate and select> Recent searches address, that  taking user to Co-branded property details page
  // Navigate and select> Recent searches address, that  Should not take the user to Co-branded property 
  // details page instead should take the user to hgre non co brand site
  // Clarification: In Step-13 If you are searching for any address then from Recent 
  // Searches on regular site (https://qa-portal.homegeniusrealestate.com/home-search/Neighborhood/Lynwood) 
  // if you are clicking on the that address then it should not take the user to 
  // Co-branded(headertest1/finlocker) property details page.
  
  // Click on Ellicott City, MD
  await page.locator(`li:has-text("Ellicott City, MD"):visible`).click();
  
  // Assert url is not Co-branded
  expect(page.url()).toContain(process.env.URL_HOMEGENIUS);
  
 // Step 2. Logged Out Recent Searches 
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Step 4 
  // Steps above  This needs to apply to users who are not logged in as well
  
  
  // Step 1 
  // Login 
  const {page: newPage} = await goToHomegenius()
  
  // Click on Find a Home
  await newPage.getByRole(`link`, { name: `Find a Home`, exact: true }).click();
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Step 6
  // In the search bar when nothing is entered, we should not see the Recent Searches
  
  // Click on Search Input Field
  await newPage.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).first().click();
  
  // Assert there are no Recent Searches appearing
  await expect(newPage.getByRole(`listbox`).getByText(`Recent Searches`)).not.toBeVisible();
  
  // Step 7 
  // When Schools are selected from the search criteria, they are should displayed in Recent Searches
  // Fill in a School
  await newPage.locator(`
    [placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]
  `).first().fill(`Pinckney Community High School`);
  
  // Click on Search
  await newPage.getByRole(`button`, { name: `Search` }).first().click({delay: 3000});
  
  // Click on Find a Home
  await newPage.getByRole(`link`, { name: `Find a Home`, exact: true }).click();
  
  // Click on Search Input Field
  await newPage.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).first().click({delay: 3000});
  
  // Assert school is now appearing in recent searches
  await expect(newPage.getByRole(`button`, { name: `Pinckney Community High` })).toBeVisible();
  
  // Step 8 
  // The leftmost character is slightly cut off
  // The leftmost character is Not cut off
  // Clarification: In Step-8 We should validate that if you are searching with Ellicott City, MD 
  // then you need to see the "E" character properly and it should not cut off.
  
  // Reload newPage
  await newPage.reload();
  
  // Fill a City State
  await newPage.locator(`
    [placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]
  `).first().fill(`Ellicott City, MD`);
  
  // Click on Search
  await newPage.getByRole(`button`, { name: `Search` }).first().click({delay: 3000});
  
  // Click on Find a Home
  await newPage.getByRole(`link`, { name: `Find a Home`, exact: true }).click({delay: 15000});
  
  // Click on Search Input Field
  await newPage.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).first().click({delay: 3000});
  
  
  // Step 9 
  // There are duplicates if a user searches the same search criteria multiple times. 
  // Ideally, we would filter the display to show only one of the same value 
  // (see Westminster, Co below)
  // There are NO  duplicates if a user searches the same search criteria multiple times. 
  // > displaying to show only one of the same value 
  // Clarification: In Step-9 We need to check there are NO duplicates if a user 
  // searches the same search criteria multiple times. We search for Denver, CO three 
  // times then it should be displaying to show only one (Denver, CO) in the search 
  // suggestion.
  
  // Perform another search of Ellicott City, MD
  // Fill a City State
  await newPage.locator(`
    [placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]
  `).first().fill(`Ellicott City, MD`);
  
  // Click on Search
  await newPage.getByRole(`button`, { name: `Search` }).first().click({delay: 3000});
  
  // Click on Find a Home
  await newPage.getByRole(`link`, { name: `Find a Home`, exact: true }).click({delay: 15000});
  await page.waitForTimeout(5000)
  
  // Step 10 
  // // Assert Search bubble is visible
  // await expect(newPage.getByRole(`button`, { name: `Ellicott City,`, exact: true })).toBeVisible();
  
  // Step 12 
  // Neighborhoods for Recent Searches displays an Underscore between City & and Zipcode
  // Clarification: In Step-12 If we are searching for neighborhoods Lynwood, then in 
  // the Recent Searches it should NOT display any Underscore (_) between City & a Zip 
  // code.
  
  // Fill in a Neighborhood
  await newPage
    .getByPlaceholder("Address, city, neighborhood,")
    .first()
    .fill('48169');
  
  // Click on 48169
  await newPage.getByRole(`button`, { name: `48169 MI`, exact: true }).click({delay: 3000});
  
  // Click on Search
  await newPage.getByRole(`button`, { name: `Search` }).first().click({delay: 3000});
  
  // Click on Find a Home
  await newPage.getByRole(`link`, { name: `Find a Home`, exact: true }).click({delay: 15000});
  
  // Click on Search Input Field
  await newPage.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).first().click({delay: 3000});
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert there are no underscores
  await expect(newPage.locator(
    `p:text("_")`
  )).not.toBeVisible();
  
  
  // Step 2 
  // When a user clicks into the search bar, if the user has performed prior searches on the application, 
  // 'Home newPage' & 'Home Search newPage', we will show the user's 3 most recent searches as drop-down recommendations.
  
  // Expected behavior 
  // // Assert there are 3 most recent searches
  // await expect(newPage.locator(
  //   `div:has-text("Recent Searche") ~ ul li:visible`
  // )).toHaveCount(3);
  
  //  Expected behavior to not have recent searches below "Current Location" now
  // Step 3 
  // The recent search drop-down recommendations will be located below the 'Current Location' recommendation
  await expect(newPage.locator(
    `div:has-text("Current Location") + div:has-text("Recent Searches"):visible`
  )).not.toBeVisible();
  
  // // Step 11 
  // When a new search is performed, that search is being placed at the bottom of the Recent Search list; 
  // the most recent search should go to the top of the Recent Search list.
  
  // Assert Most recent search is not on list
  await expect(newPage.locator(
    `li:has-text("48169, MI") + li:has-text("Ellicott City, MD") + li:has-text("Pinckney Community High School, Pinckney MI"):visible`
  )).not.toBeVisible()
  
  // Step 13
  // Navigate and select> Recent searches address, that  taking user to Co-branded property details newPage
  // Navigate and select> Recent searches address, that  Should not take the user to Co-branded property 
  // details newPage instead should take the user to hgre non co brand site
  // Clarification: In Step-13 If you are searching for any address then from Recent 
  // Searches on regular site (https://qa-portal.homegeniusrealestate.com/home-search/Neighborhood/Lynwood) 
  // if you are clicking on the that address then it should not take the user to 
  // Co-branded(headertest1/finlocker) property details newPage.
  
  // // Click on Ellicott City, MD
  // await newPage.locator(`li:has-text("Ellicott City, MD"):visible`).click();
  
  // // Assert url is not Co-branded
  // expect(newPage.url()).toContain(process.env.URL_HOMEGENIUS);
  
  
});