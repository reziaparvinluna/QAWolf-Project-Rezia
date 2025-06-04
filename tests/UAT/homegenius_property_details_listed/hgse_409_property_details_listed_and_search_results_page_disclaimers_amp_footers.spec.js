import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_409_property_details_listed_and_search_results_page_disclaimers_amp_footers", async () => {
 // Step 1. HGSE-409 - Property Details Listed and Search Results Page: Disclaimers &amp; Footers
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const date = new Date();
  const disclaimerMessage = `© ${date.getFullYear()} Radian Group Inc. All Rights Reserved. 550 East Swedesford Road, Suite 350, Wayne, PA 19087. Real estate services provided by homegenius Real Estate LLC and homegenius Real Estate Inc. (collectively dba homegenius Real Estate), each a subsidiary of Radian Group Inc. 7730 South Union Park Avenue, Suite 550, Midvale, UT 84047. Tel: 877-500-1415. homegenius Real Estate LLC and its wholly owned subsidiary are licensed in every state and the District of Columbia. homegenius Real Estate makes no express or implied warranty respecting the accuracy of room condition scoring provided through homegeniusIQ®, property description, condition or measurements (including square footage) and assume no responsibility for errors or omissions.`;
  const floridaMessage =
    "* Florida ONLY: Radian Instant Rebate is consistent with the Butler Rebate as permitted in the Florida Supreme Court decision Chicago Title Insurance Co. v. Butler, 770 So. 2d 1210, 1221, 2000 Fla. LEXIS 2034, *32.";
  const allOtherMessage = `All other states: National averages of competitor standard rates as of ${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}. Potential savings will vary. Annual Premium for basic policy; coverage and discounts may vary and may not be available in all states and situations.`;
  
  //--------------------------------------Step 1------------------------------------
  //--------------------------------------------------------------------------------
  // LOGIN-HGCOM-3050
  // Logged successfully
  const { page, context } = await logInHomegeniusUser();
  
  /** Click the 'Find a Home' link in the navigation menu */
  await page.getByRole("link", { name: "Find a Home", exact: true }).click();
  await page.waitForTimeout(5000);
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  //--------------------------------------Step 2------------------------------------
  //--------------------------------------------------------------------------------
  // Search a city name on Basic Search Bar as per requirement
  // Detailed search page should be open
  
  // Fill in two letters
  await page.getByPlaceholder("Address, city, neighborhood,").first().fill("Ne");
  
  // Click on New York
  await page.getByRole(`button`, { name: `New York` }).click({ delay: 100 });
  
  // Click on Search
  await page
    .getByRole(`button`, { name: `Search` })
    .first()
    .click({ delay: 5000 });
  
  // Scroll to the footers
  await page.locator(`[alt="homegenius logo white"]`).scrollIntoViewIfNeeded();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  //--------------------------------------Step 3------------------------------------
  //--------------------------------------------------------------------------------
  // Verify disclaimers and footers on the Search Results page
  // © 2024 homegenius Inc. All Rights Reserved. 550 East Swedesford Road, Suite 350,
  // Wayne, PA 19087. Real estate services provided by homegenius Real Estate LLC and
  // homegenius Real Estate Inc. (collectively dba homegenius Real Estate), each a
  // subsidiary of homegenius Inc. 7730 South Union Park Avenue, Suite 400, Midvale,
  // UT 84047. Tel: 877-500-1415. homegenius Real Estate LLC and its wholly owned
  // subsidiary are licensed in every state and the District of Columbia.
  // homegenius Real Estate makes no express or implied warranty respecting the
  // accuracy of room condition scoring provided through homegeniusIQ, property
  // description, condition or measurements (including square footage) and assume no
  // responsibility for errors or omissions.
  // Disclaimers and footers are appearing in bottom of the page
  
  // --- Assert Footer Section
  // Assert Logo
  await expect(async () => {
    await expect(page.locator(`[alt="homegenius logo white"]`)).toHaveScreenshot(
      "footer_test",
      { maxDiffPixelRatio: 0.01 },
    );
  }).toPass({ timeout: 30_000 });
  
  // Assert Ownership Message
  await expect(
    page.getByText(`Website provided and owned by homegenius Real Estate`),
  ).toBeVisible();
  
  // Assert contact info
  await expect(
    page.locator(
      `div:text("Contact Us") + div:text("By Mail: 7730 S. Union Park Avenue, Suite 550, Midvale, UT 84047") + div:text("By Phone: 877.500.1415")`,
    ),
  ).toBeVisible();
  
  // Assert Texas Real Estate Info and Consumer Proction Notice
  await expect(
    page.getByRole(`link`, {
      name: `Texas Real Estate Commission Information About Brokerage Services`,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole(`link`, {
      name: `Texas Real Estate Commission Consumer Protection Notice`,
    }),
  ).toBeVisible();
  
  // Assert New York State Fair Housing Notice and SOP
  await expect(
    page.getByRole(`link`, { name: `New York State Fair Housing` }),
  ).toBeVisible();
  await expect(
    page.getByRole(`link`, { name: `New York State Standard` }),
  ).toBeVisible();
  
  // Assert Notice of Reasonable Accomodations for Propsective Tenants
  await expect(
    page.getByRole(`link`, { name: `Notice of Reasonable` }),
  ).toBeVisible();
  
  // Assert Privacy Policy
  await expect(page.getByRole(`link`, { name: `Privacy Policy` })).toBeVisible();
  
  // Assert Terms and Conditions
  await expect(
    page.getByRole(`link`, { name: `Terms and Conditions` }),
  ).toBeVisible();
  
  // Assert Consumer Complaint Policy
  await expect(
    page.getByRole(`link`, { name: `Consumer Complaint Policy` }),
  ).toBeVisible();
  
  // Assert Licensing and Disclosure Information
  await expect(
    page.getByRole(`link`, { name: `Licensing and Disclosure` }),
  ).toBeVisible();
  
  // Assert Cookie Preferences
  await expect(
    page.getByRole(`button`, { name: `Cookie Preferences` }),
  ).toBeVisible();
  
  // Assert Title Insurance Privacy Notice
  await expect(
    page.getByRole(`link`, { name: `Title Insurance Privacy Notice` }),
  ).toBeVisible();
  
  // Assert Do not sell or share my personal information
  await expect(
    page.getByRole(`link`, { name: `Do not sell or share my` }),
  ).toBeVisible();
  
  // Assert footer message
  await expect(page.locator(`div:text("${disclaimerMessage}")`)).toBeVisible();
  
  //--------------------------------------Step 4------------------------------------
  //--------------------------------------------------------------------------------
  // Select a property card from search result page
  // Navigated to property listed page
  
  // Click on the First property listed
  await page.locator(`[data-testid="undecorate"]:has-text("$")`).first().click();
  
  //--------------------------------------Step 5------------------------------------
  //--------------------------------------------------------------------------------
  // Verify disclaimers and footers on the Property Details page
  // © 2024 homegenius Inc. All Rights Reserved. 550 East Swedesford Road, Suite 350,
  // Wayne, PA 19087. Real estate services provided by homegenius Real Estate LLC and
  // homegenius Real Estate Inc. (collectively dba homegenius Real Estate), each a
  // subsidiary of homegenius Inc. 7730 South Union Park Avenue, Suite 400, Midvale,
  // UT 84047. Tel: 877-500-1415. homegenius Real Estate LLC and its wholly owned
  // subsidiary are licensed in every state and the District of Columbia. homegenius
  // Real Estate makes no express or implied warranty respecting the accuracy of room
  // condition scoring provided through homegeniusIQ, property description, condition
  // or measurements (including square footage) and assume no responsibility for errors
  // or omissions.
  // Disclaimers and footers are appearing in bottom of the page
  
  // --- Assert Footer Section on Property details page
  // Assert Logo
  await expect(async () => {
    await page.getByRole(`button`, { name: `close` }).click();
    await expect(page.locator(`[alt="homegenius logo white"]`)).toHaveScreenshot(
      "footer_test_detailPage",
      { maxDiffPixelRatio: 0.01 },
    );
  }).toPass({ timeout: 30_000 });
  
  // Assert Ownership Message
  await expect(
    page.getByText(`Website provided and owned by homegenius Real Estate`),
  ).toBeVisible();
  
  // Assert contact info
  await expect(
    page.locator(
      `div:text("Contact Us") + div:text("By Mail: 7730 S. Union Park Avenue, Suite 550, Midvale, UT 84047") + div:text("By Phone: 877.500.1415")`,
    ),
  ).toBeVisible();
  
  // Assert Texas Real Estate Info and Consumer Proction Notice
  await expect(
    page.getByRole(`link`, {
      name: `Texas Real Estate Commission Information About Brokerage Services`,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole(`link`, {
      name: `Texas Real Estate Commission Consumer Protection Notice`,
    }),
  ).toBeVisible();
  
  // Assert New York State Fair Housing Notice and SOP
  await expect(
    page.getByRole(`link`, { name: `New York State Fair Housing` }),
  ).toBeVisible();
  await expect(
    page.getByRole(`link`, { name: `New York State Standard` }),
  ).toBeVisible();
  
  // Assert Notice of Reasonable Accomodations for Propsective Tenants
  await expect(
    page.getByRole(`link`, { name: `Notice of Reasonable` }),
  ).toBeVisible();
  
  // Assert Privacy Policy
  await expect(page.getByRole(`link`, { name: `Privacy Policy` })).toBeVisible();
  
  // Assert Terms and Conditions
  await expect(
    page.getByRole(`link`, { name: `Terms and Conditions` }),
  ).toBeVisible();
  
  // Assert Consumer Complaint Policy
  await expect(
    page.getByRole(`link`, { name: `Consumer Complaint Policy` }),
  ).toBeVisible();
  
  // Assert Licensing and Disclosure Information
  await expect(
    page.getByRole(`link`, { name: `Licensing and Disclosure` }),
  ).toBeVisible();
  
  // Assert Cookie Preferences
  await expect(
    page.getByRole(`button`, { name: `Cookie Preferences` }),
  ).toBeVisible();
  
  // Assert Title Insurance Privacy Notice
  await expect(
    page.getByRole(`link`, { name: `Title Insurance Privacy Notice` }),
  ).toBeVisible();
  
  // Assert Do not sell or share my personal information
  await expect(
    page.getByRole(`link`, { name: `Do not sell or share my` }),
  ).toBeVisible();
  
  // Assert Florida ONLY message
  await expect(page.locator(`p:text("${floridaMessage}")`)).toBeVisible();
  
  // Assert All other states mesage
  await expect(page.locator(`p:text("${allOtherMessage}")`)).toBeVisible();
  
  // Assert footer message
  await expect(page.locator(`div:text("${disclaimerMessage}")`)).toBeVisible();
  
});