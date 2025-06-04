import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_1183_consumer_wizard_buy_sell_a_property_option_non_branded_site", async () => {
 // Step 1. HGSE-1183 - (Consumer Wizard] Buy & Sell a Property Option (Non Branded Site)
  //--------------------------------
  // Arrange:
  //--------------------------------
  // constants
  // const searchAddress = {
  //   searchAddress: "38 Old Broadway, New Hyde Park, NY 11040",
  //   searchAddr2: "38 Old Broadway",
  //   addressLineOne: "38 Old Broadway",
  //   addressLineTwo: "New Hyde Park, NY 11040",
  //   addressAssert: "38 Old Broadway",
  //   addressAssert2: "New Hyde Park, NY 11040",
  //   bed: `1  Bed`,
  //   bath: `1  Bath`,
  //   sqft: `750  sqft`
  // }
  const searchAddress = {
    searchAddress: "231 Hardwicke Lane, Villanova, PA 19085",
    searchAddr2: "231 Hardwicke Ln",
    addressLineOne: "231 Hardwicke Ln",
    addressLineTwo: "Villanova, PA 19085",
    addressAssert: "231 Hardwicke Lane",
    addressAssert2: "Villanova, PA 19085",
    cityState: "VILLANOVA, PA",
    bed: `1  Bed`,
    bath: `1  Bath`,
    sqft: `750  sqft`
  }
  const email = process.env.DEFAULT_USER
  
  // Clean Up
  const {page: cleanUpPage} = await logInHomegeniusUser()
  try {
    await unclaimProperty(cleanUpPage, searchAddress)
  } catch (error) {
    console.log(error)
  }
  
  //--------------------------------------Step 1------------------------------------
  //--------------------------------------------------------------------------------
  // Navigate to valid URL and click on "Find an Agent" link from header.
  // const { page, context} = await goToHomegenius();
  const { browser, context } = await launch({
    ignoreHTTPSErrors: true,
  });
  await context.grantPermissions(['geolocation'], { origin: 'https://uat-portal.homegeniusrealestate.com/connect' });
  const page = await context.newPage();
  await page.goto('https://uat-portal.homegeniusrealestate.com/connect', { waitUntil: "domcontentloaded" });
  
  //--------------------------------
  // Act:
  //--------------------------------
  //--------------------------------------Step 2------------------------------------
  //--------------------------------------------------------------------------------
  
  await page.waitForTimeout(3000)
  if(await page.getByRole(`button`, { name: `Accept Cookies` }).count()){
    await page.getByRole(`button`, { name: `Accept Cookies` }).click();
  }
  // Click on "Find an Agent" button
  await page.locator(`[data-testid="undecorate"] #nav-hyperlink-Find\\ an\\ Agent`).click();
  await page.waitForSelector(`div:text("Find an Agent") >> nth=1`);
  const [page2] = await Promise.all([
    page.waitForEvent("popup"),
    page.locator(`div:text("Find an Agent")`).last().click({force: true}),
  ]);
  
  //--------------------------------------Step 3------------------------------------
  //--------------------------------------------------------------------------------
  // Enter valid credentials to login account
  // Fill in "Email"
  await page2.locator(`[aria-label="Email Address"]`).fill(process.env.DEFAULT_USER);
  
  // Fill in "Password"
  await page2.locator(`[aria-label="Password"]`).fill(process.env.UPDATED_PASS);
  
  // Click "Sign in"
  await page2.locator(`#next`).click();
  
  // Assertion - We see "Account" in the upper right hand corner
  await expect(page.locator(`button:has-text("Account")`)).toBeVisible()
  
  //--------------------------------------Step 4------------------------------------
  //--------------------------------------------------------------------------------
  // Select "No" to answer the question "Are you currently working with a real estate 
  // agent?" and click on "Continue" button
  await page.locator(`[id="no"]`).click();
  await page.locator(`button:text("Continue")`).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert Buy, Sell, Buy and Sell buttons
  await expect(page.locator(`[id="buy"]`)).toBeVisible();
  await expect(page.locator(`[id="sell"]`)).toBeVisible();
  await expect(page.locator(`[id="buy_and_sell"]`)).toBeVisible();
  
  // Assert Continue button is disabled
  await expect(page.locator(`button:text("Continue")`)).toBeDisabled();
  
  //--------------------------------------Step 5------------------------------------
  //--------------------------------------------------------------------------------
  // Select the option "Buy & Sell" and click on "Continue" button (Select state and 
  // county and click continue)
  
  // Select checkbox Buy & Sell
  await page.locator(`[id="buy_and_sell"]`).click();
  
  // Click on Continue
  await page.locator(`button:text("Continue")`).click();
  
  // Select state and county and click on continue
  await expect(async ()=> {
    await page.locator(`[placeholder="County, City, ZIP"]`).fill(`Villanova`);
    await page.waitForTimeout(1000);
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Tab')
    await expect(page.locator(`[title="${searchAddress.cityState}"]`)).toBeVisible({timeout: 3000});
  }).toPass({timeout: 30 * 1000});
  await page.locator(`button:text("Continue")`).click();
  
  // Assert question
  await expect(page.locator(`legend:text("What is the address of the property you would like to sell?")`)).toBeVisible();
  
  //--------------------------------------Step 6------------------------------------
  //--------------------------------------------------------------------------------
  // Enter the address in the search bar and click on checkbox beside, "Would you 
  // like to claim this property?" and then click on "Continue" button.
  
  
  // Fill in address and Select the property
  await expect(async ()=> {
    await page.locator(`[placeholder="Search Property Address"]`).fill(searchAddress.searchAddr2);
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Tab')
    await expect(page.locator(`[value="${searchAddress.addressLineOne} ${searchAddress.addressLineTwo}"]`)).toBeVisible({timeout: 3000});
  }).toPass({timeout: 30 * 1000}); 
  
  // Select checkbox "Would you like to claim this property?"
  await page.locator(`[value="false"]`).click();
  
  // Click Continue
  await page.locator(`button:text("Continue")`).click();
  
  // Assert All options are showing
  await expect(page.locator(
    `legend:text("What type of property are you looking to buy?")`
  )).toBeVisible();
  await expect(page.locator(
    `[name="propertyType"] ~ #single_family p:text("Single Family")`
  )).toBeVisible();
  await expect(page.locator(
    `[name="propertyType"] ~ #condo p:text("Condo")`
  )).toBeVisible();
  await expect(page.locator(
    `[name="propertyType"] ~ #townhouse p:text("Townhouse")`
  )).toBeVisible();
  await expect(page.locator(
    `[name="propertyType"] ~ #multi_family p:text("Multi-family")`
  )).toBeVisible();
  
  //--------------------------------------Step 7------------------------------------
  //--------------------------------------------------------------------------------
  // Select the desired options and click on "Continue" button
  
  // Select all the options
  await page.locator(`[value="Single Family"]`).click();
  await page.locator(`[value="Condo"]`).click();
  await page.locator(`[value="Townhouse"]`).click();
  await page.locator(`[value="Multi-family"]`).click();
  
  // Click on Continue
  await page.locator(`button:text("Continue")`).click();
  
  // Assert "What is the approximate price?"
  await expect(page.locator(
    `legend:text("What is the approximate price?")`
  )).toBeVisible();
  // Assert there's a display of price amount of estimated house value
  await expect(page.locator(
    `div:text("$400,000") + div:text("Estimated House Value")`
  )).toBeVisible();
  
  //--------------------------------------Step 8------------------------------------
  //--------------------------------------------------------------------------------
  // Select the desired price from slider and click on "Continue" button
  
  await page.locator(`[step="10000"]`).click({position: {x: 200, y: 0}});
  await page.locator(`button:text("Continue")`).click();
  
  // Assert "Please check all that apply or that interest you"
  await expect(page.locator(
    `legend:text("Please check all that apply or that interest you")`
  )).toBeVisible();
  // Assert all the options
  await expect(page.locator(
    `[name="searchInterests"] ~ #adult_communities p:text("Adult Communities")`
  )).toBeVisible();
  await expect(page.locator(
    `[name="searchInterests"] ~ [id="1st_time_homebuyer"] p:text("1st Time Homebuyer")`
  )).toBeVisible();
  await expect(page.locator(
    `[name="searchInterests"] ~ #military p:text("Military")`
  )).toBeVisible();
  await expect(page.locator(
    `[name="searchInterests"] ~ #new_construction p:text("New Construction")`
  )).toBeVisible();
  await expect(page.locator(
    `[name="searchInterests"] ~ #real_estate_investor p:text("Real Estate Investor")`
  )).toBeVisible();
  await expect(page.locator(
    `[name="searchInterests"] ~ #second_vacation_home p:text("Second/Vacation Home")`
  )).toBeVisible();
  await expect(page.locator(
    `[name="searchInterests"] ~ #other p:text("Other")`
  )).toBeVisible();
  await expect(page.locator(
    `[name="searchInterests"] ~ #none_of_the_above p:text("None of the Above")`
  )).toBeVisible();
  
  //--------------------------------------Step 9------------------------------------
  //--------------------------------------------------------------------------------
  // Select the desired options, and click on "Continue" button
  
  // Select all the options But NOT None of the Above
  await page.locator(`[value="Adult Communities"]`).click();
  await page.locator(`[value="1st Time Homebuyer"]`).click();
  await page.locator(`[value="Military"]`).click();
  await page.locator(`[value="New Construction"]`).click();
  await page.locator(`[value="Real Estate Investor"]`).click();
  await page.locator(`[value="Second/Vacation Home"]`).click();
  await page.locator(`[value="Other"]`).click();
  
  // Click Continue
  await page.locator(`button:text("Continue")`).click();
  
  // Assert we see "How soon are you looking to close"
  await expect(page.locator(
    `legend:text("How soon are you looking to close?")`
  )).toBeVisible();
  
  // Assert all the options
  await expect(page.locator(
    `#im_just_browsing p:text("I’m just browsing")`
  )).toBeVisible();
  await expect(page.locator(
    `[id="0_3_months"] p:text("0-3 Months")`
  )).toBeVisible();
  await expect(page.locator(
    `[id="3_6_months"] p:text("3-6 Months")`
  )).toBeVisible();
  await expect(page.locator(
    `[id="6_12_months"] p:text("6-12 Months")`
  )).toBeVisible();
  await expect(page.locator(
    `[id="12_months"] p:text("12+ Months")`
  )).toBeVisible();
  
  //--------------------------------------Step 10------------------------------------
  //--------------------------------------------------------------------------------
  // Select the desired option, and click on "Continue" button
  
  // Select 3-6 months
  await page.locator(`[id="3_6_months"] p:text("3-6 Months")`).click();
  
  // Click on Continue
  await page.locator(`button:text("Continue")`).click();
  
  // Assert header "Please provide your contact information which we will share with your selected agent"
  await expect(page.locator(
    `legend:text("Please provide your contact information which we will share with your selected agent")`
  )).toBeVisible();
  
  // Assert checkbox message
  await expect(page.locator(
    `div:text("I provide express written authorization for homegenius Real Estate to contact me using an automatic telephone dialing system, pre-recorded or artificial voice message and/or text SMS/MMS (charges my apply), at the phone number provided by me for the purposes of sending me advertisements and telemarketing calls and text messages, even if my phone number is on any corporate, state or federal Do Not Call Registry. I understand that I am not required to give authorization as a condition of obtaining any services from homegenius Real Estate.")`
  )).toBeVisible();
  
  // Assert message above Continue button
  await expect(page.locator(
    `div:text("By clicking continue I agree to the Privacy Policy and Terms and Conditions. I agree to receive documents electronically subject to the terms and conditions of the Consent to Use of Electronic Records and Signatures and acknowledge receipt of this (these) state disclosure(s).")`
  )).toBeVisible();
  
  // Clear all prefill info on the input fields to assert continue button
  await page.locator(`label:text("First Name") + input`).fill(``);
  await page.locator(`label:text("Last Name") + input`).fill(``);
  await page.locator(`label:text("Phone Number") + input`).fill(``);
  await page.locator(`label:text("Email") + input`).fill(``);
  
  // Assert Continue button is disabled
  await expect(page.locator(`button:text("Continue")`)).toBeDisabled();
  
  //--------------------------------------Step 11------------------------------------
  //--------------------------------------------------------------------------------
  // Enter Agent contact information, select checkbox and click continue
  
  // Fill back in information
  await page.locator(`label:text("First Name") + input`).fill(`QAW`);
  await page.locator(`label:text("Last Name") + input`).fill(`Tester`);
  await page.locator(`label:text("Phone Number") + input`).fill(`4153214321`);
  await page.locator(`label:text("Email") + input`).fill(`homegenius@qawolfworkflows.com`);
  
  // Assert columns are prefill with correct information
  await expect(page.locator(`label:text("First Name") + input`)).toHaveValue(`QAW`);
  await expect(page.locator(`label:text("Last Name") + input`)).toHaveValue(`Tester`);
  await expect(page.locator(`label:text("Phone Number") + input`)).toHaveValue(`4153214321`);
  await expect(page.locator(`label:text("Email") + input`)).toHaveValue(`homegenius@qawolfworkflows.com`);
  
  // Click on authorization checkbox
  await page.locator(`button [name="consumerInformation.isTcpaAccepted"]`).check();
  
  // Click on Continue
  await page.locator(`button:text("Continue")`).click();
  
  // Assert Congratulations on starting journey message
  await expect(page.locator(
    `legend:text("Congratulations on starting your journey")`
  )).toBeVisible();
  
  // Assert Calendar and Phone options
  await expect(page.locator(
    `p:text("Schedule a Time to Talk to a Concierge")`
  )).toBeVisible();
  await expect(page.locator(
    `p:text("Contact Me") + p:text("(Concierge calls during business hours, typically within 24 hours)")`
  )).toBeVisible();
  
  //--------------------------------------Step 12------------------------------------
  //--------------------------------------------------------------------------------
  // Select Calendar icon, or Phone icon, if calendar icon is selected follow step 1 if not step 2
  const options = [`1`, `2`];
  const randomOption = faker.datatype.number({max: options.length-1});
  
  // Select a journey based on {randomOption}
  try {
    // -- Option 1) Choose Date and time, click next, enter details
    // -- Name, email, phone, please share anything that will help prepare with our meeting
    // -- Click on Schedule Event
    expect(options[randomOption]).toBe(`1`, {timeout: 3000});
    // Click on Calendar option 
    await page.locator(
      `p:text("Schedule a Time to Talk to a Concierge")`
    ).click();
  
    // Click on Continue
    await page.locator(`button:text("Continue")`).click();
  
    // Click on the first available date on the calendar
    const iframe = page.frameLocator(`[title="Calendly Scheduling Page"]`);
    await iframe.locator(`[aria-label*="Times available"]`).first().click();
    // Grab date for later assertion
    const dateSelected = await iframe.locator(`[aria-label*="Times available"]`).first().innerText();
    console.log(dateSelected)
  
    // Click on the first available time for that date
    await iframe.locator(`[data-container="time-button"]`).first().click();
  
    // Grab date for later assertion
    const timeSelected = await iframe.locator(`[data-container="time-button"]`).first().innerText();
    console.log(timeSelected)
  
    // Click on Next
    await iframe.locator(`button:text("Next")`).click();
  
    // Clear details and refill in information
    await iframe.locator(`[name="full_name"]`).fill(``);
    await iframe.locator(`[name="email"]`).fill(``);
    // await iframe.locator(`[name="phone_number"]`).fill(``);
    await iframe.locator(`[name="full_name"]`).fill(`QAW Tester`);
    await iframe.locator(`[name="email"]`).fill(`homegenius@qawolfworkflows.com`);
    // await iframe.locator(`[name="phone_number"]`).fill(`4153214321`);
  
    // Fill in text on Please share anything that will help prepare for our meeting.
    await iframe.locator(`[name="question_0"]`).fill(`Want a house with a pool`)
  
    // Get inbox ready to receive email
    const { waitForMessages } = await getInbox({
      address: email,
    });
    const after = new Date();
  
    // Click on schedule event
    await iframe.locator(`button:has-text("Schedule Event")`).click();
  
    // Assert calendar invite email
    const messages = await waitForMessages({ after, timeout: 30_000 });
    const emailReceived = messages.find((message) =>
      message.subject.includes("Confirmed")
    );
    expect(emailReceived).toBeTruthy();
    console.log(emailReceived)
  
    // Assert Date is correctly indicated on email
    const dateAssert = dateFns.format(new Date(), `MMMM ${dateSelected}, yyy`)
    const dayOfWeek = dateFns.format(new Date(dateAssert), "EEEE");
    expect(emailReceived.subject).toBe(`Confirmed: Test Event with Craig Lasson on ${dayOfWeek}, ${dateAssert}`)
  
    // Assert Time is correctly indicated on email
    expect(emailReceived.html).toContain(timeSelected)
  
    // Assert contains links to calendly to cancel, invite others, notify, and reschedule
    const emailReceivedUrls = emailReceived.urls.join('');
    console.log(emailReceivedUrls);
    expect(emailReceivedUrls).toContain(`https://calendly.com/cancellations`);
    expect(emailReceivedUrls).toContain(`https://calendly.com/invitees`);
    expect(emailReceivedUrls).toContain(`https://calendly.com/notification_subscriptions`);
    expect(emailReceivedUrls).toContain(`https://calendly.com/reschedulings`);
  } catch {
    // Option 2) Phone option
    expect(options[randomOption]).toBe(`2`, {timeout: 3000});
    
    // Click on Phone option 
    await page.locator(
      `p:text("Contact Me")`
    ).click();
  
    // Click on Continue
    await page.locator(`button:text("Continue")`).click();
  
    // Assert Thank you message
    await expect(page.locator(
      `div:text("Thank You!") + div:text("Your request was sent successfully. We will be in contact with you soon!")`
    )).toBeVisible();
  }
  
  //--------------------------------------Step 13------------------------------------
  //--------------------------------------------------------------------------------
  // Click on Finish claiming your property button
  await page.waitForTimeout(10_000);
  await page.locator(`button:text("Finish Claiming Your Property")`).click();
  
  // Assert user should be redirected to property page
  await expect(page.locator(`:text-is("${searchAddress.addressAssert}")`)).toBeVisible();
  
});