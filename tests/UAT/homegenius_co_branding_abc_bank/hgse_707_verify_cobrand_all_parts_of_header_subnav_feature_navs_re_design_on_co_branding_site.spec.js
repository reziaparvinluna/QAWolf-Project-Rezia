import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_707_verify_cobrand_all_parts_of_header_subnav_feature_navs_re_design_on_co_branding_site", async () => {
 // Step 1. HGSE-707 - Verify Cobrand all parts of header, subnav, feature-navs re-design on Co-Branding site
  //--------------------------------
  // Arrange:
  //--------------------------------
  const coBrandUrl = "https://uat-portal.homegeniusrealestate.com/headertest1";
  
  //--------------------------------
  // Act:
  //--------------------------------
  //--------------------------------------Step 1------------------------------------
  //--------------------------------------------------------------------------------
  // Go to co-branding site
  // https://uat-portal.homegeniusrealestate.com/headertest1
  // Go to Home page
  
  const { browser, context } = await launch({
    ignoreHTTPSErrors: true,
  });
  await context.grantPermissions(["geolocation"], { origin: coBrandUrl });
  const page = await context.newPage();
  await page.goto(coBrandUrl);
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  //--------------------------------------Step 2------------------------------------
  //--------------------------------------------------------------------------------
  // Check the left side of the top header url link back to the client we are co-branding with
  // <-Back to abcbank.com is displaying on left side of the top header
  // 	▪	This applies to all of the pages on the site
  await expect(page.locator(`#header-logo a:has-text("test")`)).toBeVisible();
  
  //--------------------------------------Step 3------------------------------------
  //--------------------------------------------------------------------------------
  // Check an arrow <-next to the embedded url link
  // Figma: https://www.figma.com/file/MDiXQwPpkyNegmRR7zLsDn/Co-Branded-Search?type=design&node-id=846-112899&mode=design&t=dfqpQIwK04DqREn7-4
  // Verify <- an arrow next to the embedded url link
  // 	▪	Arrow color should be customized the secondary colorbased on the Figma design
  // 	▪	Selecting the arrow will navigate the user back to the client's page url to be provided by the company
  
  // Assert arrow image
  await expect(
    page.locator(`#header-logo a span:text("arrow_back")`),
  ).toHaveScreenshot("arrow_back", { maxDiffPixelRatio: 0.1 });
  
  // Assert arrow color
  await expect(page.locator(`#header-logo a span:text("arrow_back")`)).toHaveCSS(
    "color",
    "rgb(255, 255, 255)",
  );
  
  // Accept cookies if needed
  try {
    await page.getByRole(`button`, { name: `Accept Cookies` }).click();
  } catch (e) {
    console.log(e)
  }
  
  // Close notification modal
  try {
    await page.getByRole(`button`, { name: `Maybe Later` }).click({timeout: 5000});
  } catch (e) {
    console.log(e);
  }
  
  // Click on Arrow
  let [page2] = await Promise.all([
    page.waitForEvent("popup"),
    page.locator('#header-logo a span:text("arrow_back")').click(),
  ]);
  
  // Assert to navigate to "https://www.radian.com/"
  expect(page2.url()).toBe(`https://www.radian.com/`);
  await page2.close();
  
  //--------------------------------------Step 4------------------------------------
  //--------------------------------------------------------------------------------
  // Check the co-branded client logo
  // Verify the specific links like Products, Support, etc displays top of the Logo and the right side of the header
  // 	▪	The titles and links will be client specific and provided by the client
  // 	▪	There will be a limit here of the number of links that can be provided from the client
  // Assert Logo
  await expect(page.locator(`#header-logo img`)).toHaveScreenshot("logo", {
    maxDiffPixelRatio: 0.1,
  });
  
  // Rezia Parvin confirmed it's expected to not see buttons on top of the logo since this is a Demo co-brand client
  
  //--------------------------------------Step 5------------------------------------
  //--------------------------------------------------------------------------------
  // Check the Home search header design without login
  // 	▪	There are 4 options on the left side of header:
  // There are 4 options: -Claim a Home-Find a Home-Find an Agent-Explore More1) Title 2) Insurance3) Education Center4) geniusprice5) FAQs
  // "SIGN IN OR CREATE AN ACCOUNT" displays right side of the header, before the logo
  // 	▪	Verify the co-branded client logo displays right side of the header
  // 	▪	homegenius Real Estate
  
  // Assert Claim a Home button
  await expect(page.locator(`a div:text("Claim a Home")`)).toBeVisible();
  
  // Assert Find a Home button
  await expect(page.locator(`a div:text("Find a Home")`)).toBeVisible();
  
  // Assert Find an Agent button
  await expect(page.locator(`a div:text("Find an Agent")`)).toBeVisible();
  
  // Assert Explore More button
  await expect(page.locator(`a:text("Explore More")`)).toBeVisible();
  
  // Click on Explore More dropdown
  await page.locator(`a:text("Explore More")`).click();
  
  // Assert Title, Insurance, Education, geniusprice, FAQs
  await expect(page.locator(`#NavLinkSubMenu a:has-text("Title")`)).toBeVisible();
  await expect(
    page.locator(`#NavLinkSubMenu a:has-text("Insurance")`),
  ).toBeVisible();
  await expect(
    page.locator(`#NavLinkSubMenu a:has-text("Education")`),
  ).toBeVisible();
  await expect(
    page.locator(`#NavLinkSubMenu a:has-text("geniusprice")`),
  ).toBeVisible();
  await expect(page.locator(`#NavLinkSubMenu a:has-text("FAQs")`)).toBeVisible();
  
  // Click on Explore More dropdown
  await page.locator(`a:text("Explore More")`).click();
  
  // Assert Sign In button
  await expect(
    page.locator(`#header-auth-container button:text("SIGN IN")`),
  ).toBeVisible();
  
  // Assert homegenius logo
  await expect(page.locator(`#subheader-logo`)).toHaveScreenshot("hg_logo", {
    maxDiffPixelRatio: 0.2,
  });
  
 // Step 2. Verify Cobrand Parts After Login
  
  //--------------------------------------Step 6------------------------------------
  //--------------------------------------------------------------------------------
  // Check the Home search header design after login
  // There are options: -Claim a Home-Find a Home-Find an Agent-Explore More1) Title 2) Insurance3) Education Center4) geniusprice5) FAQs
  // Verify ACCOUNT-(My Profile and Notifications) displays right side of the header, before the logo
  // 	▪	Verify the co-branded client logo displays right side of the header
  // 	▪	homegenius Real Estate
  
  // Click on Sign in 
  const [loginPage] = await Promise.all([
    page.waitForEvent("popup"),
    page.locator(`#login-btn`).click(),
  ]);
  
  // Fill in "Email"
  await loginPage.locator(`[aria-label="Email Address"]`).fill(process.env.DEFAULT_USER);
  
  // Fill in "Password"
  await loginPage.locator(`[aria-label="Password"]`).fill(process.env.UPDATED_PASS);
  
  // Click "Sign in"
  await loginPage.locator(`#next`).click();
  
  // Assert Claim a Home button
  await expect(page.locator(
    `a div:text("Claim a Home")`
  )).toBeVisible();
  
  // Assert Find a Home button
  await expect(page.locator(
    `a div:text("Find a Home")`
  )).toBeVisible();
  
  // Assert Find an Agent button
  await expect(page.locator(
    `a div:text("Find an Agent")`
  )).toBeVisible();
  
  // Assert Explore More button
  await expect(page.locator(
    `a:text("Explore More")`
  )).toBeVisible();
  
  // Click on Explore More dropdown
  await page.locator(`a:text("Explore More")`).click();
  
  // Assert Title, Insurance, Education, geniusprice, FAQs
  await expect(page.locator(
    `#NavLinkSubMenu a:has-text("Title")`
  )).toBeVisible();
  await expect(page.locator(
    `#NavLinkSubMenu a:has-text("Insurance")`
  )).toBeVisible();
  await expect(page.locator(
    `#NavLinkSubMenu a:has-text("Education")`
  )).toBeVisible();
  await expect(page.locator(
    `#NavLinkSubMenu a:has-text("geniusprice")`
  )).toBeVisible();
  await expect(page.locator(
    `#NavLinkSubMenu a:has-text("FAQs")`
  )).toBeVisible();
  
  // Click on Explore More dropdown
  await page.locator(`a:text("Explore More")`).click();
  
  // Assert Account button
  await expect(page.locator(
    `#header-auth-container button:text("ACCOUNT")`
  )).toBeVisible();
  
  // Assert homegenius logo
  await expect(page.locator(
    `#subheader-logo`
  )).toHaveScreenshot("hg_logo2", { maxDiffPixelRatio: 0.2 })
  
});