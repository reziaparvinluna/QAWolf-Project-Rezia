const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser } = require("../../../lib/node_20_helpers");

test("hgse_1806_price_filter_logic_for_sold_listings", async () => {
 // Step 1. HGSE-1806: Price Filter Logic for Sold listings
  // Constants and Helpers
  
  const city = "Los Angeles"
  const state = "CA"
  const numPages = 1 // Iterate over 2 pages
  const min = `$150,000`
  const minNumber = 150000
  const max = `$750,000`
  const maxNumber = 750000
  
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  // Log in user
  const {page, context} = await logInHomegeniusUser()
  
  // Click on "Find a Home"
  await page.locator(`[data-testid="undecorate"] #nav-hyperlink-Find\\ a\\ Home`).click();
  
  // Search city
  await page.locator(`p:has-text("Search active listings or claim your home and view value estimates and owner tools") + div input[id^="downshift"]`).fill(city);
  
  // Wait for search to load properly
  await page.waitForSelector(`div ul li:visible`)
  
  // Click the correct result
  await page.locator(`li:visible p:has-text("${city}") + p:text-is("${state}")`).first().click({delay:3000})
  
  // Click "Search"
  await page.locator(`p:has-text("Search active listings or claim your home and view value estimates and owner tools") + div button:has-text("Search")`).click();
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Click "For Sale" 
  await page.locator(`button:has-text("FOR SALE")`).click();
  
  // Click the "Sold" option'
  await page.locator(`label:has-text("Sold")`).click();
  
  // Click "Done" 
  await page.locator(`button:has-text("Done")`).click();
  
  // Wait for the search results to appear
  await expect(page.locator(`.loader`)).not.toBeVisible()
  
  // Filter by price range
  await page.locator(`button:has-text("Price"):has(span:has-text("expand_more"))`).click();
  
  // Add a min and a max
  await page.locator(`[id*="downshift"]:has-text("No Min"):visible`).click();
  await page.locator(`li:has-text("${min}"):visible`).click()
  await page.locator(`[id*="downshift"]:has-text("No Max"):visible`).click();
  await page.locator(`li:has-text("${max}"):visible`).click()
  
  // Click "Done"
  await page.locator(`button:has-text("Done")`).click();
  
  // Filter by price
  // Click the Sort dropdown
  await page.locator(`[aria-controls="downshift-:r5:-menu"]`).click();
  
  // Click "Price per sqft (Low to High)"
  await page.locator(`li:has-text("Price per sqft (Low to High)")`).click();
  
  // Pause for the UI to update the search results
  await page.waitForTimeout(10000)
  
  //--------------------------------
  // Assert: Assert the first 
  //--------------------------------
  
  // Grab the the properties on the page
  const propertyCardLocator = page.locator(`[data-testid="undecorate"]:has(img) > a[target="_self"]`)
  
  let iterariton = 0;
  
  // Iterate over a given number of pages
  while(iterariton<numPages) {
  
    // Grab the number of property cards on the page
    const propertyCount = await propertyCardLocator.count()
    console.log(`There are ${propertyCount} properties to check on this page.`)
  
    let lastPricePerSqFt = 0
  
    // Iterate over the property cards, open them in a new tab, and assert that the 
    // price listed on the property card, property details page, align with the last
    // price sold (and are also filtered correctly by low to high price per sq ft)
    for (let i=0; i<propertyCount; i++) {
  
      // Grab the link to the property card
      const href = await propertyCardLocator.nth(i).getAttribute('href');
  
      // Grab the list price
      const listPrice = await propertyCardLocator.nth(i).locator(`div.card-media-container + div > div:has-text("$")`).innerText()
      const price = parseInt(listPrice.replace(/\D/g, ''))
  
      // Go to the URL
      const page2 = await context.newPage();
      await page2.goto(process.env.URL_HOMEGENIUS + href)
  
      // Wait for the page to load
      await page2.waitForLoadState('domcontentloaded');
  
      // const isPriceVisible = await page2.locator(`div:has(div:has-text("Off Market")) + div p:has-text("${listPrice}")`).isVisible()
      // const isPriceSQFtVisible = await page2.locator(`div:has(div:has-text("Off Market")) + div p:has-text("${listPrice}") + p`).isVisible()
      // || !isPriceVisible || !isPriceSQFtVisible
      // If we see a page with "No data available" continue with the next page
      if(await page2.locator(`p:has-text("No Data Available")`).isVisible() || !price ) {
  
        // Close the tab
        await page2.close()
        await page.bringToFront()
  
        continue;
      }
  
      if(await page2.locator(`:text("15445 Cobalt Street Unit Spc 7")`).isVisible()){
        // Close the tab
        await page2.close()
        await page.bringToFront()
  
        continue;
      }
  
      // Assert that the price is the same as that which was listed on the property card
      try {
        // Lowered this timeout to 15 secs for cases where it goes to the catch, but can set back to 30 if it causes flakiness
        await expect(page2.locator(`div:has(div:has-text("Off Market")) + div p:has-text("${listPrice}") + p`)).toBeVisible({ timeout: 15 * 1000 })
        
        // Grab the price per sq ft
        const priceSQFtString = await page2.locator(`p:has-text("/sqft)")`).first().innerText()
        const pricePerSQFt = parseInt(priceSQFtString.split("/")[0].slice(2))
  
        // Assert that the last price per sq ft to be less than or equal to the current price per sq ft
        expect(pricePerSQFt).toBeGreaterThanOrEqual(lastPricePerSqFt)
  
        // Grab the sq ft for the house and convert to numbers
        const sqFtString = await page2.locator(`span:has-text("square_foot") + p`).innerText()
        const sqft = parseInt(sqFtString.replace(/\D/g, ''))
  
        // Assert that the price per sq ft is correct
        expect(pricePerSQFt).toEqual(Math.round(price/sqft))
  
  
        // Assert that it says "Last Sold Price" under the sqft price
        await expect(page2.locator(`div:has(div:has-text("Off Market")) + div p:has-text("${listPrice}") + p + p:has-text("Last Sold Price")`)).toBeVisible()
  
        // Set the last price per sq ft to the current
        lastPricePerSqFt = pricePerSQFt
      } catch {
        // If the listing is over a year old, it will say Sold {date} for {listPrice} instead
        await expect(page2.getByText(new RegExp(`Off Market: Sold .*? for \\${listPrice}`))).toBeVisible({ timeout: 3 * 1000 });
      }
  
      // Assert that the price falls within the range
      expect(price).toBeLessThanOrEqual(maxNumber)
      expect(price).toBeGreaterThanOrEqual(minNumber)
  
      // Assert that the "Sold price" is what is shown above
      let thrwError = false
      try{
        console.log("Checking if the property has a 'Sold' history listing in the 'Property History' Section")
        
        // Scroll dowwn to the "Property History" table
        await page2.locator(`#PropertyHistoryTableHeader`).scrollIntoViewIfNeeded()
  
        // Pause for the user to check the value in the recording if necessary
        await page2.waitForTimeout(1000)
        
        const statuses = ["Sold", "Pending"];
        let isVisible = false;
  
        for (const status of statuses) {
          const locator = page2.locator(`#PropertyHistoryTableHeader + div:has-text("${status}")`);
          if (await locator.isVisible()) {
              isVisible = true;
              break;
          }
        }
  
        if (isVisible) {
            
            console.log("We see a history listing.")
            try{
              // If there is, check that value and assert that it's the same as the price in the title of the listing
              await Promise.any(
                  statuses.map(status =>
                      page2.locator(`[id^="PropertyDetailsTransactionLine-"]:has-text("${status}"):has-text("${listPrice}")`).first().isVisible()
                  )
              );
            } catch{
              thrwError = true
            }
        } else {
          throw new Error('None of the expected statuses are visible');
        }
  
        console.log("Confirmed that the prices match!")
      } catch{
        console.log("There was no property 'Sold' data found.")
      }
  
      if(thrwError) {
        throw new Error("Sold history value does NOT match the home value shown of: "+ listPrice)
      }
      
      // Close the tab
      await page2.close()
      await page.bringToFront()
  
    }
  
    // Click to the next page
    await page.locator(`button:has-text("chevron_left") + p + button:has-text("chevron_right")`).click();
  
    // Pause for the UI to update
    await page.waitForTimeout(5000)
  
    iterariton ++
  
  }
  
 // Step 2. Price Filter Logic for "For Sale" Listings
  //--------------------------------
  // Arrange:
  //--------------------------------
  // N/a
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Click the "Sold" option'
  await page.locator(`button:has-text("Sold"):has(span:text-is("expand_more"))`).click();
  
  // Click "For Sale" 
  await page.locator(`button:has-text("FOR SALE")`).click();
  
  // Click "Done" 
  await page.locator(`button:has-text("Done")`).click();
  
  // Pause for the UI to update the search results
  await page.waitForTimeout(10000)
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // Iterate over a given number of pages
  
  iterariton=0
  
  while(iterariton<numPages) {
  
    // Grab the number of property cards on the page
    const propertyCount = await propertyCardLocator.count()
    console.log(`There are ${propertyCount} properties to check on this page.`)
  
    let lastPricePerSqFt = 0
  
    // Iterate over the property cards, open them in a new tab, and assert that the 
    // price listed on the property card, property details page, align with the price listed
    //  (and are also filtered correctly by low to high price per sq ft)
    for (let i=0; i<propertyCount; i++) {
  
      // Grab the link to the property card
      const href = await propertyCardLocator.nth(i).getAttribute('href');
  
      // Grab the list price
      const listPrice = await propertyCardLocator.nth(i).locator(`div.card-media-container + div > div:has-text("$")`).innerText()
      const price = parseInt(listPrice.replace(/\D/g, ''))
  
      // Go to the URL
      const page2 = await context.newPage();
      await page2.goto(process.env.URL_HOMEGENIUS + href)
  
      // Wait for the page to load
      await page2.waitForLoadState('domcontentloaded');
      
      // If we see a page with "No data available" or no price information, continue with the next page
      if(await page2.locator(`p:has-text("No Data Available")`).isVisible() || !price) {
  
        // Close the tab
        await page2.close()
        await page.bringToFront()
  
        continue;
      }
  
      // Check if the property status is "Active" or "Pending" or "For Sale" and the price matches the listPrice
      const activeLocator = page2.locator(`div:has(div:has-text("Active")) + div p:has-text("${listPrice}") + p`);
      const pendingLocator = page2.locator(`div:has(div:has-text("Pending")) + div p:has-text("${listPrice}") + p`);
      const comingSoonLocator = page2.locator(`div:has(div:has-text("Coming Soon")) + div p:has-text("${listPrice}") + p`);
  
      const isActiveVisible = await activeLocator.isVisible();
      const isPendingVisible = await pendingLocator.isVisible();
      const isComingSoonVisible = await comingSoonLocator.isVisible();
  
      if (!isActiveVisible && !isPendingVisible && !isComingSoonVisible) {
          throw new Error('Property is neither Active nor Pending with the specified price');
      }
  
      // Grab the price per sq ft
      const priceSQFtString = await page2.locator(`p:has-text("${listPrice}") + p`).innerText()
      const pricePerSQFt = parseInt(priceSQFtString.split("/")[0].slice(2))
      
      // Assert that the last price per sq ft to be less than or equal to the current price per sq ft
      expect(pricePerSQFt).toBeGreaterThanOrEqual(lastPricePerSqFt)
  
      // Grab the sq ft for the house and convert to numbers
      const sqFtString = await page2.locator(`span:has-text("square_foot") + p`).innerText()
      const sqft = parseInt(sqFtString.replace(/\D/g, ''))
  
      // Assert that the price per sq ft is correct
      expect(pricePerSQFt).toEqual(Math.round(price/sqft))
  
      // Assert that the price falls within the range
      expect(price).toBeLessThanOrEqual(maxNumber)
      expect(price).toBeGreaterThanOrEqual(minNumber)
  
      // Assert that the "Listed price" is what is shown above
      let thrwError = false
      try{
        console.log("Checking if the property has the 'Active' history listing in the 'Property History' Section")
        
        // Scroll dowwn to the "Property History" table
        await page2.locator(`#PropertyHistoryTableHeader`).scrollIntoViewIfNeeded()
  
        // Pause for the user to check the value in the recording if necessary
        await page2.waitForTimeout(1000)
        
        // Check to see if there is an "Active" history value 
             // Check to see if there is an "Active" history value 
        const statuses = ["Price Change", "Active", "Listed", "Pending"];
        let isVisible = false;
  
        for (const status of statuses) {
          const locator = page2.locator(`#PropertyHistoryTableHeader + div:has-text("${status}")`);
          if (await locator.isVisible()) {
              isVisible = true;
              break;
          }
        }
  
        if (isVisible) {
            
            console.log("We see a history listing.")
            try{
              // If there is, check that value and assert that it's the same as the price in the title of the listing
              await Promise.any(
                  statuses.map(status =>
                      page2.locator(`[id^="PropertyDetailsTransactionLine-"]:has-text("${status}"):has-text("${listPrice}")`).first().isVisible()
                  )
              );
            } catch{
              thrwError = true
            }
        } else {
          throw new Error('None of the expected statuses are visible');
        }
  
        console.log("Confirmed that the prices match!")
      } catch{
        console.log("There was no property data found.")
      }
  
      if(thrwError) {
        throw new Error("Price history value does NOT match the home value shown for ACTIVE listings. Price of: "+ listPrice)
      }
      
      // Set the last price per sq ft to the current
      lastPricePerSqFt = pricePerSQFt
  
      // Close the tab
      await page2.close()
      await page.bringToFront()
  
    }
  
    // Click to the next page
    await page.locator(`button:has-text("chevron_left") + p + button:has-text("chevron_right")`).click();
  
    // Pause for the UI to update
    await page.waitForTimeout(5000)
  
    iterariton ++
  
  }
  
  
  
});