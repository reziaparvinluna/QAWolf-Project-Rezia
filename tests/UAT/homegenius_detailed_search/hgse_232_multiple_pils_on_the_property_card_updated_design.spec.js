const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_232_multiple_pils_on_the_property_card_updated_design", async () => {
 // Step 1. HGSE-232 - Multiple Pils on the Property Card-Updated Design
  // Constants and Helpers
  
  const possiblePills = {
    "Open House":{
      regex:/^Open House \d{2}\/\d{2}\/\d{4}$/i,
      selector:`li:has(button:has-text("New"))`,
      css: {property: "background-color", value:"rgb(120, 8, 76)"}
    },
    "Price Reduced by":{
      regex:/^Price Reduced by \$\d{1,3}(,\d{3})*(\.\d+)? \(\d+(\.\d+)?%\)$/i, // 
      selector:`li:has(button:has-text("Price Reduced by"))`,
      css: {property: "background-color", value:"rgb(255, 76, 76)"}
    },
    "New":{
      regex:/New/i,
      selector:`li:has(button:has-text("New"))`,
      css: {property: "background-color", value:"rgb(31, 31, 255)"}
    },
    "Coming Soon":{
      regex:/Coming Soon/i,
      selector:`li:has(button:has-text("New"))`,
      css: {property: "background-color", value:"rgb(18, 18, 18)"}
    }
  }
  
  const testedPills = new Set()
  const state = "California"
  const email = "yong@qawolf.com"
  const password = "Secret123456!"
  
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  // Log in user
  let {page, context} = await logInHomegeniusUser({email, password})
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Click "Find a home"
  await page.locator(`[data-testid="undecorate"] #nav-hyperlink-Find\\ a\\ Home`).click();
  
  // Search neighborhood
  await page.locator(`p:has-text("Search active listings or claim your home and view value estimates and owner tools") + div input[id^="downshift"]`).fill(state);
  
  // Click the correct result
  await page.locator(`li:visible:has-text("${state}")`).first().click({delay:3000})
  
  // Click "Search"
  await page.locator(`p:has-text("Search active listings or claim your home and view value estimates and owner tools") + div button:has-text("Search")`).click();
  
  // Pause for the UI
  await page.waitForTimeout(10000)
  
  // Wait for the loader
  await expect(page.locator(`.loader`).first()).not.toBeVisible()
  
  // Pause for the UI
  await page.waitForTimeout(5000)
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // Save the property card locators that have pills
  const propertyCardLocator = page.locator(`[data-testid="undecorate"]:has(img) > a:has(li:has(button))`)
  
  // Save variables for iterating
  let iteration = 0;
  let lastProperty = ""
  
  // Iterate untile we find all possible pills, and iteration is less than 50
  while(testedPills.size < 4 && iteration<50) {
  
    // Grab the number of property cards on the page
    const propertyCount = await propertyCardLocator.count()
    console.log(`There are ${propertyCount} properties with pills to check on this page.`)
  
    // Iterate over all property cards
    for (let i=0; i<propertyCount; i++) {
  
      // Grab the number of pills on the property
      const pillCount = await propertyCardLocator.nth(i).locator(`li:has(button)`).count()
      
      let address = "";
      try{
        address = await propertyCardLocator.nth(i).locator(`div[type="LARGE_CARD"] > div[type="LARGE_CARD"]`).innerText()
  
      } catch(e) {
        console.error(e)
      }
      console.log("Testing this address: ", address)
      // Assert that a pill has a maximum of 2 pills
      expect(pillCount).toBeLessThanOrEqual(2);
  
      // Check all the pills on the property
      for (let j=0; j<pillCount;j++) {
        const pill = propertyCardLocator.nth(i).locator(`li:has(button)`).nth(j)
        const pillText = await pill.innerText()
        let key = null;
      
        // Determine which pill it is using a switch statement
        switch (true) {
          case /Open House/i.test(pillText):
              key = "Open House";
              break;
          case /^Price Reduced by \$\d{1,3}(,\d{3})*(\.\d+)? \(\d+(\.\d+)?%\)$/i.test(pillText):
              key = "Price Reduced by";
              break;
          case /New/i.test(pillText):
              key = "New";
              break;
          case /Coming Soon/i.test(pillText):
              key = "Coming Soon";
              break;
        }
  
        console.log("Found the key: ", key, ". For the pill text: ", pillText)
  
        // Assert that they match the regex pattern
        expect(pillText).toMatch(possiblePills[key].regex)
  
        // Assert the color of the pill
        await expect(pill).toHaveCSS(possiblePills[key].css.property, possiblePills[key].css.value)
  
        if(!testedPills.has(key)) {
          
          // Get the href for the home
          const href = await pill.evaluate(el => el.closest('a').getAttribute('href'));
  
          // Open a new page
          const page2 = await context.newPage();
  
          // Navigate to the href in the new page
          await page2.goto(process.env.URL_HOMEGENIUS + href);
  
          // Assert that we are on the property details page
          await expect(page2).toHaveURL(/property-details/);
  
          // Add the key to the "Tested Pills" set to keep track of pills we have checked
          testedPills.add(key)
  
          // Stop iterating if we have visited all pills
          if (testedPills.add(key).size===4) {
            lastProperty = address;
            page = page2;
            break;
          }
  
          // Go back to the search page
          await page2.close()
          await page.bringToFront()
          
        }
          
      }
  
      // Stop iterating if we have visited all pills
      if (testedPills.add(key).size===4) {
        break;
      }
    }
  
    // Stop iterating if we have visited all pills
    if (testedPills.add(key).size===4) {
      break;
    }
  
    // Click to the next page
    await page.locator(`button:has-text("chevron_left") + p + button:has-text("chevron_right")`).click();
  
    // Wait for the loader
    await expect(page.locator(`.loader`).first()).not.toBeVisible()
  
    // Pause for the UI
    await page.waitForTimeout(5000)
  
    iteration ++
  }
  
  // Expect to have found ALL pills and asserted their color and text
  expect(testedPills.size).toBe(4)
  
 // Step 2. Claim Property and Assert Claimed Property Pill
  // Constants and Helpers
  
  const staticAddress = {
    searchAddress: "5038 Apple Ridge Dr Allison Park PA 15101",
    addressLineOne: "5038 Apple Ridge Dr",
    addressLineTwo: "Allison Park, PA 15101"
  }
  
  const dynamicAddress = {
    searchAddress: "",
    addressLineOne: "",
    addressLineTwo: ""
  }
  
  let usedStaticAddress = false;
  
  //--------------------------------
  // Arrange:
  //--------------------------------
  // N/A
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Try to claim the property, if it is not claimable, claim a property with a static address
  try{
    // On the last property - claim it.
    await page.locator(`[aria-label="Property options menu button"]`).click();
  
    // Save the address variables
    dynamicAddress.addressLineOne = await page.locator(`div:has-text("$"):has-text("/sqft") + div:has(button) + div p:visible`).nth(0).innerText()
    dynamicAddress.addressLineTwo = await page.locator(`div:has-text("$"):has-text("/sqft") + div:has(button) + div p:visible`).nth(1).innerText()
    dynamicAddress.searchAddress = `${dynamicAddress.addressLineOne}, ${dynamicAddress.addressLineTwo}`
    console.log("Grabbed the address: ", dynamicAddress.searchAddress)
    
    // Click "Claim Home"
    await page.locator(`button:has-text("Claim Home")`).first().click()
    
    // Assert that we see the "Claim Home page"
    await expect(page.locator(`#Own`)).toBeVisible()
  
    // Click on I own this home
    await page.locator(`#Own`).click();
  
    // Click on Yes, add it to my profile
    await page.locator(`button:text("Yes, add it to my profile")`).click(); 
  
    // Close the helper modal
    await page.waitForSelector(`button:text("Skip and Close")`);
    await page.locator(`main button span span:text("close"):visible`).first().click({delay: 5000});
  
    // Click on Skip and Close
    await page.locator(`button:text("Skip and Close")`).click();
  
    // Soft Assert property was successfully claimed
    await expect(page.locator(`p:text("This property has been successfully claimed.")`)).toBeVisible();
    await expect(page.locator(`p:text("Now that it is claimed, you can come back and make edits later.")`)).toBeVisible();
  
    // Close the modal
    await page.locator(`button:text("Close")`).click();
  
  } catch{
  
    // Set this variable to true
    usedStaticAddress = true;
  
    // Claim a known address
    await claimProperty(page,staticAddress)
  }
  
  // Set the address we will use for the rest of the test
  const useThisAddress = usedStaticAddress ? staticAddress: dynamicAddress;
  
  // Click on "Account"
  await page.locator(`#login-btn`).click();
  
  // Click on "Saved homes" -> property should be there
  await page.locator(`:text("Saved Homes")`).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // Save the property card
  const propertyCard = page.locator(`div:has(> .card-media-container):has-text("${useThisAddress.addressLineOne}")`)
  
  // Assert - Home should havee a pill that says "CLaimed (claimingDate)"
  expect(await propertyCard.locator(`li:has(button)`).innerText()).toMatch(/^Claimed \d{2}\/\d{2}\/\d{4}$/i)
  
  // Assert - pill has correct color - rgb(113, 113, 113)
  await expect(propertyCard.locator(`li:has(button)`)).toHaveCSS(`background-color`,`rgb(113, 113, 113)`)
  
  throw new Error(`If reach this line and see claimed address in the saved home section,
                   please let @JasonAllen or @Koalas know`)
  
  //--------------------------------
  // Cleanup: Removed the claimed property
  //--------------------------------
  
  await unclaimProperty(page,useThisAddress)
  
});