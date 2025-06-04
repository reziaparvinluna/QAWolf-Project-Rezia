const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_427_property_details_listed_expanded_details_map_view", async () => {
 // Step 1. HGSE-427 - Property Details Listed Expanded Details Map View
  //--------------------------------
  // Arrange:
  //--------------------------------
  //--------------------------------------Step 1------------------------------------
  //--------------------------------------------------------------------------------
  // LOGIN-HGCOM-3050
  // Logged successfully.
  const {page,context} = await logInHomegeniusUser()
  
  /** Click the 'Find a Home' link in the navigation menu */
  await page.getByRole("link", { name: "Find a Home", exact: true }).click();
  await page.waitForTimeout(5000);
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  //--------------------------------------Step 2------------------------------------
  //--------------------------------------------------------------------------------
  // Search a property on Basic Search Bar as per requirement
  // Application will re-direct the user to search result page, where it should display a search result property cards.
  
  // Fill in two letters
  await page
    .getByPlaceholder("Address, city, neighborhood,")
    .first()
    .fill('Ne');
  
  // Allow time for drop down results to load
  await page.waitForTimeout(5_000);
  
  // Click on New York
  await page.locator(
    `ul li:has-text("New York")`
  ).first().click({ delay: 5000 })
  
  // Click on Search
  await page.getByRole(`button`, { name: `Search` }).first().click({delay: 5000});
  
  //--------------------------------------Step 3------------------------------------
  //--------------------------------------------------------------------------------
  // Users click anywhere on search result property cards
  // Then application should launch a new tab, and within that tab, a property detail page should appear.
  const nth = '7'
  
  // Grab the information on the property for later assertion
  const address = await page.locator(
    `[data-testid="undecorate"]:has-text("$") >> nth=${nth} >> [type="LARGE_CARD"] >> nth=0`
  ).innerText({timeout: 60_000});
  const price = await page.locator(`[data-testid="undecorate"]:has-text("$") >> nth=${nth} >> div:text("$")`).innerText();
  const priceNum = Number(price.replace(/[$,]/g, ''));
  const priceAssert = priceNum > 1000000 ? 
    `${Math.round(((priceNum / 1000000) * 10)) / 10}M` :
    `${Math.round((priceNum / 1000) * 10) / 10}K`;
  
  // Click on the First property listed
  await page.locator(
    `[data-testid="undecorate"]:has-text("$") >> nth=${nth}`
  ).click()
  
  // Wait for page to load
  await expect(page.getByText(`Active`, { exact: true }).first()).toBeVisible();
  
  // Grab the address for assert
  const addressAssert = (await page.locator(`div:has(:text("Active")):visible + div + div:has-text(", NY")`).first().innerText()).split("\n\n");
  
  // Close the helper modal
  await expect(async () => {
    await page.getByRole(`button`, { name: `close` }).click();
  }).toPass({timeout: 10_000})
  
  //--------------------------------------Step 4------------------------------------
  //--------------------------------------------------------------------------------
  // Verify when user selects Map from the Property Details page, then open the expanded 
  // Property Details modal in takeover mode in the same window
  // Reference the Figma UI designs: https://www.figma.com/file/BTuuIcM9QjxaVQYvfRKQ7V/homegenius-Designs?node-id=1930%3A93091
  // UI must match exactly to the Figma designs
  // https://www.figma.com/file/BTuuIcM9QjxaVQYvfRKQ7V/homegenius-Designs?node-id=2083%3A70522
  // When selects Map from the property details page, then it would open the expanded
  // Property Details modal in takeover mode in the same window after that.
  
  // Grab the url for later assertion
  const propertyDetailUrl = page.url();
  
  // Click on Map View
  await page.getByRole(`button`, { name: `map Map View` }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert Map view is now visible
  await expect(page.locator(`[id="map-tab-pane"]:visible`)).toBeVisible();
  
  // Assert we are still at the same url
  expect(page.url()).toBe(propertyDetailUrl);
  
  //--------------------------------------Step 5------------------------------------
  //--------------------------------------------------------------------------------
  // Verify MAP tab is automatically selecting or not
  // Map tab should be automatically select
  
  // Assert Map tab is automatically selected
  await expect(page.locator(
    `[id="map-tab"] span:text("MAP")`
  )).toHaveCSS('color', 'rgb(31, 31, 255)')
  
  
 // Step 2. Click on other Tabs and verify
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  
  
  //--------------------------------
  // Act:
  //--------------------------------
  //--------------------------------------Step 6------------------------------------
  //--------------------------------------------------------------------------------
  // Verify ability to select the other options in the header row and navigate away from the map pagea
  // User should be able to select other option in the header row other than Map tab
  
  // Click on Street View tab
  await page.getByRole(`tab`, { name: `STREET VIEW` }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert Street View is now displaying
  await expect(page.locator(`[id="streetView-tab-pane"]:visible`)).toBeVisible()
  
  // Assert map view is now not displaying
  await expect(page.locator(`[id="map-tab-pane"]:visible`)).not.toBeVisible();
  
  // Click on Photos tab
  await page.getByRole(`tab`, { name: `PHOTOS` }).click();
  
  // Assert photo view is now displaying
  await expect(page.locator(`[id="photos-tab-pane"]:visible`)).toBeVisible();
  
  // Assert Street View is now not displaying
  await expect(page.locator(`[id="streetView-tab-pane"]:visible`)).not.toBeVisible()
  
  // Assert map view is now not displaying
  await expect(page.locator(`[id="map-tab-pane"]:visible`)).not.toBeVisible();
  
  
 // Step 3. Verify Pin on map view
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Click Map Tab
  await page.getByRole(`tab`, { name: `MAP` }).click();
  
  //--------------------------------
  // Act:
  //--------------------------------
  //--------------------------------------Step 7------------------------------------
  //--------------------------------------------------------------------------------
  // Verify display a map view centered on the location of the subject property
  // User should see the location display at center on a map view.
  
  // Click on the center of the page
  await page.mouse.click(640, 410);
  
  //--------------------------------
  // Assert:
  //--------------------------------
  console.log(addressAssert[0]);
  // Assert Mini card shows
  await expect(page.locator(`div:text("${price}"):visible`)).toBeVisible();
  await expect(
    page
      .getByLabel("MAP", { exact: true })
      .locator(`div:text("${addressAssert[0]}"):visible`),
  ).toBeVisible()
  
  await expect(
    page
      .getByLabel("MAP", { exact: true })
      .locator(`div:text("${addressAssert[1]}"):visible`),
  ).toBeVisible();
  
  //--------------------------------------Step 8------------------------------------
  //--------------------------------------------------------------------------------
  // Verify a visual marker for that property must be displayed
  // Note:- As per figma design
  // https://www.figma.com/file/BTuuIcM9QjxaVQYvfRKQ7V/homegenius-Designs?node-id=1036%3A40715)
  // It should be display as per figma design
  
  // Assert pin
  // Slice the address after the word "Avenue" to match the pin title
  const pinAddress = addressAssert[0];
  
  const pinAddressArray = pinAddress.split(" ");
  
  let found = false;
  let updatedPinAddress = "";
  
  for (let i = pinAddressArray.length - 1; i > 0; i--) {
    const truncatedPinAddress = pinAddressArray.slice(0, i).join(" ");
    console.log({ truncatedPinAddress });
  
    try {
      // Assert the pin has the correct address
      await expect(page.locator(`[title*="${truncatedPinAddress}"]`)).toBeVisible(
        { timeout: 10_000 },
      );
      found = true;
      updatedPinAddress = truncatedPinAddress;
    } catch (e) {
      console.error(e);
    }
  
    if (found) break;
  }
  
  if (!found) {
    throw new Error(`We did not find the pin address above`);
  }
  
  //--------------------------------------Step 9------------------------------------
  //--------------------------------------------------------------------------------
  // Verify marker will display the price of the property
  // It should display the price of property on marker
  
  // Assert pin has price
  await expect(
    page.locator(`[class="custom-marker-label"]:has-text("${priceAssert}")`),
  ).toBeVisible();
  
 // Step 4. Click on satellite view and verify
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  
  // Helper to compare screenshots - allow for a 1% difference in pixels
  function compareScreenshots(buffer1, buffer2) {
    try {
      const img1 = PNG.sync.read(buffer1);
      const img2 = PNG.sync.read(buffer2);
      
      const { width, height } = img1;
      if (width !== img2.width || height !== img2.height) {
        return false;
      }
  
      let differingPixels = 0;
      const totalPixels = width * height;
      const allowedDifference = Math.floor(totalPixels * 0.01); // 1% difference
  
      const data1 = img1.data;
      const data2 = img2.data;
      const len = data1.length;
  
      for (let i = 0; i < len; i += 4) {
        if (
          data1[i] !== data2[i] ||
          data1[i + 1] !== data2[i + 1] ||
          data1[i + 2] !== data2[i + 2] ||
          data1[i + 3] !== data2[i + 3]
        ) {
          differingPixels++;
          if (differingPixels > allowedDifference) {
            return false;
          }
        }
      }
  
      return true;
    } catch (error) {
      console.error('Error comparing screenshots:', error);
      return false;
    }
  }
  
  //--------------------------------------Step 11-----------------------------------
  //--------------------------------------------------------------------------------
  // Verify user is able to switch to and from satellite view
  // Switching between street view and satellite view, as well as vice versa, should 
  // be possible for the users
  
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Grab the screenshot of the current map view
  await page.waitForTimeout(5000);
  const defaultMapView = await page.locator('[id="map-tab-pane"]:visible').screenshot();
  const img1 = PNG.sync.read(defaultMapView)
  
  // Click on Satellite button
  await page.getByLabel(`Show satellite imagery`).click();
  
  // Grab the screenshot of the satellite view
  await page.waitForTimeout(5000);
  const satelliteView = await page.locator('[id="map-tab-pane"]:visible').screenshot();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert it's now in satellite view
  const sameMapView = compareScreenshots(defaultMapView, satelliteView);
  expect(sameMapView).toBeFalsy();
  
  
 // Step 5. Click on Zoom in/out and verify
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Click back to map view
  await page.getByLabel(`Show street map`).click();
  
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  //--------------------------------------Step 12-----------------------------------
  //--------------------------------------------------------------------------------
  // Verify user is able to zoom in and out
  // On map It should display Plus
  //  and Minus  arrows
  
  //--------------------------------------Step 13-----------------------------------
  //--------------------------------------------------------------------------------
  // Verify when user selecting the Plus  arrow it will zoom in on the map
  // When user select Plus  arrow it should zoom in on the Map
  
  // Click on Zoom In +
  await page.waitForTimeout(5000);
  await page.getByRole(`button`, { name: `Zoom in` }).click();
  
  // Grab the screenshot of the zoom-in map view
  await page.waitForTimeout(5000);
  const zoomInView = await page.locator('[id="map-tab-pane"]:visible').screenshot();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert we are zoom in
  const zoomInMapView = compareScreenshots(defaultMapView, zoomInView);
  expect(zoomInMapView).toBeFalsy();
  
  //--------------------------------------Step 14-----------------------------------
  //--------------------------------------------------------------------------------
  // Verify when user selecting the Minus  arrow it will zoom out on the map
  // When user select Minus
  //  arrow it should zoom out on the Map
  
  // Click on Zoom Out -
  await page.waitForTimeout(5000);
  await page.getByRole(`button`, { name: `Zoom out` }).click();
  
  // Grab the screenshot of the zoom-in map view
  await page.waitForTimeout(5000);
  const zoomOutView = await page.locator('[id="map-tab-pane"]:visible').screenshot();
  
  // Assert we are zoom out
  const zoomOutMapView = compareScreenshots(defaultMapView, zoomOutView);
  const zoomInOutMapView = compareScreenshots(zoomInView, zoomOutView);
  expect(zoomOutMapView).toBeFalsy();
  expect(zoomInOutMapView).toBeFalsy();
  
 // Step 6. Click and drag map
  //--------------------------------
  // Arrange:
  //--------------------------------
  //--------------------------------------Step 15-----------------------------------
  //--------------------------------------------------------------------------------
  // Verify user is able to grab and drag the map
  // User should be able to grab and drag the map
  
  
  //--------------------------------
  // Act:
  //--------------------------------
  await page.waitForTimeout(10000);
  // Click on the center of the page and drag to Satellite button
  await page.locator(
    `[title*="${updatedPinAddress}"]`
  ).dragTo(page.locator(`[aria-label="Show satellite imagery"]`))
  await page.locator(
    `[title*="${updatedPinAddress}"]`
  ).dragTo(page.locator(`[aria-label="Show satellite imagery"]`))
  await page.locator(
    `[title*="${updatedPinAddress}"]`
  ).dragTo(page.locator(`[aria-label="Show satellite imagery"]`))
  
  // Grab the screenshot of the dragged map view
  await page.waitForTimeout(5000);
  const draggedView = await page.locator('[id="map-tab-pane"]:visible').screenshot();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert the map was dragged
  const draggedMapView = compareScreenshots(draggedView, zoomOutView);
  expect(draggedMapView).toBeFalsy();
  
 // Step 7. Click on a property that does not display gp prices/value on map view
  //--------------------------------
  // Arrange:
  //--------------------------------
  const newAddress = `456 Mountain Vista Way, Kalispell, MT 59901`
  
  // Close out of map view
  await page.getByRole(`button`, { name: `close` }).click();
  
  // Click on Search
  await page.getByRole(`button`, { name: `arrow_back Search` }).click();
  
  // Clear the New York Pill
  await page.getByRole(`list`).getByRole(`button`, { name: `close` }).click();
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  //--------------------------------------Step 10-----------------------------------
  //--------------------------------------------------------------------------------
  // Old requirement:
  // Verify Conditional display note: When a SHADD field for the listing = N/False, 
  // the visual marker cannot be displayed. Instead, the map will appear without the 
  // visual marker.
  // When we have a property where we're not showing an address (SHADD=False) then 
  // in the expanded details map view, there won't be a property marker.
  
  // New Requirement:
  // Search for an address that does not display gp prices/value on map view
  // Example: 456 Mountain Vista Way, Kalispell, MT 59901
  // On property details page for that property gp value should be displayed
  // Validate that the price for the cards appearing on "Similar Sold Properties"
  // are displayed ("$--") when no price is available.
  // On Map view, validate that in the price section, it is displayed: "$--" on
  // visual marker and on mini card
  
  // Fill in the address
  await page.waitForTimeout(5000)
  await page.getByPlaceholder(`Address, city, neighborhood,`).fill(newAddress);
  await page.getByRole(`button`, { name: `456 Mountain Vista Way` }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert gp value is displaying
  await expect(page.locator(
    `div:has(span:text("geniusprice")) + div div h6:has-text("$")`
  )).not.toContain(`--`)
  
  // Scroll to Similar Sold Properties section
  await page.getByRole(`heading`, { name: `Similar Sold Properties` }).scrollIntoViewIfNeeded();
  
  // Assert the properies on Similar Sold Properties section are showing $-- for price
  await expect(page.locator(
    `div:has(h6:text("Similar Sold Properties")) + div [data-testid="undecorate"]:has-text("$--")`
  )).toHaveCount(9);
  
  // Click on Map View
  await page.getByRole(`button`, { name: `map Map View` }).click();
  
  // Assert pin has $--
  await expect(page.locator(
    `[class="custom-marker-label"]:has-text("$--")`
  )).toBeVisible()
  
  // Click on the center of the page
  await page.mouse.click(640, 410)
  
  // Assert Mini card has $-- price
  await expect(page.locator(
    `div:text("$--") + div:text("456 Mountain Vista Way")`
  )).toBeVisible();
  
  
});