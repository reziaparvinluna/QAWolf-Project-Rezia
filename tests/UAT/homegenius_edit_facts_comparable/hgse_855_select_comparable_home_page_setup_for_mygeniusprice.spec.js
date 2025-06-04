import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_855_select_comparable_home_page_setup_for_mygeniusprice", async () => {
 // Step 1. HGSE-855 - Select Comparable Home Page Setup for mygeniusprice
  // Constants and Helpers
  
  const addresses = [
    {
      searchAddress: "5247 D Street, Philadelphia, PA 19120",
      addressLineOne: "5247 D St",
      // Condo w/ genuisprice
    },
  ];
  
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  // Step 1 - go to URL
  
  // Login to Homeogenius UAT-Portal
  const { page, context } = await logInHomegeniusUser();
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  const currentAddress = addresses[0];
  const searchAddress = currentAddress.searchAddress;
  const addressLineOne = currentAddress.addressLineOne;
  
  // console.log(`${i+1}. Currently checking this addresss: ${searchAddress}`)
  
  try {
    // Unclaim the property if necessary
    await unclaimProperty(page, currentAddress);
  } catch {
    await page.goBack();
  }
  
  // Step 3 - search an address with the following cateogries - Claim Home
  
  // Click on Claim a Home
  await page
    .locator(`[data-testid="undecorate"] #nav-hyperlink-Claim\\ a\\ Home`)
    .click();
  
  // Fill in Address
  await page
    .locator(`[placeholder="Enter an Address"]`)
    .first()
    .pressSequentially(searchAddress);
  
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
  
  // 4- Steps - Claim home and calculate
  
  // Click on Claim
  await page.locator(`li:has-text("${addressLineOne}")`).first().click();
  
  // Click on I own this home
  await page.locator(`#Own`).click();
  
  // Click on Yes, add it to my profile
  await page.locator(`button:text("Yes, add it to my profile")`).click();
  
  // Close the helper modal
  // await page.waitForSelector(`button:text("Skip and Close")`);
  await page
    .locator(`main button span span:text("close"):visible`)
    .first()
    .click({ delay: 5000 });
  
  // Click Next
  await page
    .locator(`button:has-text("Next"):visible`)
    .first()
    .click({ delay: 5000 });
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // Go to the comparable page
  // 5- Check the comparable page design
  // Pause for the UI
  await page.waitForTimeout(10000);
  await page.waitForSelector(`.claim-home-comparables-container`);
  
  // Assert that the property title is visible, to have black lettering, and to be to the top right
  const titleLocator = page.locator(
    `.claim-home-comparables-container p:has-text("${searchAddress}")`,
  );
  await expect(titleLocator).toBeVisible();
  await expect(titleLocator).toHaveCSS("color", "rgb(51, 51, 51)"); // black font
  await expect(
    page.locator(
      `.claim-home-comparables-container p:has-text("${searchAddress}"):above(p:has-text("Select Comparable Homes (Optional)"))`,
    ),
  ).toBeVisible(); // top left
  
  // Assert that the mygenius price is visible, and is also to the right of the title, and above the "Select Comparable Homes" area
  await expect(
    page.locator(`.claim-home-comparables-container :text("geniusprice")`),
  ).toHaveCount(2);
  await expect(
    page.locator(`p:has-text("${searchAddress}"):right-of(:text("geniusprice"))`),
  ).toBeVisible();
  await expect(
    page
      .locator(
        `:text("geniusprice"):above(p:has-text("Select Comparable Homes (Optional)"))`,
      )
      .first(),
  ).toBeVisible();
  
  // Assert that the "X" is in the upper right hand corner
  await expect(
    page.locator(
      `div:has(p:has-text("geniusprice")) + button:has-text("close") `,
    ),
  ).toBeVisible();
  
  // Assert that there is a border betwene title and the comparable section
  await expect(
    page.locator(
      `.claim-home-comparables-container div:has(>div>p:has-text("${searchAddress}"))`,
    ),
  ).toHaveCSS(
    "border-color",
    `rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgb(184, 184, 184)`,
  );
  
  // Assert Title says "Select 3 minimum homes"
  await expect(
    page.locator(`p:has-text("Select Comparable Homes (Optional)")`),
  ).toBeVisible();
  
  // Main area divided into two sections - map to the left, grid section to the right
  await expect(
    page.locator(`#selected-map-container:left-of(#GRID-tab-pane)`),
  ).toBeVisible();
  
  // 6- There will be two views to show comparables - grid and list view
  // Ensure Grid and List view options
  await expect(
    page.locator(
      `button[role="tab"][data-name="GRID-tab"][aria-selected="true"]`,
    ),
  ).toBeVisible();
  await expect(
    page.locator(
      `button[role="tab"][data-name="LIST-tab"][aria-selected="false"]`,
    ),
  ).toBeVisible();
  
  // 7- Check the grid view design
  // Default view (grid view)
  await expect(page.locator(`#GRID-tab-pane`)).toBeVisible();
  await expect(
    page.locator(
      `button[role="tab"][data-name="GRID-tab"][aria-selected="true"]`,
    ),
  ).toBeVisible();
  
  // Cards for comparables
  const count = await page.locator(`.SelectablePropCard`).count();
  expect(count).toBeGreaterThan(0);
  
  // user can select 3/5 comparables
  // 8- Option to select the calculate button will happen when at least 3 comparables are selected
  
  for (let i = 0; i < count && i < 3; i++) {
    await page.locator(`.SelectablePropCard`).nth(i).click();
    console.log(i);
    await page.waitForTimeout(1000);
  
    const selectedCountString = await page
      .locator(`p:has-text("/5 Selected")`)
      .innerText();
    const selectedCount = parseInt(selectedCountString.split(`/5`)[0]);
  
    // Assert that the count increases correctly
    expect(selectedCount).toBe(i + 1);
  
    // Assert that the button is "Disabled if less than 3 homes"
    if (i + 1 < 3) {
      await expect(
        page.locator(`button[disabled]:Has-text("Calculate")`),
      ).toBeVisible();
    }
  }
  
  // Assert that the calculate button is enabled now
  await expect(
    page.locator(`button:not([disabled]):Has-text("Calculate")`),
  ).toBeVisible();
  
  // Grab the genius price before
  const geniusPriceLocator = page.locator(`.claim-home-comparables-container h6`);
  const firstGeniusPrice = await geniusPriceLocator.first().innerText();
  
  // Click "Calculate"
  await page.locator(`button:Has-text("Calculate")`).click();
  
  // Pause for the Calculation
  await page.waitForTimeout(5000);
  await page.waitForSelector(`button[disabled]:Has-text("Calculate")`);
  
  const updatedGeniusPrice = await geniusPriceLocator.last().innerText();
  
  // Assert that the genius price is different now and the calculate button is disabled, and 3/5 selected still visible
  await expect(
    page.locator(`button[disabled]:Has-text("Calculate")`),
  ).toBeVisible();
  expect(updatedGeniusPrice).not.toEqual(firstGeniusPrice);
  await expect(page.locator(`p:has-text("3/5 Selected")`)).toBeVisible();
  
  // 9 - Verify the link in middle says "Have questions? Visit our FAQ"
  await expect(
    page.locator(
      `button:has-text("Back") + div:has(a:has-text("Have questions? Visit our FAQs")) + button:has-text("Done")`,
    ),
  ).toBeVisible();
  
  // verify link takes user to the "Questions for Comparable section"
  const [page2] = await Promise.all([
    page.waitForEvent("popup"),
    page.locator(`a:has-text("Have questions? Visit our FAQs")`).click(),
  ]);
  
  await expect(
    page2.locator(`p:has-text("Questions about Comparable Properties")`),
  ).toBeVisible();
  
  await page2.close();
  
  // 10 - Click "Done", should bring to next page, and save info
  await page.locator(`button:Has-text("Done")`).click();
  
  // Assert that the updated genius price is in the new modal
  await expect(
    page.locator(`h2:visible:has-text("${updatedGeniusPrice}")`),
  ).toBeVisible();
  
  // Click "Continue to property view"
  await page.locator(`button:Has-text("Continue to property view")`).click();
  
  // Assert that there are the 3 comparable homes
  await expect(page.locator(`.card-media-container`)).toHaveCount(3);
  
  // Assert that the myGeniusPrice is displayed
  await expect(
    page.locator(`h6:Has-text("${updatedGeniusPrice}")`),
  ).toBeVisible();
  
  if (!firstGeniusPrice.includes(`--`)) {
    // Assert that the geniusPrice is displayed
    await expect(
      page.locator(`h6:Has-text("${firstGeniusPrice}")`),
    ).toBeVisible();
  } else {
    await expect(page.locator(`p:Has-text("Insufficient Data")`)).toBeVisible();
  }
  
  // Click unclaim
  await page
    .locator(`[aria-label="Claimed property options menu button"]`)
    .click();
  await page.locator(`:text("Release Claim")`).click();
  await page.locator(`button:has-text("Yes, release property")`).click();
  
 // Step 2. Property with no Comparables Assertion
  // Constants and Helpers
  
  const addresses1 = [
    {
      searchAddress: "4123 4th Street Detroit, MI 48201",
      addressLineOne: "4123 4 th Street",
      headerAddress: "4123 4th Street"
      // DNA but no comps available to generate GP
    },
  ]
  
  
  //--------------------------------
  // Arrange:
  //--------------------------------
  // N/A
  
  const currentAddress1 = addresses1[0];
  const searchAddress1 = currentAddress1.searchAddress;
  const addressLineOne1 = currentAddress1.addressLineOne;
  const headerAddress1 = currentAddress1.headerAddress;
  
  // console.log(`${i+1}. Currently checking this addresss: ${searchAddress}`)
  
  try{
    // Unclaim the property if necessary
    await unclaimProperty(page,currentAddress1)
  } catch{
    await page.goBack()
  }
  
  // Step 3 - search an address with the following cateogries - Claim Home
  
  // Click on Claim a Home
  await page.locator(`[data-testid="undecorate"] #nav-hyperlink-Claim\\ a\\ Home`).click();
  
  // Fill in Address
  await page.locator(`[placeholder="Enter an Address"]`).first().fill(searchAddress1);
  
  await expect(async () => {
    // Click the search bar until we see the results
    await page.locator(`[placeholder="Enter an Address"]`).first().click({timeout:10_000});
  
    // Expect the search results to appear
    await expect(page.locator(`ul li:visible`).first()).toBeVisible({timeout:10_000})
  
  }).toPass({timeout:60_000})
  
  // Click into the property
  await page.getByRole(`option`, { name: `4 Th St Detroit, MI 48201` }).locator(`div`).first().click();
  
  
  // Close pop-up on the bottom left if needed
  try{
    await page.getByRole(`button`, { name: `close` }).click({timeout: 3_000});
  }catch {
    console.log("No pop up");
  }
  
  // 4- Steps - Claim home and calculate
  
  // Assert the page has text matching addressLineOne1
  await expect(page.getByText(`${headerAddress1}`).first()).toBeVisible();
  
  // Click the 'Claim Home' button next to the property
  await page.getByRole(`option`, { name: addressLineOne1 }).getByRole(`paragraph`).nth(2).click();
  
  // Click on I own this home
  await page.locator(`#Own`).click();
  
  // Click the 'Yes, add it to my profile' button
  await page.getByRole(`button`, { name: `Yes, add it to my profile` }).click();
  
  // Close the helper modal
  // Assert the 'Skip and Close' button is visible
  await expect(page.getByRole(`button`, { name: `Skip and Close` })).toBeVisible();
  
  
  // Click the 'Next' button
  await page.getByRole(`button`, { name: `Next` }).click();
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert the page has text 'Select Comparable Homes'
  await expect(page.getByText(`Select Comparable Homes (`)).toBeVisible();
  
  // Grab the mygenius price 
  const geniusPrice = await page.locator(`.CalculateSectionContainer h6`).innerText();
  
  // Click the 'Done' button
  await page.getByRole(`button`, { name: `Done` }).click();
  
  // Click "Continue to property view"
  await page.locator(`button:Has-text("Continue to property view")`).click()
  
  // Assert that the myGeniusPrice is displayed
  await expect(page.locator(`h6:Has-text("${geniusPrice}")`)).toHaveCount(2)
  
  // Click unclaim
  await page.locator(`[aria-label="Claimed property options menu button"]`).click();
  await page.locator(`:text("Release Claim")`).click();
  await page.locator(`button:has-text("Yes, release property")`).click();
  
 // Step 3. Property insufficient data missing DNA
  // Constants and Helpers
  
  // const addresses2 = [
  //    {
  //     searchAddress: "202 Erie St, 202 Cambridge, MA 02139",
  //     addressLineOne: "202 Erie St 202"
  //     // Off market, insufficient data missing DNA
  //   },
  // ]
  
  // IF YOU CAN SEARCH FOR '4123 4th STREET DETROIT and not see a space between
  // 4 and th ("4th") please contact Anthony or koalas
  // WIP
  throw new Error("Addresses with 'th' get extra spacing");
  
  const addresses2 = [
    {
      searchAddress: "4123 4 th Street Detroit, MI 48201",
      addressLineOne: "4123 4 th Street",
      clickAddress: "4 Th St Detroit, MI 48201"
      // DNA but no comps available to generate GP
    },
  ]
  
  // const addresses2 = [
  //   {
  //     searchAddress: "202 Henriksen St, Alberta, MN 56207",
  //     // searchAddress: "202 Erie St, 202 Cambridge, MA 02139",
  //     addressLineOne: "202 Henriksen St",
  //     // addressLineOne: "202 Erie St 202"
  //     // Off market, insufficient data missing DNA
  //   },
  // ];
  
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  const currentAddress2 = addresses2[0];
  const searchAddress2 = currentAddress2.searchAddress;
  const addressLineOne2 = currentAddress2.addressLineOne;
  const clickAddress2 = currentAddress2.clickAddress;
  
  // console.log(`${i+1}. Currently checking this addresss: ${searchAddress}`)
  
  try {
    // Unclaim the property if necessary
    await unclaimProperty(page, currentAddress2);
  } catch {
    console.log("Property not claimed");
    // await page.goBack()
  }
  // ^^^^ NOTE --- THIS PROPERTY WAS PROVIDED BY RADIAN AND IS NOT CLAIMABLE
  // Step 3 - search an address with the following cateogries - Claim Home
  
  // Click on Claim a Home
  await page
    .locator(`[data-testid="undecorate"] #nav-hyperlink-Claim\\ a\\ Home`)
    .click();
  
  // Fill in Address
  await page
    .locator(`[placeholder="Enter an Address"]`)
    .first()
    .fill(searchAddress2);
  
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
  
  // Click the address text related to clickAddress2
  await page.getByRole(`option`).getByText(clickAddress2).click();
  
  
  // 4- Steps - Claim home and calculate
  await page.locator(`:text("Claim this home")`).first().click();
  
  // Click on I own this home
  await page.locator(`#Own`).click();
  
  // Click the 'Yes, add it to my profile' button
  await page.getByRole(`button`, { name: `Yes, add it to my profile` }).click();
  
  // Close the helper modal
  await page.waitForSelector(`button:text("Skip and Close")`);
  await page
    .locator(`main button span span:text("close"):visible`)
    .first()
    .click({ delay: 5000 });
    // Click the 'close' button
  await page.getByRole(`button`, { name: `close`, exact: true }).click();
  
  // // Click the 'Skip and Close' button
  // await page.getByRole(`button`, { name: `Skip and Close` }).click();
  // // // If we see a "Please fix the following errors" modal here
  await expect(
    page.locator(`:text("Please fix the following errors")`),
  ).toBeVisible();
  
  await page.locator(`:text("+")`).nth(0).click();
  await page.locator(`:text("+")`).nth(1).click();
  await page.locator(`:text("+")`).nth(2).click();
  await page.locator(`:text("+")`).nth(3).click();
  await page.locator(`:text("+")`).nth(4).click();
  await page.locator(`:text("+")`).nth(5).click();
  await page.locator(`label:has-text("Sqft") + div input`).fill(`2000`);
  await page.locator(`label:has-text("Year built") + div input`).fill(`2000`);
  
  // Click Next
  await page
    .locator(`button:has-text("Next"):visible`)
    .first()
    .click({ delay: 5000 });
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // Assert that the toast message is visible
  await expect(
    page.locator(
      `:text("There are no comparable homes available to select for this property.")`,
    ),
  ).toBeVisible();
  
  // Grab the mygenius price
  const myGeniusPrice2 = await page
    .locator(`div:has(>p:has-text("mygeniusprice")) + h2`)
    .innerText();
  const geniusPrice2 = await page
    .locator(`div:has(>p:text-is("geniusprice")) + h2`)
    .innerText();
  
  // Click "Continue to property view"
  await page.locator(`button:Has-text("Continue to property view")`).click();
  
  // Assert that the myGeniusPrice and genius price is displayed
  await expect(page.locator(`h6:Has-text("${myGeniusPrice2}")`)).toBeVisible();
  await expect(page.locator(`p:Has-text("${geniusPrice2}")`)).toBeVisible();
  
  // Click unclaim
  await page
    .locator(`[aria-label="Claimed property options menu button"]`)
    .click();
  await page.locator(`:text("Release Claim")`).click();
  await page.locator(`button:has-text("Yes, release property")`).click();
  
});