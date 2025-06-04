const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, dragAndDropFile } = require("../../../lib/node_20_helpers");

test("hgse_1640_hg_iq_percentage_match_results_on_property_card", async () => {
 // Step 1. HGSE-1640: hgIQ Percentage Match Results on Property Card
  // Constants and Helpers
  
  // Search
  const city = "Los Angeles"
  const state = "CA"
  
  const roomCondition = {
    kitchen: "Good",
  }
  
  const kitchenA = {
    island:"Yes",
    regrigerator:"Stainless",
    hood : "Yes",
    oven:"Stainless",
    stove : "Stainless",
  }
  
  const flooring = {
    kitchen:"Wood",
    bathroom1:"Wood",
    bathroom2:"Tile"
  }
  
  const countertops = {
    // kitchen1: "Stone",
    kitchen2: "Wood",
  }
  
  const naturalLight = {
    bedroom : "Yes"
  }
  
  const otherAmenities = {
    wallWainscot : "Yes"
  }
  
  const outdoor = {
    trees : "Yes"
  }
  
  const parking = {
    garage: "Yes",
  }
  
  const numPages = 1
  const numHousesToCheckPerPage = 15;
  const totalAppliedFilters = 13; // This is the total number of filters (some have 2 filters)
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  //---------------------------------- Step 1 --------------------------------------
  //--------------------------------------------------------------------------------
  
  // Log in user
  const {page, context} = await logInHomegeniusUser()
  
  //---------------------------------- Step 2 --------------------------------------
  //--------------------------------------------------------------------------------
  
  // Click "Find a home"
  await page.locator(`[data-testid="undecorate"] #nav-hyperlink-Find\\ a\\ Home`).click();
  
  // Search neighborhood
  await page.locator(`p:has-text("Search active listings or claim your home and view value estimates and owner tools") + div input[id^="downshift"]`).fill(city);
  
  // Click the correct result
  await page.locator(`li:visible p:has-text("${city}") + p:text-is("${state}")`).first().click({delay:3000})
  
  // Click "Search"
  await page.locator(`p:has-text("Search active listings or claim your home and view value estimates and owner tools") + div button:has-text("Search")`).click();
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  //---------------------------------- Step 3 --------------------------------------
  //--------------------------------------------------------------------------------
  
  // Select Filter By Image
  await page.getByRole(`button`, { name: `SEARCH WITH AI` }).click();
  
  // Click on Search with My Photos
  await page.getByText(`Search with My Photos`).click();
  
  // Pause for the UI
  await page.waitForTimeout(5000)
  
  // Drag and drop the image
  let fileName = "kitchen.jpeg";
  await dragAndDropFile(
    page, 
    `[id="instructions-text"]`, 
    `/home/wolf/team-storage/${fileName}`
  );
  
  // Pause for additional time to analyze image
  await page.waitForTimeout(30_000)
  
  // Wait for the image to be anyalzed
  await page.waitForSelector(`button:text("Kitchen")`)
  
  // Save the filters that were identified
  const imageFiltersStrings = await page.locator(`label > div:has(span + input):visible span`).allInnerTexts()
  const imageFilters = imageFiltersStrings.map(string=> string.split(":"))
  console.log(imageFilters)
  
  await page.waitForTimeout(20_000);
  
  // Click "Advanced Filters"
  await page.locator(`button:has-text("Advanced Filters")`).click()
  
  // Apply the Natural Light - Bedroom
  await page.locator(`button:has-text("Natural Light") + div p:has-text("Bedroom") + div span:text-is("expand_more")`).click({delay: 1000})
  await page.locator(`li:has-text("${naturalLight.bedroom}"):visible`).click({delay:1000})
  
  // Apply the Other Amenities - Wall Wainscot
  await page.locator(`button:has-text("Other Amenities") + div p:has-text("Wall Wainscot") + div span:text-is("expand_more")`).click({delay: 1000})
  await page.locator(`li:has-text("${otherAmenities.wallWainscot}"):visible`).click({delay:1000})
  
  // -- draft -- updating these
  
  // Apply the Outdoor - Trees
  await page.locator(`button:has-text("Outdoor Living") + div p:has-text("Trees") + div span:text-is("expand_more")`).click({delay: 1000})
  await page.locator(`li:has-text("${outdoor.trees}"):visible`).click({delay:1000})
  
  // Apply the Parking - Garage
  await page.locator(`button:has-text("Parking") + div p:has-text("Garage") + div span:text-is("expand_more")`).click({delay: 1000})
  await page.locator(`li:has-text("${parking.garage}"):visible`).click({delay:1000})
  
  // Grab the total # of filters
  const beforeCountString = await page.locator(`button:has-text("Apply (")`).innerText()
  const beforeCount= parseInt(beforeCountString.replace(/\D/g, ''))
  
  // Apply Flooring - Bathrooms (Wood AND Tile)
  await page.locator(`button:has-text("Flooring") + div p:has-text("Bathrooms") + div span:text-is("expand_more")`).click({delay: 1000})
  await page.locator(`li:has-text("${flooring.bathroom1}"):visible`).click({delay:1000})
  await page.locator(`li:has-text("${flooring.bathroom2}"):visible`).click({delay:1000})
  await page.locator(`button:has-text("Flooring") + div p:has-text("Bathrooms") + div span:text-is("expand_less")`).click()
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // Grab the total # of filters
  const totalFilterString = await page.locator(`button:has-text("Apply (")`).innerText()
  const filterCount = parseInt(totalFilterString.replace(/\D/g, ''))
  
  // Assert that the count only increased by one when adding the last filter
  // Selecting 2 options - "Wood, Tile" should only add 1 filter count
  expect(beforeCount+1).toEqual(filterCount)
  
  // Ensure the AI filtered by the correct items - we expect 13 filters
  await expect(page.locator(
    `button:text("Apply (13)")`
  )).toBeVisible();
  await expect(page.locator(
    `p:text-is("Kitchen") + div div[id^="downshift"]:has-text("Good")`
  )).toHaveCSS(`border`,`2px solid rgb(31, 31, 255)`)
  await expect(page.locator(
    `p:text-is("Island") + div div[id^="downshift"]:has-text("Yes")`
  )).toHaveCSS(`border`,`2px solid rgb(31, 31, 255)`)
  await expect(page.locator(
    `p:text-is("Refrigerator") + div div[id^="downshift"]:has-text("Stainless")`
  )).toHaveCSS(`border`,`2px solid rgb(31, 31, 255)`)
  await expect(page.locator(
    `p:text-is("Stove") + div div[id^="downshift"]:has-text("Stainless")`
  )).toHaveCSS(`border`,`2px solid rgb(31, 31, 255)`)
  await expect(page.locator(
    `p:text-is("Hood") + div div[id^="downshift"]:has-text("Yes")`
  )).toHaveCSS(`border`,`2px solid rgb(31, 31, 255)`)
  await expect(page.locator(
    `p:text-is("Oven") + div div[id^="downshift"]:has-text("Stainless")`
  )).toHaveCSS(`border`,`2px solid rgb(31, 31, 255)`)
  await expect(page.locator(
    `button:Has-text("Flooring") + div p:text-is("Kitchen") + div div[id^="downshift"]:has-text("Wood")`
  )).toHaveCSS(`border`,`2px solid rgb(31, 31, 255)`)
  await expect(page.locator(
    `button:Has-text("Flooring") + div p:text-is("Bathrooms") + div div[id^="downshift"]:has-text("Wood")`
  )).toHaveCSS(`border`,`2px solid rgb(31, 31, 255)`)
  await expect(page.locator(
    `button:Has-text("Countertops") + div p:text-is("Kitchen") + div div[id^="downshift"]:has-text("Wood")`
  )).toHaveCSS(`border`,`2px solid rgb(31, 31, 255)`)
  await expect(page.locator(
    `button:Has-text("Natural Light") + div p:text-is("Bedroom") + div div[id^="downshift"]:has-text("Yes")`
  )).toHaveCSS(`border`,`2px solid rgb(31, 31, 255)`)
  await expect(page.locator(
    `button:Has-text("Other Amenities") + div p:text-is("Wall Wainscot") + div div[id^="downshift"]:has-text("Yes")`
  )).toHaveCSS(`border`,`2px solid rgb(31, 31, 255)`)
  await expect(page.locator(
    `button:Has-text("Outdoor Living") + div p:text-is("Trees") + div div[id^="downshift"]:has-text("Yes")`
  )).toHaveCSS(`border`,`2px solid rgb(31, 31, 255)`)
  await expect(page.locator(
    `button:Has-text("Parking") + div p:text-is("Garage") + div div[id^="downshift"]:has-text("Yes")`
  )).toHaveCSS(`border`,`2px solid rgb(31, 31, 255)`)
  
  // Click "Apply"
  await page.locator(`button:has-text("Apply"):visible`).click()
  
  // Wait for the loader to dissapear
  await expect(page.locator(`.loader`)).not.toBeVisible({timeout:120_000})
  
  // Wait for the search results to update
  await page.waitForTimeout(10000)
  
  // Grab the the properties on the page
  const propertyCardLocator = page.locator(`[data-testid="undecorate"]:has-text("$")`)
  
  let iterariton = 0;
  
  // Iterate over a given number of pages
  while(iterariton<numPages) {
  
    // Grab the number of property cards on the page
    const propertyCount = await propertyCardLocator.count()
    console.log(`There are ${propertyCount} properties to check on this page.`)
  
    // Iterate over the property cards, open them in a new tab, calculate the 
    // hgIQ match based on the selected criteria, and assert that the match percentage is correct
    for (let i=0; i<propertyCount && i <=numHousesToCheckPerPage; i++) {
  
      // Grab the link to the property card 
      const href = await propertyCardLocator.nth(i).locator('a').getAttribute('href');
  
      //---------------------------------- Step 4 --------------------------------------
      //--------------------------------------------------------------------------------
  
      // Grab the match percentage
      const matchString = await propertyCardLocator.nth(i).locator(`svg + div:has-text("% match")`).innerText()
      const matchPercentage = matchString.replace(/\D/g, '')
      console.log(matchPercentage)
      // Go to the URL
      const page2 = await context.newPage();
      await page2.goto(process.env.URL_HOMEGENIUS + href)
  
      // Wait for the page to load
      await page2.waitForLoadState('domcontentloaded');
  
      // Close the overlay
      await page2.locator(`div:has(.material-icons:has-text("Close")):has(button:has-text("open_in_full")) .material-icons:has-text("Close"):visible`).first().click()
  
      //---------------------------------- Step 10 --------------------------------------
      //--------------------------------------------------------------------------------
  
      // If we see a page with "No data available" continue with the next page
      if(await page2.locator(`p:has-text("No Data Available")`).isVisible() || 
          await page2.locator(`div:text-is("The display of homegeniusIQ has been disabled at the request of the seller.")`).isVisible()) {
        
  
        console.log("We are SKIPPING this property. NO DATA AVAILABLE.")
        // Close the tab
        await page2.close()
        await page.bringToFront()
  
        continue;
      }
  
      try{
        // Click "View More" to view all the options
        await page2.locator(`.RoomsScrollOverlayWrapper + div p:Has-text("View More")`).click({timeout : 8_000})
      } catch (err) {
        console.log(err)
        }
  
      try{
        // Click "View More" to view all the options
        await page2.locator(`div:has-text("Objects & Amenities") + div + div p:Has-text("View More")`).click()
      }catch (err) {
        console.log(err)
        }
  
      //---------------------------------- Step 5 and 9 --------------------------------------
      //--------------------------------------------------------------------------------
  
      // ---------------------- Check the visibility of all values ----------------------
  
      console.log("Checking visibility and math of all values now.")
  
      // Add all the potential matches from the AI filtered items
      let count = 0;
      let match = false;
      match = await page2.locator(`div:has(> h6:has-text("Kitchen")) + div p:text-is("Good")`).isVisible();
      count+=match;
      console.log("Kitchen Condition (Good) match: ", match)
      match=false
      match= await page2.locator(`ul:has-text("Kitchen") li:has-text("Island"):has-text("Yes")`).isVisible();
      count+=match;
      console.log("Kitchen Island (Yes) match: ", match)
      match=false
      match= await page2.locator(`ul:has-text("Kitchen") li:has-text("Refrigerator"):has-text("Stainless")`).isVisible();
      count+=match;
      console.log("Kitchen Refrigerator (Stainless) match: ", match)
      match=false
      match= await page2.locator(`ul:has-text("Kitchen") li:has-text("Stove"):has-text("Stainless")`).isVisible();
      count+=match;
      console.log("Kitchen Stove (Stainless) match: ", match)
      match=false
      match= await page2.locator(`ul:has-text("Kitchen") li:has-text("Hood"):has-text("Yes")`).isVisible();
      count+=match;
      console.log("Kitchen Hood (Yes) match: ", match)
      match=false
      match= await page2.locator(`ul:has-text("Kitchen") li:has-text("Oven"):has-text("Stainless")`).isVisible();
      count+=match;
      console.log("Kitchen Oven (Stainless) match: ", match)
      match=false
      match= await page2.locator(`ul:has-text("Flooring") li:has-text("Kitchen"):has-text("Wood")`).isVisible();
      count+=match;
      console.log("Flooring Kitchen (Wood) match: ", match)
      match=false
  
      //---------------------------------- Step 8 --------------------------------------
      //--------------------------------------------------------------------------------
  
      const counterTop1 = await page2.locator(`ul:has-text("Countertop") li:has-text("Kitchen"):has-text("Stone")`).isVisible();
      const counterTop2 = await page2.locator(`ul:has-text("Countertop") li:has-text("Kitchen"):has-text("Wood")`).isVisible();
      count += counterTop1 || counterTop2;
      console.log("Countertop Kitchen (Stone) match:", counterTop1)
      console.log("Countertop Kitchen (Wood) match:", counterTop2)
  
      // Add all the potential matches from the manually applied filters
      const flooringCheck1 = await page2.locator(`ul:has-text("Flooring") li:has-text("Bathrooms"):has-text("Wood")`).isVisible()
      const flooringCheck2 = await page2.locator(`ul:has-text("Flooring") li:has-text("Bathrooms"):has-text("Tile")`).isVisible()
      count += flooringCheck1 || flooringCheck2
      console.log("Flooring Bathroom (Wood) match:", flooringCheck1)
      console.log("Flooring Bathroom (Tile) match:", flooringCheck2)
  
      // Natural Light - Bedroom
      match= await page2.locator(`ul:has-text("Natural Light") li:has-text("Bedrooms"):has-text("Yes")`).isVisible()
      count+=match;
      console.log("Natural Light Bedrooms match: ", match)
      match=false
     // Other Ammenities - Wall Wainscot
      match = await page2.locator(`ul:has-text("Other Amenities") li:has-text("Wall Wainscot"):has-text("Yes")`).isVisible()
      count+=match;
      console.log("Other Amenities Wall Wainscot match: ", match)
      match=false
      // Outdoor Living - Trees
      match= await page2.locator(`ul:has-text("Outdoor Living") li:has-text("Trees"):has-text("Yes")`).isVisible()
      count+=match;
      console.log("Outdoor Living Trees match: ", match)
      match=false
      // Parking - Garage
      match= await page2.locator(`ul:has-text("Parking") p:text-is("Garage: Yes")`).isVisible()
      count+=match;
      console.log("Parking Garage Yes match: ", match)
      console.log("Number of matches found ", count, ". Out of ", totalAppliedFilters, " filters.")
      
      //---------------------------------- Step 6 --------------------------------------
      //--------------------------------------------------------------------------------
  
      // Calculate the matches and percentage 
      const matchNumber = Math.round((count/totalAppliedFilters)*100)
      console.log("Percentage match: ", matchNumber)
  
      console.log(matchNumber, matchPercentage)
      
      // Assert that the calculated hgIQ percentage is correct
      expect(matchNumber).toEqual(parseInt(matchPercentage))
  
      // Close the tab
      await page2.close()
      await page.bringToFront()
  
      console.log("Successfully checked hgIQ percentage.")
  
    }
  
    // Click to the next page
    await page.locator(`button:has-text("chevron_left") + p + button:has-text("chevron_right")`).click();
  
    // Pause for the UI to update
    await page.waitForTimeout(2500)
  
    iterariton ++
  
  }
  
 // Step 2. Removing Filters from Filter by Image removes "Apply" count
  // Constants and Filters
  
  const filters = [
    // "Countertop: Stone",
    "Countertop: Wood",
    "Flooring: Wood",
    "Hood: Yes",
    "Kitchen Island: Yes",
    "Oven: Stainless",
    "Refrigerator: Stainless",
    "Room Condition: Good",
    "Stove: Stainless"
  ]
  
  //--------------------------------
  // Arrange:
  //--------------------------------
  // N/A
  
  //-------------------------------
  // Act and Assert:
  //--------------------------------
  
  //---------------------------------- Step 7 --------------------------------------
  //--------------------------------------------------------------------------------
  
  // Click on Search with AI
  await page.getByRole(`button`, { name: `SEARCH WITH AI` }).click();
  
  // Pause for the UI
  await page.waitForTimeout(3000)
  
  let totalCount = 8
  
  // Remove each filter, assert that the apply count changes 
  for(let i=0; i<filters.length;i++) {
    const currentFilter = filters[i]
    console.log("We are on this filter", currentFilter, totalCount)
  
    // Click the filter
    await page.locator(`label:has-text("${currentFilter}")`).click({delay:500});
  
    // Do not subtract countertop stone 
    if(currentFilter!=="Countertop: Stone") {
      totalCount -= 1;
    }
  
    // Pause for the test
    await page.waitForTimeout(1000)
    
    // Assert Apply count
    await expect(page.locator(`div:text("hgIQ Filters Identified: ${totalCount}")`)).toBeVisible();
    
  }
  
  // Click "Advanced Filters"
  await page.locator(`button:has-text("Advanced Filters")`).click();
  
  // Assert Apply count
  await expect(page.locator(
    `button:has-text("Apply (5)")`
  )).toBeVisible();
  
});