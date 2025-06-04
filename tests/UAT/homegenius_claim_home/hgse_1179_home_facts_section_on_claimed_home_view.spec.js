import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_1179_home_facts_section_on_claimed_home_view", async () => {
 // Step 1. HGSE-1179: Home Facts Section on Claimed Home View
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  // This is an on market property
  const searchAddress = {
    searchAddress: "1309 Cesarina St, Harker Heights, TX 76548",
    searchAddr2: "1309 Cesarina St",
    addressLineOne: "1309 Cesarina St",
    addressLineTwo: "Harker Heights, TX 76548",
    propertyType: "Single Family",
    bed: "3",
    bath: "2",
    halfBath: "0",
    sqft: "1711",
    gar: "2",
    yr: "2022",
    lot: '7,884'
  }
  const mlsNumber = "ML81984988"
  
  // Step 1 
  // login to application 
  // and search for an address.
  
  const { page, context } = await logInHomegeniusUser();
  
  // Clean Up
  try {
    await unclaimProperty(page, searchAddress)
  } catch (error) {
    console.log(error)
  }
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Step 2 
  // Claim a home Do not edit home facts or photos
  // Select the "Skip and Close" button
  // Note property DNA and geniusprice in claim home modal
  // Edge Case Scenario: 
  // 14054 Sw 260th St Apt 105, Homestead, FL 33032
  
  // Claim a property
  // SOft assert A message will come up saying the home is claimed
  // await claimProperty(page, searchAddress);
  
  // Click on Claim a Home
  await page.getByRole(`link`, { name: `Claim a Home` }).click();
  
  // Fill in Address
  await page
    .locator(`[placeholder="Enter an Address"]`)
    .first()
    .fill(searchAddress.searchAddr2);
  
  await expect(async () => {
    // Click the search bar until we see the results
    await page
      .locator(`[placeholder="Enter an Address"]`)
      .first()
      .click({ timeout: 10_000 });
  
    // Expect the search results to appear
    await expect(page.locator(`ul li:visible`).first()).toBeVisible({
      timeout: 10_000,
    });
  }).toPass({ timeout: 60_000 });
  
  // Click on Claim
  await page
    .locator(`li:has-text("${searchAddress.addressLineOne}")`)
    .first()
    .click();
  
  // Click on I own this home
  await page.locator(`#Own`).click();
  
  // Click on Yes, add it to my profile
  await page.locator(`button:text("Yes, add it to my profile")`).click();
  
  // Close the helper modal
  await page.waitForSelector(`button:text("Skip and Close")`);
  await page
    .locator(`main button span span:text("close"):visible`)
    .first()
    .click({ delay: 5000 });
  
  // Verify Property type reflects last update from recent MLS data.
  // Assert MLS Data
  expect(await page.locator(`[id="propertyType"]`).inputValue()).toBe(searchAddress.propertyType)
  expect(await page.locator(`[id="bedroom"] input`).inputValue()).toBe(searchAddress.bed)
  expect(await page.locator(`[id="yearBuilt"]`).inputValue()).toBe(searchAddress.yr)
  expect(await page.locator(`[id="sqft"]`).inputValue()).toBe(searchAddress.sqft)
  expect(await page.locator(`[id="garage"] input`).inputValue()).toBe(searchAddress.gar)
  expect(await page.locator(`[id="fullBath"] input`).inputValue()).toBe(searchAddress.bath)
  expect(await page.locator(`[id="halfBath"] input`).inputValue()).toBe(searchAddress.halfBath)
  
  // Grab the geniusprice for later assertion
  const gPrice = await page.locator(`form h6`).first().innerText();
  
  // Click on Skip and Close
  await page.locator(`button:text("Skip and Close")`).click();
  
  // Soft Assert property was successfully claimed
  await expect(
    page.locator(`p:text("This property has been successfully claimed.")`),
  ).toBeVisible();
  await expect(
    page.locator(
      `p:text("Now that it is claimed, you can come back and make edits later.")`,
    ),
  ).toBeVisible();
  
  // Step 3 
  // Select "Done" or "X"
  // Close the modal
  await page.locator(`button:text("Close")`).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Step 4 
  // Verify Property Information section 
  // A photo of the property if one is available on the left
  // if no photo if available the avatar for no-home photo will display or a Google street view
  // To the right of the photo will be properyt address should be same as on Public View page
  
  // Assert photo of property
  await expect(page.locator(
    `[id="CLAIMED_VIEW_PRICES"] img`
  )).toHaveScreenshot(`1309_Cesarina`, {maxDiffPixelRatio: 0.01})
  
  // Assert Address
  await expect(page.locator(
    `div:text("${searchAddress.searchAddr2}") + p:text("${searchAddress.addressLineTwo}")`
  )).toBeVisible();
  
  // Titles for geniusprice and mygeniusprice will display on next line
  await expect(page.locator(`#CLAIMED_VIEW_PRICES`).getByText(`geniusprice®`, { exact: true })).toBeVisible();
  await expect(page.getByText(`mygeniusprice®`, { exact: true })).toBeVisible();
  
  // Verify geniusprice is the same  as on step 2 
  await expect(page.locator(
    `h6:text-is("${gPrice}"):visible >> nth=0`
  )).toBeVisible();
  
  // Price per sqft for geniusprice will be displayed under gp price
  const perSqft = Math.round(Number(gPrice.replace(/[$,]/g, "")) / Number(searchAddress.sqft))
  await expect(page.locator(
    `p:text("$${perSqft.toLocaleString()}/sqft"):visible`
  )).toBeVisible();
  
  // mygeniusprice will display 
  //  as "- -"
  // "Confirm home facts to calculate mygeniusprice" will be displayed under mygeniusprice
  await expect(page.locator(
    `div:has(h6:text("$--")) + p:text("Confirm home facts") + p:text("to calculate mygeniusprice")`
  )).toBeVisible();
  
  
  // Step 5 
  // verify Home Facts section  
  // There should be  white container labeled: Your Home Facts
  // title appears in the upper left corner
  // There will be a space separating the next section
  await expect(page.locator(
    `#home-facts-widget:has-text("Home Facts")`
  )).toBeVisible();
  
  // On the left there will be a gray box with following message :
  // "Are your home facts up to date?"
  // Beneath the question:
  // 'Yes, they are'
  // "No, make changes" buttons
  await expect(page.locator(
    `div:has(p:text("Are your home facts up to date?")) div a:text("No, make changes") + button:text("Yes, they are")`
  )).toBeVisible();
  
  
  // Step 6 
  // Verify property dna  
  // The next section will have two rows of icons and underneath that the DNA of the property:
  // values for DNA should be same as were on Claim process 
  
  // first row will have the following icons: home, bed, bath, garage,
  // home - type of home
  await expect(page.locator(
    `span:has(span:text("home")) + p:text("${searchAddress.propertyType}")`
  )).toBeVisible()
  
  // bed - number of bedrooms
  await expect(page.locator(
    `span:has(span:text("king_bed")) + p:text("${searchAddress.bed}")`
  )).toBeVisible()
  
  // bath - total number of bathrooms
  await expect(page.locator(
    `span:has(span:text("shower")) + p:text("${searchAddress.bath}")`
  )).toBeVisible()
  
  // garage - number of garages
  await expect(page.locator(
    `span:has(span:text("warehouse")) + p:text("${searchAddress.gar}")`
  )).toBeVisible()
  
  // second row will have the following icons: 
  // triangle - sqft of home
  await expect(page.locator(
    `span:has(span:text("square_foot")) + p:text("${Number(searchAddress.sqft).toLocaleString()} sqft")`
  )).toBeVisible()
  
  // fence - Lot sqft
  await expect(page.locator(
    `span:has(span:text("fence")) + p:text("${searchAddress.lot} sqft Lot")`
  )).toBeVisible()
  
  // calendar - Build date
  await expect(page.locator(
    `span:has(span:text("calendar_today")) + p:text("Built In ${searchAddress.yr}")`
  )).toBeVisible()
  
  
  
 // Step 2. Edit Home Facts 
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Step 7 
  // click No, make changes button 
  await page.getByText(`No, make changes`).click();
  
  // Edit property modal will open
  await expect(page.locator(
    `form:has-text("${searchAddress.searchAddr2}")`
  )).toBeVisible()
  
  // Step 8 
  // Close the modal through X or skip and close 
  await page.getByRole(`button`, { name: `close`, exact: true }).click();
  
  // Click on Close
  await page.getByRole(`button`, { name: `Close`, exact: true }).click();
  
  // Verify the gray box with message  is still displayed in Home Facts
  await expect(page.locator(
    `div:has(p:text("Are your home facts up to date?")) div a:text("No, make changes") + button:text("Yes, they are")`
  )).toBeVisible();
  
  // Step 9 
  // Click Yes, they are button
  await page.getByRole(`button`, { name: `Yes, they are` }).click();
  
  // Yes, they are - if selected:
  // nothing will occur
  // box will disappear
  
  await expect(page.locator(
    `div:has(p:text("Are your home facts up to date?")) div a:text("No, make changes") + button:text("Yes, they are")`
  )).not.toBeVisible();
  
  // Step 10 
  // hover and click on Edit button 
  // On hover button should go to hover state  - DESKTOP ONLY
  
  // Hover over Edit
  await page.locator(`button:has-text("Edit")`).hover();
  await expect(page.locator(
    `button:has-text("Edit") span span`
  )).toHaveCSS('color', 'rgb(76, 76, 255)')
  
  // On click Edit Home facts or images message will pop up 
  await page.locator(`button:has-text("Edit")`).click();
  
  // Step 11 
  // Hover and click on Continue button 
  // on hover the button should have hover state - DESKTOP ONLY 
  // on click Edit property data modal will open
  
  // Hover over Continue button
  await page.getByRole(`button`, { name: `Continue` }).hover();
  await expect(page.locator(
    `button:has-text("Continue")`
  )).toHaveCSS('background', 'rgb(76, 76, 255) none repeat scroll 0% 0% / auto padding-box border-box')
  
  // Click on Continue button
  await page.getByRole(`button`, { name: `Continue` }).click();
  
  // Step 12 
  // edit All property data (note  new values), click Calculate and exit modal
  // verify Home facts data matches values you entered when edited
  
  // Change property type to Condo
  await page.locator(`#propertyType`).click();
  await page.getByRole(`button`, { name: `Condo` }).click();
  
  // Decrease a bedroom
  await page.locator(`#bedroom button:text("-")`).click();
  
  // Change year Built
  await page.locator(`#yearBuilt`).fill(`2021`);
  
  // Change Sqft
  await page.locator(`#sqft`).fill(`6000`);
  
  // Decrease a Garage
  await page.locator(`#garage button:text("-")`).click();
  
  // Change lot size to acres
  await page.locator(`#select-input-caret-span-lotSizeType`).getByText(`expand_more`).click();
  await page.getByRole(`button`, { name: `Acres` }).click();
  
  // Change Lot Size
  await page.locator(`#lotSizeInAcres`).fill(`0.30`);
  
  // Decrease a Full Bath
  await page.locator(`#fullBath button:text("-")`).click();
  
  // Increase a 1/2 Bath
  await page.locator(`#halfBath button:text("+")`).click();
  
  // Click on Calculate
  await page.getByRole(`button`, { name: `Calculate` }).click();
  
  // Wait for calculation to complete
  await expect(page.locator(`.loader`).first()).toBeVisible();
  await expect(page.locator(`.loader`).first()).not.toBeVisible({ timeout: 60 * 1000 });
  
  // Grab the mygeniusprice
  const myGPrice = await page.locator(`form #editsDNAInnerContent + div h6`).innerText();
  console.log('G Price',myGPrice)
  // Click X to close modal
  await page.getByRole(`button`, { name: `close`, exact: true }).click();
  
  // Click on Close
  await page.getByRole(`button`, { name: `Close`, exact: true }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Step 13 
  // Verify mygeniusprice on the Property Information section 
  // verify 
  // mygeniusprice is displayed 
  // Price per sqft under mygp value
  // updated:[MM/DD/YYYY]
  
  // Assert mygeniusprice
  await expect(page.locator(
    `h6:text("${myGPrice}")`
  ).first()).toBeVisible();
  
  // Assert price/sqft for mygeniusprice
  const myPerSqft = Math.round(Number(myGPrice.replace(/[$,]/g, "")) / 6000)
  await expect(page.locator(
    `p:text("$${myPerSqft.toLocaleString()}/sqft"):visible`
  )).toBeVisible();
  
  // Assert Updated Date
  const today = dateFns.format(new Date(), "MM/dd/yyy");
  await expect(page.locator(
    `p:text("${today}"):visible`
  )).toBeVisible();
  
});