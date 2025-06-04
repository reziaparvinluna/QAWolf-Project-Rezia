import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_3296_simulated_mygp_claimed_view_plan_a_renovation_section_no_simulated_mygp", async () => {
 // Step 1. HGSE-3296 Simulated mygp: Claimed View Plan a Renovation Section (no simulated mygp)
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  // This is an on market property
  const searchAddress = {
    searchAddress: "307 S Wayne Avenue, Wayne, PA 19087",
    searchAddr2: "307 S Wayne Avenue",
    addressLineOne: "307 S Wayne Ave",
    addressLineTwo: "Wayne, PA 19087",
    propertyType: "Single Family",
    bed: "5",
    bath: "3",
  }
  
  // Constants
  const filePaths = [
    `/home/wolf/team-storage/room1.jpg`,
    `/home/wolf/team-storage/room2.jpg`,
    `/home/wolf/team-storage/room3.jpg`,
  ];
  const elementSelector = `a:text("Click to browse")`;
  
  // 1) Login to QA/UAT/PROD
  // https://qa-portal.homegeniusrealestate.com/
  // https://uat-portal.homegeniusrealestate.com/
  // Application is launched
  
  // Login
  const {page, context} = await logInHomegeniusUser();
  
  // Clean Up
  try {
    await unclaimProperty(page, searchAddress)
  } catch (error) {
    console.log(error)
  }
  
  //--------------------------------
  // Act:
  //--------------------------------
  // 2) Make a search, navigate and claim a home
  // Designs must match Figma: Simulated mygp: 
  // https://www.figma.com/design/uMkkPq4kPyyxJwQN2mUB3j/Simulated-geniusprice?node-id=1526-122955&t=xBGtQynlSSGdECjf-4
  // Clamed a home
  
  // claim a property 
  await claimProperty(page, searchAddress)
  
  // Go though edit steps to see renovation studio
  await triggerSimMyGp(page)
  
  // 3) I will see a new section on the Claimed Home View labeled Plan a Renovation
  // a. The section is below the Property History section
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // Assert Plan a Renovation section is displaying and follows Property History section
  await expect(page.locator(
    `div:has([id="CLAIMED_VIEW_HISTORY"]) + div:has([id="CLAIMED_RENOVATION"]):has-text("Plan a Renovation")`
  )).toBeVisible()
  
  // 4) Within the section includes:
  // a. Header: Plan a Renovation
  // b. Image/icon: see Figma
  // c. Body text, copy is as follows: "Interested in doing renovations to 
  // your property? Use the Renovation Studio to see how those updates may 
  // impact your valuation estimate!"
  // d. A button for "Get Started"
  
  // Assert Header
  await expect(page.locator(
    `[id="CLAIMED_RENOVATION"]:has-text("Plan a Renovation")`
  )).toBeVisible();
  
  // Assert Image
  await expect(page.locator(
    `[id="CLAIMED_RENOVATION"] svg`
  )).toHaveScreenshot('plan_renovation', {maxDiffPixelRatio: 0.01})
  
  // Assert Body Text
  await expect(page.locator(
    `[id="CLAIMED_RENOVATION"] div:text("Interested in doing renovations to your property? Use the Renovation Studio to see how those updates may impact your valuation estimate!")`
  )).toBeVisible()
  
  // Assert Get Started Button
  await expect(page.getByRole(`button`, { name: `Get Started` }).first()).toBeVisible();
  
 // Step 2. Generate a myhomegenius price and verify "Get Started" button at top
  //--------------------------------
  // Arrange:
  //--------------------------------
  // 5) Within the section includes:
  // Applicability: Disabled (grayed out) if I have claimed the home, but 
  // have not generated a mygeniusprice (skipping the edit facts, upload photos, 
  // and selecting comparables), otherwise enable.
   
  // 6) Click on Skip and Close button on Edit Home Facts page
  // Click Skip and Close, reload page, you will see "Get Started" renovation
  // Studio in the bottom on the Claimed view
  
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Click on Edit on Home Facts
  await page.getByRole(`button`, { name: `edit Edit` }).click();
  
  // Click on Continue
  await page.getByRole(`button`, { name: `Continue` }).click({delay: 3000});
  
  // Click on Skip and Close
  await page.getByRole(`button`, { name: `Skip and Close` }).click();
  
  // Click on Close
  await page.getByRole(`button`, { name: `Close`, exact: true }).click();
  
  // Reload Page
  await page.reload();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert Renovation message at top
  await expect(page.locator(
    `[id="CLAIMED_VIEW_PRICES"] + div:has-text("Ready for your next home project? Use the Renovation Studio to see how those updates may impact your valuation estimate!")`
  )).toBeVisible();
  
  // Assert Renovation image at top
  await expect(page.locator(
    `[id="CLAIMED_VIEW_PRICES"] + div div div div:has-text("Ready") svg`
  )).toHaveScreenshot('plan_renovation_top', {maxDiffPixelRatio: 0.01})
  
  // Assert Renovation Get Started button at top
  await expect(page.locator(
    `[id="CLAIMED_VIEW_PRICES"] + div div div div div div button:text("Get Started")`
  )).toBeVisible();
  
  // Assert Plan a Renovation section is still displaying
  // Assert Header
  await expect(page.locator(
    `[id="CLAIMED_RENOVATION"]:has-text("Plan a Renovation")`
  )).toBeVisible();
  
  // Assert Image
  await expect(page.locator(
    `[id="CLAIMED_RENOVATION"] svg`
  )).toHaveScreenshot('plan_renovation', {maxDiffPixelRatio: 0.01})
  
  // Assert Body Text
  await expect(page.locator(
    `[id="CLAIMED_RENOVATION"] div:text("Interested in doing renovations to your property? Use the Renovation Studio to see how those updates may impact your valuation estimate!")`
  )).toBeVisible()
  
  // Assert Get Started Button
  await expect(page.locator(
    `[id="CLAIMED_RENOVATION"] button:text("Get Started")`
  )).toBeVisible();
   
  // 7) Click Next button on Edit Home Facts page
  // To see the Renovation Message at the top on the Claimed view user
  // should click Next on Edit Home Facts page
  
  // Click on Edit on Home Facts
  await page.getByRole(`button`, { name: `edit Edit` }).click();
  
  // Click on Continue
  await page.getByRole(`button`, { name: `Continue` }).click({delay: 3000});
  
  // Click on Next
  await page.getByRole(`button`, { name: `Next` }).click();
  
  // Click the "Done" button
  await page.getByRole(`button`, { name: `Done` }).click();
  // Click on Continue to property view
  await page.getByRole(`button`, { name: `Continue to property view` }).click();
  // Assert Renovation Studio tab
  await expect(page.getByRole(`button`, { name: `Renovation Studio` })).toBeVisible();
  
  // Assert Renovation message at top
  await expect(page.locator(
    `[id="CLAIMED_VIEW_PRICES"] + div:has-text("Ready for your next home project? Use the Renovation Studio to see how those updates may impact your valuation estimate!")`
  )).toBeVisible();
  
  // Assert Renovation image at top
  await expect(page.locator(
    `[id="CLAIMED_VIEW_PRICES"] + div div div div:has-text("Ready") svg`
  )).toHaveScreenshot('plan_renovation_top', {maxDiffPixelRatio: 0.01})
  
  // Assert Renovation Get Started button at top
  await expect(page.locator(
    `[id="CLAIMED_VIEW_PRICES"] + div div div div div div button:text("Get Started")`
  )).toBeVisible();
  
  // Assert Plan a Renovation section is still displaying
  // Assert Header
  await expect(page.locator(
    `[id="CLAIMED_RENOVATION"]:has-text("Plan a Renovation")`
  )).toBeVisible();
  
  // Assert Image
  await expect(page.locator(
    `[id="CLAIMED_RENOVATION"] svg`
  )).toHaveScreenshot('plan_renovation', {maxDiffPixelRatio: 0.01})
  
  // Assert Body Text
  await expect(page.locator(
    `[id="CLAIMED_RENOVATION"] div:text("Interested in doing renovations to your property? Use the Renovation Studio to see how those updates may impact your valuation estimate!")`
  )).toBeVisible()
  
  // Assert Get Started Button
  await expect(page.locator(
    `[id="CLAIMED_RENOVATION"] button:text("Get Started")`
  )).toBeVisible();
});