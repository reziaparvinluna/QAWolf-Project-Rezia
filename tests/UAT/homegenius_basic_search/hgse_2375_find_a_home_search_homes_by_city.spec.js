import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_2375_find_a_home_search_homes_by_city", async () => {
 // Step 1. HGSE-2375: [Find-a-Home] Search Homes by City
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const url = `https://uat-portal.homegeniusrealestate.com/find-a-home`;
  
  const cities = [
    'Chicago',
    'Denver',
    'Las Vegas',
    'Los Angeles',
    'Miami',
    'Nashville',
    'New Orleans',
    'Philadelphia',
    'Salt Lake City',
    'San Diego'
  ]
  
  // Launch and Grant Location permission
  const { context } = await launch();
  await context.grantPermissions(['geolocation'], { origin: url });
  const page = await context.newPage();
  // Step 1 
  // Navigate to Find a Home Page and scroll down to Homes by City Section
  // https://uat-portal.homegeniusrealestate.com/find-a-home
  await page.goto(url)
  
  // Scroll into Homes by City
  await page.getByRole(`heading`, { name: `Homes by City` }).scrollIntoViewIfNeeded();
  
  // Soft assert 
  // Verify that 10 City photos are displayed with the City and State label 
  // in each one. 
  for (let i = 0; i < cities.length; i++){
    await expect(page.locator(
      `[id="find-a-home-homes-by-city"] [data-testid="undecorate"] a [alt="${cities[i]}"]`
    )).toBeVisible();
  }
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Step 2 
  // Click on any image from 'Home by City'
  
  try{
    await page.getByRole(`button`, { name: `Accept Cookies` }).click({timeout: 3_000});
  } catch {
    console.log("No pop up")
  }
  
  // Click on Chicago
  await page.locator(`
    [id="find-a-home-homes-by-city"] [data-testid="undecorate"] a [alt="${cities[0]}"]
  `).click()
  
  // Close the helper modal
  await page.getByRole(`button`, { name: `close` }).nth(1).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Step 2/3 
  // Verify user is routed to Home-Search Screen and
  // the city and state pill is populated in search bar.
  
  // Assert page url
  expect(page.url()).toContain(`/home-search/`);
  
  // Assert Chicago, IL search pill
  await expect(page.locator(`[title="Chicago, IL"]`)).toBeVisible();
  
  // Search is applied and user will be able to view the
  // map with the city and state outlined.
  
  // Assert Chicago Boundary map
  await expect(async () => {
    await expect(page.locator(`[id="deckgl-wrapper"]`)).toHaveScreenshot(
      'Chicago_regular', {maxDiffPixelRatio: 0.1}
    )
  }).toPass({timeout: 30_000})
  
  // All the listings for the city and state will be available.
  // Assert all listings are showing Chicago, IL
  // Grab all the City/Town of properties listed
  const properties = await page.locator(`[type="LARGE_CARD"] + [font-size="0.875rem"]`).allTextContents(); 
  console.log(properties)
  const propertiesList = properties.map((e) => e.split(", ")[0]);
  
  // Assert listings are in city selected
  for (let property of propertiesList){
    console.log(property)
    expect(property).toContain('Chicago'); 
  }
  
  // Close page
  await page.close();
 // Step 2. Extra Small  [Find-a-Home] Search Homes by City
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants Small Android or iPhone SE.
  const extraSmall = {viewport: { width: 360, height: 640 }}
  
  // Step 3 
  // Right click inspect on the homegeniusrealestate.com page and choose --> Toggle Device tool bar and validate page in all resolutions as defined in the FIGMA design Extra Small, Small, Medium, Large, Extra LArge, 1x Large.
   
  // Open with extra small page
  const { context: context2 } = await launch(extraSmall);
  await context2.grantPermissions(['geolocation'], { origin: url });
  const page2 = await context2.newPage();
  
  await page2.goto(url)
  
  //--------------------------------
  // Act:
  //--------------------------------
  try{
    await page2.getByRole(`button`, { name: `Accept Cookies` }).click();
  } catch {
    console.log("No pop up")
  }
  
  // Click on any image from 'Home by City'
  // Click on Chicago
  await page2.locator(`
    [id="find-a-home-homes-by-city"] [data-testid="undecorate"] a [alt="${cities[0]}"]
  `).click()
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Verify user is routed to Home-Search Screen and
  // the city and state pill is populated in search bar.
  
  // Assert page url
  await expect(() => {
    expect(page2.url()).toContain(`/home-search/`);
  }).toPass({timeout: 30_000})
  
  // Click the search icon
  await page2.getByRole(`button`, { name: `search`, exact: true }).click();
  
  // Assert Chicago, IL search pill
  await expect(page2.locator(`[title="Chicago, IL"]`)).toBeVisible();
  
  // Search is applied and user will be able to view the
  // map with the city and state outlined.
  // Note -- Don't see a map when on Extra Small view
  
  // All the listings for the city and state will be available.
  // Verify that all steps should pass , no cutoff and should display all the content.
  
  // Grab all the City/Town of properties listed
  const properties2 = await page2.locator(`[type="LARGE_CARD"] + [font-size="0.875rem"]`).allTextContents(); 
  console.log(properties2)
  const propertiesList2 = properties2.map((e) => e.split(", ")[0]);
  
  // Assert listings are in city selected
  for (let property of propertiesList2){
    console.log(property)
    expect(property).toContain('Chicago'); 
  }
  
  // Close page
  await page2.close();
 // Step 3. Small  [Find-a-Home] Search Homes by City
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants iPhone X or other smartphones in landscape mode.
  const small = {viewport: { width: 576, height: 812 }}
  
  // Step 3 
  // Right click inspect on the homegeniusrealestate.com page and choose --> Toggle Device tool bar and validate page in all resolutions as defined in the FIGMA design Extra Small, Small, Medium, Large, Extra LArge, 1x Large.
   
  // Open with small page
  const { context: context3 } = await launch(small);
  await context3.grantPermissions(['geolocation'], { origin: url });
  const page3 = await context3.newPage();
  
  await page3.goto(url)
  
  try{
    await page3.getByRole(`button`, { name: `Accept Cookies` }).click();
  } catch {
    console.log("No pop up")
  }
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Click on any image from 'Home by City'
  // Click on Chicago
  await page3.locator(`
    [id="find-a-home-homes-by-city"] [data-testid="undecorate"] a [alt="${cities[0]}"]
  `).click()
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Verify user is routed to Home-Search Screen and
  // the city and state pill is populated in search bar.
  // Assert page url
  await expect(() => {
    expect(page3.url()).toContain(`/home-search/`);
  }).toPass({timeout: 30_000})
  
  // Assert Chicago, IL search pill
  await expect(page3.locator(`[title="Chicago, IL"]`)).toBeVisible();
  
  
  // Search is applied and user will be able to view the
  // map with the city and state outlined.
  await expect(async () => {
    await expect(page3.locator(`[id="deckgl-wrapper"]`)).toHaveScreenshot(
      `${process.env.QAWOLF_ENVIRONMENT_NAME}Chicago_small`, {maxDiffPixelRatio: 0.1}
    )
  }).toPass({timeout: 30_000})
  
  // All the listings for the city and state will be available.
  // Verify that all steps should pass , no cutoff and should display all the content.
  // Grab all the City/Town of properties listed
  const properties3 = await page3.locator(`[type="LARGE_CARD"] + [font-size="0.875rem"]`).allTextContents(); 
  console.log(properties3)
  const propertiesList3 = properties3.map((e) => e.split(", ")[0]);
  
  // Assert listings are in city selected
  for (let property of propertiesList3){
    console.log(property)
    expect(property).toContain('Chicago'); 
  }
  
  // Close page
  await page3.close();
 // Step 4. Medium  [Find-a-Home] Search Homes by City
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants iPad Mini or standard iPad in portrait mode
  const medium = {viewport: { width: 768, height: 1024 }}
  
  // Step 3 
  // Right click inspect on the homegeniusrealestate.com page and choose --> Toggle Device tool bar and validate page in all resolutions as defined in the FIGMA design Extra Small, Small, Medium, Large, Extra LArge, 1x Large.
   // Open with medium page
  const { context: context4 } = await launch(medium);
  await context4.grantPermissions(['geolocation'], { origin: url });
  const page4 = await context4.newPage();
  
  await page4.goto(url)
  
  //--------------------------------
  // Act:
  //--------------------------------
  try{
    await page4.getByRole(`button`, { name: `Accept Cookies` }).click();
  } catch {
    console.log("No pop up")
  }
  
  // Click on any image from 'Home by City'
  // Click on Chicago
  await page4.locator(`
    [id="find-a-home-homes-by-city"] [data-testid="undecorate"] a [alt="${cities[0]}"]
  `).click()
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Verify user is routed to Home-Search Screen and
  // the city and state pill is populated in search bar.
  // Assert page url
  await expect(() => {
    expect(page4.url()).toContain(`/home-search/`);
  }).toPass({timeout: 30_000})
  
  // Assert Chicago, IL search pill
  await expect(page4.locator(`[title="Chicago, IL"]`)).toBeVisible();
  
  // Search is applied and user will be able to view the
  // map with the city and state outlined.
  await expect(async () => {
    await expect(page4.locator(`[id="deckgl-wrapper"]`)).toHaveScreenshot(
      `${process.env.QAWOLF_ENVIRONMENT_NAME}Chicago_medium`, {maxDiffPixelRatio: 0.1}
    )
  }).toPass({timeout: 30_000})
  
  // All the listings for the city and state will be available.
  // Verify that all steps should pass , no cutoff and should display all the content.
  // Grab all the City/Town of properties listed
  const properties4 = await page4.locator(`[type="LARGE_CARD"] + [font-size="0.875rem"]`).allTextContents(); 
  console.log(properties4)
  const propertiesList4 = properties4.map((e) => e.split(", ")[0]);
  
  // Assert listings are in city selected
  for (let property of propertiesList4){
    console.log(property)
    expect(property).toContain('Chicago'); 
  }
  
  // Close page
  await page4.close();
 // Step 5. Large  [Find-a-Home] Search Homes by City
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants iPad in landscape mode, or small desktop screens.
  const large = {viewport: { width: 992, height: 1366 }}
  
  // Step 3 
  // Right click inspect on the homegeniusrealestate.com page and choose --> Toggle Device tool bar and validate page in all resolutions as defined in the FIGMA design Extra Small, Small, Medium, Large, Extra LArge, 1x Large.
  // Open with large page
  const { context: context5 } = await launch(large);
  await context5.grantPermissions(['geolocation'], { origin: url });
  const page5 = await context5.newPage();
  
  await page5.goto(url)
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  try{
    await page5.getByRole(`button`, { name: `Accept Cookies` }).click();
  } catch {
    console.log("No pop up")
  }
  
  
  // Click on any image from 'Home by City'
  // Click on Chicago
  await page5.locator(`
    [id="find-a-home-homes-by-city"] [data-testid="undecorate"] a [alt="${cities[0]}"]
  `).click()
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Verify user is routed to Home-Search Screen and
  // the city and state pill is populated in search bar.
  // Assert page url
  await expect(() => {
    expect(page5.url()).toContain(`/home-search/`);
  }).toPass({timeout: 30_000})
  
  // Assert Chicago, IL search pill
  await expect(page5.locator(`[title="Chicago, IL"]`)).toBeVisible();
  
  // Search is applied and user will be able to view the
  // map with the city and state outlined.
  await expect(async () => {
    await expect(page5.locator(`[id="deckgl-wrapper"]`)).toHaveScreenshot(
      `${process.env.QAWOLF_ENVIRONMENT_NAME}Chicago_large`, {maxDiffPixelRatio: 0.1}
    )
  }).toPass({timeout: 30_000})
  
  // All the listings for the city and state will be available.
  // Verify that all steps should pass , no cutoff and should display all the content.
  // Grab all the City/Town of properties listed
  const properties5 = await page5.locator(`[type="LARGE_CARD"] + [font-size="0.875rem"]`).allTextContents(); 
  console.log(properties5)
  const propertiesList5 = properties5.map((e) => e.split(", ")[0]);
  
  // Assert listings are in city selected
  for (let property of propertiesList5){
    console.log(property)
    expect(property).toContain('Chicago'); 
  }
  
  // Close page
  await page5.close();
 // Step 6. Extra Large  [Find-a-Home] Search Homes by City
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants MacBook Pro or large desktop monitor.
  const extraLarge = {viewport: { width: 1200, height: 1920 }}
  
  // Step 3 
  // Right click inspect on the homegeniusrealestate.com page and choose --> Toggle Device tool bar and validate page in all resolutions as defined in the FIGMA design Extra Small, Small, Medium, Large, Extra LArge, 1x Large.
  // Click on any image from 'Home by City'
  
  // Open with extra large page
  const { context: context6 } = await launch(extraLarge);
  await context6.grantPermissions(['geolocation'], { origin: url });
  const page6 = await context6.newPage();
  
  await page6.goto(url)
  
  //--------------------------------
  // Act:
  //--------------------------------
  try{
    await page6.getByRole(`button`, { name: `Accept Cookies` }).click();
  } catch {
    console.log("No pop up")
  }
  
  // Click on any image from 'Home by City'
  // Click on Chicago
  await page6.locator(`
    [id="find-a-home-homes-by-city"] [data-testid="undecorate"] a [alt="${cities[0]}"]
  `).click()
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Verify user is routed to Home-Search Screen and
  // the city and state pill is populated in search bar.
  // Assert page url
  await expect(() => {
    expect(page6.url()).toContain(`/home-search/`);
  }).toPass({timeout: 30_000})
  
  // Assert Chicago, IL search pill
  await expect(page6.locator(`[title="Chicago, IL"]`)).toBeVisible();
  
  // Search is applied and user will be able to view the
  // map with the city and state outlined.
  await expect(async () => {
    await expect(page6.locator(`[id="deckgl-wrapper"]`)).toHaveScreenshot(
      `${process.env.QAWOLF_ENVIRONMENT_NAME}Chicago_extraLarge`, {maxDiffPixelRatio: 0.1}
    )
  }).toPass({timeout: 30_000})
  
  // All the listings for the city and state will be available.
  // Verify that all steps should pass , no cutoff and should display all the content.
  // Grab all the City/Town of properties listed
  const properties6 = await page6.locator(`[type="LARGE_CARD"] + [font-size="0.875rem"]`).allTextContents(); 
  console.log(properties6)
  const propertiesList6 = properties6.map((e) => e.split(", ")[0]);
  
  // Assert listings are in city selected
  for (let property of propertiesList6){
    console.log(property)
    expect(property).toContain('Chicago'); 
  }
  
  // Close page
  await page6.close();
 // Step 7. 1x Large  [Find-a-Home] Search Homes by City
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants Large 4K monitors or high-resolution desktop displays.
  const oneXLarge = {viewport: { width: 1400, height: 2560 }}
  
  // Step 3 
  // Right click inspect on the homegeniusrealestate.com page and choose --> Toggle Device tool bar and validate page in all resolutions as defined in the FIGMA design Extra Small, Small, Medium, Large, Extra LArge, 1x Large.
  // Click on any image from 'Home by City'
  
  // Open with extra large page
  const { context: context7 } = await launch(oneXLarge);
  await context7.grantPermissions(['geolocation'], { origin: url });
  const page7 = await context7.newPage();
  
  await page7.goto(url)
  
  try{
    await page7.getByRole(`button`, { name: `Accept Cookies` }).click();
  } catch {
    console.log("No pop up")
  }
  
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Click on any image from 'Home by City'
  // Click on Chicago
  await page7.locator(`
    [id="find-a-home-homes-by-city"] [data-testid="undecorate"] a [alt="${cities[0]}"]
  `).click()
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Verify user is routed to Home-Search Screen and
  // the city and state pill is populated in search bar.
  // Assert page url
  await expect(() => {
    expect(page7.url()).toContain(`/home-search/`);
  }).toPass({timeout: 30_000})
  
  // Assert Chicago, IL search pill
  await expect(page7.locator(`[title="Chicago, IL"]`)).toBeVisible();
  
  // Search is applied and user will be able to view the
  // map with the city and state outlined.
  await expect(async () => {
    await expect(page7.locator(`[id="deckgl-wrapper"]`)).toHaveScreenshot(
      `${process.env.QAWOLF_ENVIRONMENT_NAME}Chicago_1extraLarge`, {maxDiffPixelRatio: 0.01}
    )
  }).toPass({timeout: 30_000})
  
  // All the listings for the city and state will be available.
  // Verify that all steps should pass , no cutoff and should display all the content.
  // Grab all the City/Town of properties listed
  const properties7 = await page7.locator(`[type="LARGE_CARD"] + [font-size="0.875rem"]`).allTextContents(); 
  console.log(properties7)
  const propertiesList7 = properties7.map((e) => e.split(", ")[0]);
  
  // Assert listings are in city selected
  for (let property of propertiesList7){
    console.log(property)
    expect(property).toContain('Chicago'); 
  }
  
  // Close page
  await page7.close();
});