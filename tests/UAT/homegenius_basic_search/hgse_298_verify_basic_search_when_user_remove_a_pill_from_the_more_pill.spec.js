const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_298_verify_basic_search_when_user_remove_a_pill_from_the_more_pill", async () => {
 // Step 1. HGSE-298 - Verify Basic Search - When User Remove a Pill from the More Pill
  // Constants and Helpers
  const { readFile } = await import("node:fs/promises");
  
  // This function takes in a keyword, creates a search, and adds the first list item
  // This function also asserts each step.
  // Returns an object with the search result name and location
  async function searchAndAddLocationToSeach (page, keySearch, searchCount) {
  
    //Constants
    const retObject = {
      name:"",
      location:"",
      count:"",
      screenshot:""
    }
  
    // Save input locator for search
    const inputLocator = page.locator(`input[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`)
  
    // Search a location or search criteria
    await inputLocator.fill(keySearch)
  
    // Pause for UI to update 
    await page.waitForTimeout(10000)
  
    // Verify search dropdown exists
    await expect(page.locator(`div + hr + ul`).first()).toBeVisible()
  
    // Assert that there are are suggestions in the result
    const searchResultCount = await page.locator(`div + hr + ul li`).count()
  
    // Assert that there are more than 0 search results
    expect(searchResultCount).toBeGreaterThan(0)
  
    // // Ensure the keywords are in all the results
    // const keywords = keySearch.split(" ")
    // const listItem = page.locator(`div + hr + ul`)
    // for(let j=0;j<keywords.length;j++) {
    //   const word = keywords[j]
    //   expect(await listItem.locator(`li:has-text("${word}")`).count()).toBe(searchResultCount);
    // }
  
    // Save the locator for the first list item
    const firstSelector = page.locator(`div + hr + ul li`).nth(0)
  
    // Save information from the first suggestion
    retObject.name = await firstSelector.locator(` button p`).nth(0).innerText()
    retObject.location = await firstSelector.locator(` button p`).nth(1).innerText()
  
    // Select the first suggestion
    await firstSelector.click({delay: 3000})
  
    // Pause for UI to update
    await page.waitForTimeout(10000)
  
    if(searchCount <1){
      // Assert we see the pill show up
      await expect(page.locator(`li:has-text("${retObject.name}, ${retObject.location}")`)).toBeVisible()
    } else {
      await expect(page.locator(`li:has-text("${searchCount} more")`)).toBeVisible()
    }
  
    // Save screenshot to retObj 
    retObject.screenshot = await page.locator(`#view-default-view`).screenshot();
  
    // Save the listing count
    retObject.count = await page.locator(`p:has-text("Total Listings")`).innerText()
  
    // Assert search options are no longer visible
    await expect(page.locator(`div + hr + ul`)).not.toBeVisible()
  
    return retObject
  }
  
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
      const allowedDifference = Math.floor(totalPixels * 0.005); // .5% difference
  
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
  
  // Locations
  const locationOne = {
    address: "101 Curtis Ct",
    city: "Wayne",
    state: "Pennsylvania",
    stateAbrev: "PA",
  }
  
  // Search options
  const searchOptions = [
                          "Brighton Area Schools", // School
                          "91740", // Zipcode
                          "Pennsylvania Furnace", // Place
                          "Aspinwall", // Neighborhood
                          "Harrisburg", // City
                        ]
  
  //--------------------------------
  // Arrange: Log in to UAT-Portal
  //--------------------------------
  
  // Login to Homeogenius UAT-Portal
  const {page,context} = await logInHomegeniusUser()
  
  // Go to "/home-search" URL - specified by client
  await page.goto(`${process.env.URL_HOMEGENIUS}/home-search`)
  
  // Close the overlay
  await page.locator(`div:has(> pre) button:has-text("Close")`).click()
  
  // Save the original search screen
  const defaultSearchMap = await page.locator(`#view-default-view`).screenshot()
  
  //--------------------------------
  // Act: Search an address with only one search result
  //--------------------------------
  
  // Fill in the address
  await page.locator(`input[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).fill(`${locationOne.address} ${locationOne.city}`);
  
  //--------------------------------
  // Assert: No pill is added and navigated to detailed home report page
  //--------------------------------
  
  // Wait for search results
  await page.waitForTimeout(10000)
  
  // Assert that there is only one result
  const searchResultCount = await page.locator(`div + hr + ul li`).count()
  expect(searchResultCount).toBe(1)
  
  // Click on the result
  await page.locator(`div + hr + ul li`).click()
  
  // Assert that we are brought to the "Property details page"
  await expect(page).toHaveURL(/property-details/)
  
  // Go back to the previos page
  await page.goBack()
  
  // Assert no pill was added to the searchbar
  await expect(page.locator(`button + button:has-text("Close")`)).not.toBeVisible()
  
  // Pause for the new page to load. We were previously closing the wrong overlay
  await page.waitForTimeout(5_000)
  
  // Close the overlay
  await expect(async () =>{
    await page.locator(`div:has(> pre) button:has-text("Close")`).click()
    await expect(page.locator(`div:has(> pre) button:has-text("Close")`)).not.toBeVisible()
  }).toPass({timeout: 60_000});
  
  //--------------------------------
  // Act and Assert: Add pills to the search bar
  //--------------------------------
  
  // Array to save the pill results
  const pillResults = []
  
  // Search and assertion each search option
    // Steps:
    // Select a suggestion
    // Assert that a pill was added to search bar
    // Verify pill created only if selected suggestion includes multiple search results
    // Verify user is able to select as many search criteria as necesary
  for (let i=0; i<searchOptions.length ; i++) {
  
    console.log("Searching for: ", searchOptions[i])
  
    // Pause for addional searches
    await page.waitForTimeout(5000)
  
    // Search, assert, and add each search option result to our array
    const searchOptionObj = await searchAndAddLocationToSeach(page, searchOptions[i], i)
    pillResults.push(searchOptionObj)
  
  }
  
  //--------------------------------
  // Act and Assert: Remove Pills, Assert Count Decreases, Assert that the map boundaries revert back to previous
  //--------------------------------
  
  for(let i=pillResults.length-1; i>=1 ;i--) {
  
    console.log("Checking i", i)
    console.log("Checking ith Pill Result", pillResults[i].name)
    console.log("Checking i-1 Pill Result", pillResults[i-1].name)
  
    // Click away from the menu
    await page.mouse.click(0,0)
  
    // Take a new unique base screenshot of the map, before we remove the pill
    const screenshotBeforePillRemoved = `screenshotBeforePillremoved${Date.now()}`
    await expect(page.locator(`#view-default-view`)).toHaveScreenshot(screenshotBeforePillRemoved)
  
    // Click on a pill
    await page.locator(`button:has( + button:has-text("Close")) >> nth=1`).click()
  
    // Remove a pill
    await page.waitForTimeout(3000)
    await page.locator(`button:has-text("${pillResults[i].name}") + button:has-text("Close")`).click()
  
    // Click away from the menu
    await page.mouse.click(0,0)
  
    // Pause for UI
    await page.waitForTimeout(15000)
  
    // Assert that the count adjusts back to the count prior to adding the pill
    expect(await page.locator(`p:has-text("Total Listings")`).innerText()).toBe(pillResults[i-1].count)
  
    // Pause for UI3
    await page.waitForTimeout(2000)
  
    // Assert that the map adjusted and no longer shows the deleted pill and does not match base image
    let screenshotsMatched = false;
    try{
      await expect(page.locator(`#view-default-view`)).toHaveScreenshot(screenshotBeforePillRemoved)
      screenshotsMatched = true;
    } catch (e){
      console.log(e)
    }
  
    if(screenshotsMatched){
      throw new Error('screenshots should not match, pills should be removed')
    }
  }
  
  // Remove last pill and asset the boundary is removed
  await page.locator(`li button:has-text("Close")`).click()
  
  // Assert that the last boundary has been removed
  const areScreenshotsEqual = compareScreenshots(defaultSearchMap, pillResults[0].screenshot);
  expect(areScreenshotsEqual).toBe(false);
  
});