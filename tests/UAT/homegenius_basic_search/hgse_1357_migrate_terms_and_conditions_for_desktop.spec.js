import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_1357_migrate_terms_and_conditions_for_desktop", async () => {
 // Step 1. HGSE-1357 - Migrate Terms and Conditions for Desktop
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  // --------------- Step 1 ---------------
  // --------------------------------------
  
  // Login to https://qa-portal.homegeniusrealestate.com/ enter login credentials
  const { page, context } = await logInHomegeniusUser()
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // --------------- Step 2 & 3 ---------------
  // --------------------------------------
  
  // Navigate to Footer of the home page and select Terms and Conditions from the hgre footer
  await page.locator(`[data-testid="undecorate"] :text("Terms and Conditions")`).scrollIntoViewIfNeeded();
  const [page2] = await Promise.all([
    page.waitForEvent("popup"),
    page.locator(`[data-testid="undecorate"] :text("Terms and Conditions")`).click({delay:2000}),
  ]);
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // --------------- Step 4 ---------------
  // --------------------------------------
  
  // Assertion - Validate the url is:https://homegeniusrealestate.com/terms-and-conditions
  await expect(page2).toHaveURL('https://uat-portal.homegeniusrealestate.com/terms-and-conditions');
  
  // --------------- Step 5 ---------------
  // --------------------------------------
  
  // Assertion - Validate the content is the correct
  await expect(page2.locator(`h1:has-text("Terms and Conditions")`)).toBeVisible();
  
  // --------------- Step 6 ---------------
  // --------------------------------------
  
  // Click on all links on the page and validate they are working as expected (emails, phone numbers, apps, etc.)
  const div = await page2.$('main > div:first-child + div + div > div > div > div'); // Select the div element
  const links = await div.$$eval('a', anchors => anchors.map(anchor => anchor.href)); // Find all 'a' tags and extract their href attributes
  
  console.log("Links to check: ", links); // Output the array of URLs
  
  for (const link of links) {
    if (link.startsWith('mailto:')) {
      // Validate email link
      const email = link.slice(7); // Remove 'mailto:' part
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        throw new Error(`Invalid email link: ${link}`);
      } else {
        console.log(`Valid email link: ${link}`);
      }
    } else if (link.startsWith('tel:')) {
      // Validate phone number link
      const phoneNumber = link.slice(4); // Remove 'tel:' part
      const phonePattern = /^\+?[1-9]\d{1,14}$/; // E.164 format
      if (!phonePattern.test(phoneNumber)) {
        throw new Error(`Invalid phone number link: ${link}`);
      } else {
        console.log(`Valid phone number link: ${link}`);
      }
    } else if (link.startsWith('app:')) {
      // Validate app link (assuming app links start with 'app:')
      const appLink = link.slice(4); // Remove 'app:' part
      if (!appLink) {
        throw new Error(`Invalid app link: ${link}`);
      } else {
        console.log(`Valid app link: ${link}`);
      }
    } else {
      // Validate normal URL
      const newPage = await context.newPage(); // Open a new page
      try {
        const response = await newPage.goto(link); // Navigate to the link
  
        // Check if the response status is OK (status code 200-299)
        if (!(response.status() >= 200 && response.status() < 300)) {
          throw new Error(`Invalid URL: ${link} (status code: ${response.status()})`);
        } else {
          console.log(`Valid URL: ${link}`);
        }
      } catch (error) {
        console.error(error.message);
        throw new Error("We have an invalid link. Error: ", error.message) // Exit with an error code
      } finally {
        await newPage.close(); // Close the new page
      }
    }
  }
  
  // Close the page
  await page2.close()
  
 // Step 2. Validate Terms and Conditions Link on All Relevant Pages 
  // Constants
  const streetName = "3122 Olive St"
  const searchAddress = `${streetName} San Diego, CA 92104`
  
  // Function to assert that terms and conditions page
  async function assertTermsAndConditions (page) {
  
    // Pause
    await page.waitForTimeout(5000)
    // Scroll into view
    await page.locator(`[data-testid="undecorate"] :text("Terms and Conditions")`).scrollIntoViewIfNeeded();
    // Click on Terms and Conditions
    const [page3] = await Promise.all([
      page.waitForEvent("popup"),
      page.locator(`[data-testid="undecorate"] :text("Terms and Conditions")`).click({delay:3000}),
    ]);
  
    //--------------------------------
    // Assert:
    //--------------------------------
  
    // Assertion - Validate the url is:https://homegeniusrealestate.com/terms-and-conditions
    await expect(page3).toHaveURL('https://uat-portal.homegeniusrealestate.com/terms-and-conditions');
  
    // Assertion - Validate the content is the correct
    await expect(page3.locator(`h1:has-text("Terms and Conditions")`)).toBeVisible();
  
    // Close the page
    await page3.close()
  }
  
  //--------------------------------
  // Arrange:
  //--------------------------------
  // N/A
  
  // --------------- Step 7 ---------------
  // --------------------------------------
  
  // For the following assert the terms and conditions page is the same as above 
  
  //--------------------------------
  // Act and Assert: Home page
  //--------------------------------
  
  // Go to the home page
  await page.goto(process.env.URL_HOMEGENIUS)
  
  // Assert Terms and Conditions
  await assertTermsAndConditions(page)
  
  
  //--------------------------------
  // Act and Assert: Find a home page
  //--------------------------------
  
  // Click on "Find a Home"
  await page.locator(`[id="nav-hyperlink-Find a Home"]`).click()
  
  // Assert Terms and Conditions
  await assertTermsAndConditions(page)
  
  //--------------------------------
  // Act and Assert: Find an Agent page
  //--------------------------------
  
  // Click on "Find an Agent"
  await page.locator(`[id="nav-hyperlink-Find an Agent"]`).click()
  
  // Assert Terms and Conditions
  await assertTermsAndConditions(page)
  
  //--------------------------------
  // Act and Assert: Home Search Page
  //--------------------------------
  
  // Go to the home search
  
  await page.goto(process.env.URL_HOMEGENIUS + `/home-search`)
  await expect(page.locator(".loader")).not.toBeVisible()
  
  // Assert Terms and Conditions
  await assertTermsAndConditions(page)
  
  //--------------------------------
  // Act and Assert: Property Details Page - Overview Tab
  //--------------------------------
  
  // Search for the property
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).fill(searchAddress);
  
  // Click on the property - we land on the Overview Tab by default
  await page.locator(`li:has-text("${streetName}") p:has-text("San Diego CA")`).click({ timeout: 45 * 1000 })
  
  // Click to close the helper modal
  try {
    await page.getByRole(`button`, { name: `close` }).click();
  } catch (e){
    console.log(e)
  }
  
  // Assert Terms and Conditions
  await assertTermsAndConditions(page)
  
  //--------------------------------
  // Act and Assert: Property Details Page - Prior Listings Page
  //--------------------------------
  
  // Click on "History"
  await page.locator(`button:text-is("History")`).click();
  
  // Assert Terms and Conditions
  await assertTermsAndConditions(page)
  
  //--------------------------------
  // Act and Assert: Property Details Page - Property Details Tab
  //--------------------------------
  
  // Click on "Property Details"
  await page.locator(`button:text-is("Property Details")`).click();
  
  // Assert Terms and Conditions
  await assertTermsAndConditions(page)
  
  //--------------------------------
  // Act and Assert: Property Details Page - homegeniusIQ Tab
  //--------------------------------
  
  // Click on "homegeniusIQ"
  await page.locator(`button:text-is("homegeniusIQ")`).click();
  
  // Assert Terms and Conditions
  await assertTermsAndConditions(page)
  
  //--------------------------------
  // Act and Assert: Property Details Page - Market Information Tab
  //--------------------------------
  
  // Click on "Market Information"
  await page.locator(`button:text-is("Market Information")`).click();
  
  // Assert Terms and Conditions
  await assertTermsAndConditions(page)
  
  //--------------------------------
  // Act and Assert: Property Details Page - Similar Properties Tab
  //--------------------------------
  
  // Click on "Similar Properties"
  await page.locator(`button:text-is("Similar Properties")`).click();
  
  // Assert Terms and Conditions
  await assertTermsAndConditions(page)
  
  //--------------------------------
  // Act and Assert: Explore More-> Title
  //--------------------------------
  
  // Go to the home page
  await page.goto(process.env.URL_HOMEGENIUS)
  
  // Explore More-> Title
  await page.locator(`a:has-text("Explore More")`).click();
  await page.locator(`#nav-link-menu-container [data-testid="undecorate"]:Has-text("Title")`).click();
  let [page4] = await Promise.all([
      page.waitForEvent("popup"),
      page.locator(`button:Has-text("Acknowledge")`).click({delay:2000}),
  ]);
  await page.waitForTimeout(5000);
  
  // Click the "Accept All Cookies" button if visible
  try {
    await page4.getByRole(`button`, { name: `Accept All Cookies` }).click({ timeout: 1000 });
  } catch(e) {
    console.error(e);
  }
  
  // Click on "Terms of Use"
  const [page3] = await Promise.all([
      page4.waitForEvent("popup"),
      page4.locator(`a:has-text("Terms of Use")`).click({delay:2000}),
  ]);
  
  // Assertion - Validate the url is: /terms-conditions
  await expect(page3).toHaveURL(/terms-and-conditions/);
  
  // Assertion - Validate the content is the correct
  await expect(page3.locator(`h1:has-text("Terms and Conditions")`)).toBeVisible();
  
  // Close the page
  await page3.close()
  
 // Step 3. Validate 'abcbank' Terms and Conditions page
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  // Close the second page
  await page4.close()
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // --------------- Step 8 ---------------
  // --------------------------------------
  
  // Navigate to co - brand https://ga-portal.homegeniusrealestate.com/abcbank site and click on Terms and Conditions
  await page.goto(`https://uat-portal.homegeniusrealestate.com/abcbank`)
  
  // Go to "Terms and Conditions"
  await page.locator(`[data-testid="undecorate"] :text("Terms and Conditions")`).scrollIntoViewIfNeeded();
  const [page5] = await Promise.all([
    page.waitForEvent("popup"),
    page.locator(`[data-testid="undecorate"] :text("Terms and Conditions")`).click({delay:2000}),
  ]);
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // --------------- Step 9 ---------------
  // --------------------------------------
  
  // Validate the url is:https://homegeniusrealestate.com/abcbank/terms-and-conditions
  await expect(page5).toHaveURL('https://uat-portal.homegeniusrealestate.com/abcbank/terms-and-conditions');
  
  await expect(page5.locator(`h1:has-text("Terms and Conditions")`)).toBeVisible();
  
  // --------------- Step 10 ---------------
  // --------------------------------------
  
  // Click on all links on the page and validate they are working as expected (emails, phone numbers, apps, etc.)
  const div2 = await page5.$('main > div:first-child + div + div > div > div > div'); // Select the div element
  const links1 = await div2.$$eval('a', anchors => anchors.map(anchor => anchor.href)); // Find all 'a' tags and extract their href attributes
  
  console.log("Links to check: ", links1); // Output the array of URLs
  
  for (const link of links1) {
    if (link.startsWith('mailto:')) {
      // Validate email link
      const email = link.slice(7); // Remove 'mailto:' part
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        throw new Error(`Invalid email link: ${link}`);
      } else {
        console.log(`Valid email link: ${link}`);
      }
    } else if (link.startsWith('tel:')) {
      // Validate phone number link
      const phoneNumber = link.slice(4); // Remove 'tel:' part
      const phonePattern = /^\+?[1-9]\d{1,14}$/; // E.164 format
      if (!phonePattern.test(phoneNumber)) {
        throw new Error(`Invalid phone number link: ${link}`);
      } else {
        console.log(`Valid phone number link: ${link}`);
      }
    } else if (link.startsWith('app:')) {
      // Validate app link (assuming app links start with 'app:')
      const appLink = link.slice(4); // Remove 'app:' part
      if (!appLink) {
        throw new Error(`Invalid app link: ${link}`);
      } else {
        console.log(`Valid app link: ${link}`);
      }
    } else {
      // Validate normal URL
      const newPage = await context.newPage(); // Open a new page
      try {
        const response = await newPage.goto(link); // Navigate to the link
  
        // Check if the response status is OK (status code 200-299)
        if (!(response.status() >= 200 && response.status() < 300)) {
          throw new Error(`Invalid URL: ${link} (status code: ${response.status()})`);
        } else {
          console.log(`Valid URL: ${link}`);
        }
      } catch (error) {
        console.error(error.message);
        throw new Error("We have an invalid link. Error: ", error.message) // Exit with an error code
      } finally {
        await newPage.close(); // Close the new page
      }
    }
  }
});