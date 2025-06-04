const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, unclaimProperty } = require("../../../lib/node_20_helpers");

test("hgse_1122_edit_facts_comparables_verify_hover_state_and_pin_state_on_list_grid_view_for_comparables", async () => {
 // Step 1. HGSE-1122 - [Edit Facts & Comparables] Verify Hover State and Pin State on Grid View for Comparables
  // Constants and Helpers
  
  const property = {
    searchAddress: "512 5TH ST Ashton, IA 51232",
    // addressLineOne: "512 5 TH ST",
    addressLineOne : "Ashton, IA 51232",
    city: "Ashton",
    state:"IA",
    zip:"51232"
  }
  
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  // Log in user
  const {page, context} = await logInHomegeniusUser()
  
  // Clean up if needed
  await unclaimProperty (page, property)
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  //---------------------------------- Step 1 --------------------------------------
  //--------------------------------------------------------------------------------
  
  // Click on Claim a Home
  await page.locator(`[data-testid="undecorate"] #nav-hyperlink-Claim\\ a\\ Home`).click();
  
  // Fill in Address
  await page.locator(`[placeholder="Enter an Address"]`).first().fill(property.searchAddress);
  
  await expect(async () => {
    // Click the search bar until we see the results
    await page.locator(`[placeholder="Enter an Address"]`).first().click({timeout:10_000});
  
    // Expect the search results to appear
    await expect(page.locator(`ul li:visible`).first()).toBeVisible({timeout:10_000})
  
  }).toPass({timeout:60_000})
  
  // Click on Claim
  await page.locator(`li:has-text("${property.addressLineOne}")`).first().click();
  
  // Close overlay
  await page.locator(`div:has(button:has-text("open_in_full")) button span.material-icons:has-text("close"):visible`).click()
  
  // Click on I own this home
  await page.locator(`#Own`).click();
  
  // Click on Yes, add it to my profile
  await page.locator(`button:text("Yes, add it to my profile")`).click(); 
  
  // Click "Next"
  await page.locator(`button:has-text("Next")`).click(); 
  
  // Pause for the UI so we grab the correct pin title
  await page.waitForTimeout(5000)
  
  // Grab the first pin
  const pinLocator = page.locator(`[aria-describedby][title]:visible`).nth(0)
  let iteration = 0;
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  //---------------------------------- Step 2 --------------------------------------
  //--------------------------------------------------------------------------------
  
  // Zoom in to the property until we can reliably click on it
  await expect(async ()=> {
    let pass = false;
    iteration++;
    console.log("Checking iteration:", iteration)
  
    try{
      await pinLocator.hover({force:true, timeout:5000})
  
      // Assert that the highlighted property shows a blue color on hover
      await expect(pinLocator).toHaveScreenshot ("hover-first.png", { 
            maxDiffPixelRatio: 0.15, timeout:5000})
  
      pass = true;
  
    } catch{
  
      await pinLocator.hover({force:true, timeout:5000})
      await page.mouse.wheel(0, -500);
    }
    
    if(!pass) {
      console.log("We're not passing")
      throw new Error("Not passing")
    }
    
  }).toPass({timeout:80_000})
  
  console.log("Checking iteration:", iteration)
  
  const title = await pinLocator.getAttribute('title');
  console.log(`Hey! This is the Title: ${title}`)
  
  await expect(async ()=> {
    // Hover over the pin
    await pinLocator.hover({force:true, timeout:5000})
  
    // Assert that the property card's "Select Home" input box has a blue border
    await expect(page.locator(`div.SelectablePropCard:has-text("${title}") input`)).toHaveCSS("border", "2px solid rgb(31, 31, 255)")
  }).toPass({timeout:120_000})
  
  //---------------------------------- Step 3 --------------------------------------
  //--------------------------------------------------------------------------------
  
  await expect(async ()=> {
    // Hover over the grid element
    await page.locator(`div.SelectablePropCard:has-text("${title}") input`).hover({force:true, timeout:5000})
  
    // Assert that hovering over the grid should make the map pin light up
    await expect(pinLocator).toHaveScreenshot ("hover-first.png", { 
          maxDiffPixelRatio: 0.15, timeout:5000})
  }).toPass({timeout:120_000})
  
        
  //---------------------------------- Step 4 --------------------------------------
  //--------------------------------------------------------------------------------
  
  // Click on the pin
  await pinLocator.click()
  
  // Get viewport dimensions
  const viewportSize = page.viewportSize();
  
  // Get the bounding box of the target element
  const targetElement = page.locator(`div.SelectablePropCard:has-text("${title}")`);
  const boundingBox = await targetElement.boundingBox();
  const isVisible = boundingBox && 
                    boundingBox.y >= 0 && 
                    boundingBox.y + boundingBox.height <= viewportSize.height && 
                    boundingBox.x >= 0 && 
                    boundingBox.x + boundingBox.width <= viewportSize.width;
  
  // Assert that the element is visible on the page - aka clicking on the map pin placed the card in a visible
  // location for the user. (The user does not need to scroll)
  expect(isVisible).toBe(true)
  
  //---------------------------------- Step 5 --------------------------------------
  //--------------------------------------------------------------------------------
  
  // Click the "Select home" for that property
  await page.locator(`div.SelectablePropCard:has-text("${title}") input`).click()
  
  // Zoom in to the property if need
  await expect(async ()=> {
  
    let pass = false;
    iteration++;
  
    try{
      await pinLocator.hover({force:true, timeout:5000})
  
      // Assert that the screenshot shows a checkmark now and is a different shade of blue
      await expect(pinLocator).toHaveScreenshot ("selected-pin.png", { 
            maxDiffPixelRatio: 0.15, timeout:5000})
  
      pass = true;
  
    } catch{
  
      await pinLocator.hover({force:true, timeout:5000})
      await page.mouse.wheel(0, -500);
    }
    
    if(!pass) {
      console.log("We're not passing")
      throw new Error("Not passing")
    }
  }).toPass({timeout:80_000})
  
  // Assert that the selected home now has a border around it 
  await expect(page.locator(`div.SelectablePropCard:has-text("${title}")`)).toHaveCSS("border", "2px solid rgb(31, 31, 255)")
  
 // Step 2. Verify Hover State and Pin State on List View Comparables
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  //---------------------------------- Step 6 --------------------------------------
  //--------------------------------------------------------------------------------
  
  // Click on listview 
  await page.locator(`#LIST-tab`).click();
  console.log(iteration)
  // Zoom out 
  for (let i=0; i<iteration;i++) {
     await page.locator(`[aria-label="Zoom out"]`).click()
  }
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Save the second pin locator
  const secondPinLocator = page.locator(`[aria-describedby][title]:not([title="${title}"]):visible`).nth(0)
  
  // Zoom in to the property until we can reliably click on it
  await expect(async ()=> {
    let pass = false;
    iteration++;
    console.log("Checking iteration:", iteration)
  
    try{
      await secondPinLocator.hover({force:true, timeout:5000})
  
      // Assert that the highlighted property shows a blue color on hover
      await expect(secondPinLocator).toHaveScreenshot ("hover-second.png", { 
            maxDiffPixelRatio: 0.1, timeout:5000})
  
      pass = true;
  
    } catch{
  
      await secondPinLocator.hover({force:true, timeout:5000})
      await page.mouse.wheel(0, -500);
    }
    
    if(!pass) {
      console.log("We're not passing")
      throw new Error("Not passing")
    }
    
  }).toPass({timeout:80_000})
  
  // Save the title
  const title2 = await secondPinLocator.getAttribute('title');
  const rowLocator = page.locator(`tr:has(input):has-text("${title2}")`)
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // Pause for the UI
  await page.waitForTimeout(5000)
  
  //---------------------------------- Step 7 --------------------------------------
  //--------------------------------------------------------------------------------
  
  await expect(async ()=> {
    // Hover over the property on the table
    await rowLocator.hover({force:true, timeout:5000})
  
    // Assert that the highlighted property shows a blue color on hover
    await expect(secondPinLocator).toHaveScreenshot ("hover-second.png", { 
          maxDiffPixelRatio: 0.1, timeout:5000})
  }).toPass({timeout:120_000})
  
  //---------------------------------- Step 8 --------------------------------------
  //--------------------------------------------------------------------------------
  
  
  await expect(async ()=> {
    // Hover over the pin on the map
    await secondPinLocator.hover({force:true, timeout:5000})
  
    // Assert that the the input shows a blue border
    await expect(rowLocator.locator(`input`)).toHaveCSS("border", "2px solid rgb(31, 31, 255)")
  
    // Assert that the background shows a gray color for the row
    await expect(rowLocator).toHaveCSS("background-color", "rgb(238, 240, 242)")
  
    // Get the bounding box of the target element
    const boundingBox = await rowLocator.boundingBox();
    const isVisible = boundingBox && 
                      boundingBox.y >= 0 && 
                      boundingBox.y + boundingBox.height <= viewportSize.height && 
                      boundingBox.x >= 0 && 
                      boundingBox.x + boundingBox.width <= viewportSize.width;
  
    // Assert that the element is visible on the page - aka clicking on the map pin placed the card in a visible
    // location for the user. (The user does not need to scroll)
    expect(isVisible).toBe(true)
  }).toPass({timeout:120_000})
  
  //---------------------------------- Step 9 --------------------------------------
  //--------------------------------------------------------------------------------
  
  // Click on pin on the map
  await secondPinLocator.click()
  
  // Get the bounding box of the target element
  const boundingBox2 = await rowLocator.boundingBox();
  const isVisible2 = boundingBox2 && 
                    boundingBox2.y >= 0 && 
                    boundingBox2.y + boundingBox2.height <= viewportSize.height && 
                    boundingBox2.x >= 0 && 
                    boundingBox2.x + boundingBox2.width <= viewportSize.width;
  
  // Assert that the element is visible on the page - aka clicking on the map pin placed the card in a visible
  // location for the user. (The user does not need to scroll)
  expect(isVisible2).toBe(true)
  
  //---------------------------------- Step 10 --------------------------------------
  //--------------------------------------------------------------------------------
  
  // Click the checkbox to select the property
  await rowLocator.locator(`input`).click()
  
  // Assert that the checkbox is checked
  await expect(rowLocator.locator(`input`)).toBeChecked()
  
  // Assert the property pin is checked
  await expect(secondPinLocator).toHaveScreenshot ("selected-pin2.png", { 
                maxDiffPixelRatio: 0.15, timeout:5000})
  
  //---------------------------------- Step 11 --------------------------------------
  //--------------------------------------------------------------------------------
  
  // Double click on the selected pin
  await secondPinLocator.dblclick()
  
  // Assert that the checkbox is still checked
  await expect(rowLocator.locator(`input`)).toBeChecked()
  
  await expect(async ()=> {
    // Hover over the property on the table
    await rowLocator.hover({force:true, timeout:5000})
    // Assert the property pin is still checked
    await expect(secondPinLocator).toHaveScreenshot ("selected-pin2.png", { 
                  maxDiffPixelRatio: 0.1, timeout:5000})
  }).toPass({timeout:120_000})
  
  //--------------------------------
  // Clean up:
  //--------------------------------
  
  // Click "Done"
  await page.locator(`button:has-text("Done")`).click()
  
  // Click "Done"
  await page.locator(`button:has-text("Continue to property view")`).click()
  
  // Clean up
  await unclaimProperty (page, property)
});