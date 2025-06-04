import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_1437_desktop_view_verify_photo_carousel_on_public_view", async () => {
 // Step 1. HGSE-1437 [Desktop View] Verify Photo Carousel on Public View
  //--------------------------------
  // Step1:
  //--------------------------------
  const {page,context} = await logInHomegeniusUser()
  
  // hgse 843
  const comingSoon = "2006 Rice Mill Drive Katy, TX 77493"
  await page.locator(`[placeholder="Enter an Address"]`).first().fill(comingSoon);
  await page.locator(`li:has-text("2006 Rice Mill Dr")`).first().click()
  await page.locator('div').filter({ hasText: /^Claim this homeclose$/ }).getByRole('button').click();
  
  // Assert street view and aerial view
  await expect(async () => {
    await page.waitForTimeout(1000)
    // // Capture the screenshot while maintaining the hover state
    await page.locator(`img[src$="Rice-Mill-Drive-0.jpg"]`).screenshot({ path: `hgse1437-0.png` });
  
    // Verify the screenshot with the expected image
    await expect(page.locator(`img[src$="Rice-Mill-Drive-0.jpg"]`)).toHaveScreenshot(`hgse1437-0.png`, { maxDiffPixelRatio: 0.1, delay:1000 });
  }).toPass({ timeout: 120_000 });
  await expect(async () => {
    await page.waitForTimeout(1000)
    // // Capture the screenshot while maintaining the hover state
    await page.locator(`[id="map-container"]`).screenshot({ path: `hgse1437-1.png` });
  
    // Verify the screenshot with the expected image
    await expect(page.locator(`[id="map-container"]`)).toHaveScreenshot(`hgse1437-1.png`, { maxDiffPixelRatio: 0.1, delay:1000 });
  }).toPass({ timeout: 120_000 });
  
  //--------------------------------
  // Step2:
  //--------------------------------
  const {page: page2} = await logInHomegeniusUser()
  
  // hgse 1815
  const aerial = "2105 S Royal CT Ridgefield, WA 98642"
  await page2.locator(`[placeholder="Enter an Address"]`).first().fill(aerial);
  await page2.locator(`li:has-text("2105 S Royal CT Ridgefield")`).first().click()
  await page2.locator('div').filter({ hasText: /^Claim this homeclose$/ }).getByRole('button').click();
  
  // Assert street view and aerial view
  await expect(async () => {
    await page2.waitForTimeout(1000)
    // // Capture the screenshot while maintaining the hover state
    await page2.locator(`img[src^="https://maps.googleapis.com/maps/api/"]`).screenshot({ path: `hgse1437-2.png` });
  
    // Verify the screenshot with the expected image
    await expect(page2.locator(`img[src^="https://maps.googleapis.com/maps/api/"]`)).toHaveScreenshot(`hgse1437-2.png`, { maxDiffPixelRatio: 0.1, delay:1000 });
  }).toPass({ timeout: 120_000 });
  await expect(async () => {
    await page2.waitForTimeout(1000)
    // // Capture the screenshot while maintaining the hover state
    await page2.locator(`[id="map-container"]`).screenshot({ path: `hgse1437-3.png` });
  
    // Verify the screenshot with the expected image
    await expect(page2.locator(`[id="map-container"]`)).toHaveScreenshot(`hgse1437-3.png`, { maxDiffPixelRatio: 0.1, delay:1000 });
  }).toPass({ timeout: 120_000 });
  
  //--------------------------------
  // Step3:
  //--------------------------------
  await page2.goto("https://uat-portal.homegeniusrealestate.com/property-details/NJCD2056112/1665/1735EAF2-B22C-E811-80F4-44A8423692D6");
  // Assert street view and aerial view
  await page2.locator(`div`).filter({ hasText: /^Claim this homeclose$/ }).getByRole(`button`).click();
  await expect(async () => {
    await page2.waitForTimeout(1000)
    // // Capture the screenshot while maintaining the hover state
    await page2.locator(`img[src$="435-S-Carlton-Street-0.jpg"]`).screenshot({ path: `hgse1437-4.png` });
  
    // Verify the screenshot with the expected image
    await expect(page2.locator(`img[src$="435-S-Carlton-Street-0.jpg"]:visible >>nth=0`)).toHaveScreenshot(`hgse1437-4.png`, { maxDiffPixelRatio: 0.1, delay:1000 });
  }).toPass({ timeout: 120_000 });
  await expect(async () => {
    await page2.waitForTimeout(1000)
    // // Capture the screenshot while maintaining the hover state
    await page2.locator(`[id="map-container"]`).screenshot({ path: `hgse1437-5.png` });
  
    // Verify the screenshot with the expected image
    await expect(page2.locator(`[id="map-container"]`)).toHaveScreenshot(`hgse1437-5.png`, { maxDiffPixelRatio: 0.1, delay:1000 });
  }).toPass({ timeout: 120_000 });
  
  //--------------------------------
  // Step4:
  //--------------------------------
  // hgse 1436
  await page2.goto("https://uat-portal.homegeniusrealestate.com/property-details/11313563/7/1C27EAF2-B22C-E811-80F4-44A8423692D6/P0000FNZIL1Q");
  // Assert street view and aerial view
  await expect(async () => {
    await page2.waitForTimeout(1000)
    // // Capture the screenshot while maintaining the hover state
    await page2.locator(`img[src$="715-Norcross-Road-0.jpg"]`).screenshot({ path: `hgse1437-6.png` });
  
    // Verify the screenshot with the expected image
    await expect(page2.locator(`img[src$="715-Norcross-Road-0.jpg"]`)).toHaveScreenshot(`hgse1437-6.png`, { maxDiffPixelRatio: 0.1, delay:1000 });
  }).toPass({ timeout: 120_000 });
  await expect(async () => {
    await page2.waitForTimeout(1000)
    // // Capture the screenshot while maintaining the hover state
    await page2.locator(`[id="map-container"]`).screenshot({ path: `hgse1437-7.png` });
  
    // Verify the screenshot with the expected image
    await expect(page2.locator(`[id="map-container"]`)).toHaveScreenshot(`hgse1437-7.png`, { maxDiffPixelRatio: 0.1, delay:1000 });
  }).toPass({ timeout: 120_000 });
 // Step 2. verify photo Carousel part 2
  //--------------------------------
  // Step5:
  //--------------------------------
  await page2.goto("https://uat-portal.homegeniusrealestate.com/property-details/5840117/1832");
  
  // Assert 3 photos
  await expect(page2.locator(`img[src$="3020-W-41st-Ave-0.jpg"]`)).toBeVisible()
  await expect(page2.locator(`img[src$="3020-W-41st-Ave-0.jpg"]`)).toHaveScreenshot(`3020-W-41st-Ave-0.jpg`, { maxDiffPixelRatio: 0.1, delay:1000 });
  await expect(page2.locator(`img[src$="3020-W-41st-Ave-1.jpg"]`)).toBeVisible()
  await expect(page2.locator(`img[src$="3020-W-41st-Ave-1.jpg"]`)).toHaveScreenshot(`3020-W-41st-Ave-1.jpg`, { maxDiffPixelRatio: 0.1, delay:1000 });
  await expect(page2.locator(`img[src$="3020-W-41st-Ave-2.jpg"]`)).toBeVisible()
  await expect(page2.locator(`img[src$="3020-W-41st-Ave-2.jpg"]`)).toHaveScreenshot(`3020-W-41st-Ave-2.jpg`, { maxDiffPixelRatio: 0.1, delay:1000 });
  
  // Assert carousel, first pic
  await page2.locator(`img[src$="3020-W-41st-Ave-0.jpg"]`).click()
  await expect(page2.locator(`:text("3 Total Photos")`)).toBeVisible();
  
  await expect(page2.locator(`[id="photos-tab-pane"] img[alt="image-0"][src$="3020-W-41st-Ave-0.jpg"]`)).toBeVisible()
  await expect(page2.locator(`[id="photos-tab-pane"] img[alt="image-0"][src$="3020-W-41st-Ave-0.jpg"]`)).toHaveScreenshot(`3020-W-41st-Ave-0-l.jpg`, { maxDiffPixelRatio: 0.1, delay:1000 });
  await expect(page2.locator(`[id="photos-tab-pane"] img[width="inherit"][src$="3020-W-41st-Ave-0.jpg"]`)).toBeVisible()
  await expect(page2.locator(`[id="photos-tab-pane"] img[width="inherit"][src$="3020-W-41st-Ave-0.jpg"]`)).toHaveScreenshot(`3020-W-41st-Ave-0-r.jpg`, { maxDiffPixelRatio: 0.1, delay:1000 });
  
  // lightbox modal is covered by carousal modal
  await expect(page2.locator(`div[height="100vh"]`)).toBeVisible();
  
  await page2.locator(`button:has-text("close")`).last().click()
  
  // Assert carousel, last pic
  await page2.locator(`img[src$="3020-W-41st-Ave-2.jpg"]`).click()
  await expect(page2.locator(`:text("3 Total Photos")`)).toBeVisible();
  
  await expect(page2.locator(`[id="photos-tab-pane"] img[alt="image-2"][src$="3020-W-41st-Ave-2.jpg"]`)).toBeVisible()
  await expect(page2.locator(`[id="photos-tab-pane"] img[alt="image-2"][src$="3020-W-41st-Ave-2.jpg"]`)).toHaveScreenshot(`3020-W-41st-Ave-2-l.jpg`, { maxDiffPixelRatio: 0.1, delay:1000 });
  await expect(page2.locator(`[id="photos-tab-pane"] img[width="inherit"][src$="3020-W-41st-Ave-2.jpg"]`)).toBeVisible()
  await expect(page2.locator(`[id="photos-tab-pane"] img[width="inherit"][src$="3020-W-41st-Ave-2.jpg"]`)).toHaveScreenshot(`3020-W-41st-Ave-2-r.jpg`, { maxDiffPixelRatio: 0.1, delay:1000 });
  
  // lightbox modal is covered by carousal modal
  await expect(page2.locator(`div[height="100vh"]`)).toBeVisible()
  
  await page2.locator(`button:has-text("close")`).last().click()
  
  //--------------------------------
  // Step6:
  //--------------------------------
  await page2.goto("https://uat-portal.homegeniusrealestate.com/property-details/85019321/7/2FB1EEE1-D031-E811-80F5-44A8423692D6/P0000JCC1G80");
  
  // Assert 4 photos
  await page2.waitForTimeout(5000)
  await page2.waitForLoadState()
  await expect(page2.locator(`img[src*="2624-N-12th-Street-0.jpg"]`)).toBeVisible()
  await expect(page2.locator(`img[src*="2624-N-12th-Street-0.jpg"]`)).toHaveScreenshot(`2624-N-12th-Street-0.jpg`, { maxDiffPixelRatio: 0.7, delay:1000 });
  await expect(page2.locator(`img[src*="2624-N-12th-Street-1.jpg"]`)).toBeVisible()
  await expect(page2.locator(`img[src*="2624-N-12th-Street-1.jpg"]`)).toHaveScreenshot(`2624-N-12th-Street-1.jpg`, { maxDiffPixelRatio: 0.1, delay:1000 });
  await expect(page2.locator(`img[src*="2624-N-12th-Street-2.jpg"]`)).toBeVisible()
  await expect(page2.locator(`img[src*="2624-N-12th-Street-2.jpg"]`)).toHaveScreenshot(`2624-N-12th-Street-2.jpg`, { maxDiffPixelRatio: 0.1, delay:1000 });
  await expect(page2.locator(`img[src*="2624-N-12th-Street-3.jpg"]`)).toBeVisible()
  await expect(page2.locator(`img[src*="2624-N-12th-Street-3.jpg"]`)).toHaveScreenshot(`2624-N-12th-Street-3.jpg`, { maxDiffPixelRatio: 0.1, delay:1000 });
  
  // Assert carousel, first pic
  await page2.locator(`img[src$="2624-N-12th-Street-0.jpg"]`).click()
  await expect(page2.locator(`:text("4 Total Photos")`)).toBeVisible();
  
  await expect(page2.locator(`[id="photos-tab-pane"] img[alt="image-0"][src$="2624-N-12th-Street-0.jpg"]`)).toBeVisible()
  await expect(page2.locator(`[id="photos-tab-pane"] img[alt="image-0"][src$="2624-N-12th-Street-0.jpg"]`)).toHaveScreenshot(`2624-N-12th-Street-0-l.jpg`, { maxDiffPixelRatio: 0.1, delay:1000 });
  await expect(page2.locator(`[id="photos-tab-pane"] img[width="inherit"][src$="2624-N-12th-Street-0.jpg"]`)).toBeVisible()
  await expect(page2.locator(`[id="photos-tab-pane"] img[width="inherit"][src$="2624-N-12th-Street-0.jpg"]`)).toHaveScreenshot(`2624-N-12th-Street-0-r.jpg`, { maxDiffPixelRatio: 0.1, delay:1000 });
  
  // lightbox modal is covered by carousal modal
  await expect(page2.locator(`div[height="100vh"]`)).toBeVisible()
  
  await page2.locator(`button:has-text("close")`).last().click()
  
  // Assert carousel, last pic
  await page2.locator(`img[src$="2624-N-12th-Street-3.jpg"]`).click()
  await expect(page2.locator(`:text("4 Total Photos")`)).toBeVisible();
  
  await expect(page2.locator(`[id="photos-tab-pane"] img[alt="image-3"][src$="2624-N-12th-Street-3.jpg"]`)).toBeVisible()
  await expect(page2.locator(`[id="photos-tab-pane"] img[alt="image-3"][src$="2624-N-12th-Street-3.jpg"]`)).toHaveScreenshot(`2624-N-12th-Street-3-l.jpg`, { maxDiffPixelRatio: 0.1, delay:1000 });
  await expect(page2.locator(`[id="photos-tab-pane"] img[width="inherit"][src$="2624-N-12th-Street-3.jpg"]`)).toBeVisible()
  await expect(page2.locator(`[id="photos-tab-pane"] img[width="inherit"][src$="2624-N-12th-Street-3.jpg"]`)).toHaveScreenshot(`2624-N-12th-Street-3-r.jpg`, { maxDiffPixelRatio: 0.1, delay:1000 });
  
  // lightbox modal is covered by carousal modal
  await expect(page2.locator(`div[height="100vh"]`)).toBeVisible()
  
  await page2.locator(`button:has-text("close")`).last().click()
  
  //--------------------------------
  // Step7:
  //--------------------------------
  await page2.goto("https://uat-portal.homegeniusrealestate.com/property-details/108-Willowburn-Road-Villanova-PA-19085/1665/PADE2070784/0171D880-C931-E811-80F5-44A8423692D6");
  
  // Assert more than 5 photos
  await expect(page2.locator(`[id="map-container"]`)).not.toBeVisible();
  await expect(page2.locator(`img[src$="108-Willowburn-Road-44.jpg"]`).last()).toBeVisible()
  await expect(page2.locator(`img[src$="108-Willowburn-Road-44.jpg"]`).last()).toHaveScreenshot(`108-Willowburn-Road-44.jpg`, { maxDiffPixelRatio: 0.1, delay:1000 });
  await page2.locator(`img[src$="108-Willowburn-Road-43.jpg"]`).last().hover()
  await page2.locator(`:text("chevron_right")`).first().click();
  await expect(page2.locator(`img[src$="108-Willowburn-Road-0.jpg"]`).last()).not.toBeInViewport()
  
  // Assert carousel, first pic
  await page2.locator(`img[src$="108-Willowburn-Road-44.jpg"]`).last().click()
  await expect(page2.locator(`:text("46 Total Photos")`)).toBeVisible();
  
  await expect(page2.locator(`[id="photos-tab-pane"] img[alt="image-44"][src$="108-Willowburn-Road-44.jpg"]`)).toBeVisible()
  await expect(page2.locator(`[id="photos-tab-pane"] img[alt="image-44"][src$="108-Willowburn-Road-44.jpg"]`)).toHaveScreenshot(`108-Willowburn-Road-44-l.jpg`, { maxDiffPixelRatio: 0.1, delay:1000 });
  await expect(page2.locator(`[id="photos-tab-pane"] img[width="inherit"][src$="108-Willowburn-Road-44.jpg"]`)).toBeVisible()
  await expect(page2.locator(`[id="photos-tab-pane"] img[width="inherit"][src$="108-Willowburn-Road-44.jpg"]`)).toHaveScreenshot(`108-Willowburn-Road-44-r.jpg`, { maxDiffPixelRatio: 0.1, delay:1000 });
  
  // lightbox modal is covered by carousal modal
  await expect(page2.locator(`div[height="100vh"]`)).toBeVisible()
  
  await page2.locator(`.material-icons:text("close"):visible`).last().click({force: true})
  
  // Assert carousel, last pic
  await page2.locator(`img[src$="108-Willowburn-Road-0.jpg"]`).last().click()
  await expect(page2.locator(`:text("46 Total Photos")`)).toBeVisible();
  
  await expect(page2.locator(`[id="photos-tab-pane"] img[alt="image-0"][src$="108-Willowburn-Road-0.jpg"]`)).toBeVisible()
  await expect(page2.locator(`[id="photos-tab-pane"] img[alt="image-0"][src$="108-Willowburn-Road-0.jpg"]`)).toHaveScreenshot(`108-Willowburn-Road-0-l.jpg`, { maxDiffPixelRatio: 0.1, delay:1000 });
  await expect(page2.locator(`[id="photos-tab-pane"] img[width="inherit"][src$="108-Willowburn-Road-0.jpg"]`)).toBeVisible()
  await expect(page2.locator(`[id="photos-tab-pane"] img[width="inherit"][src$="108-Willowburn-Road-0.jpg"]`)).toHaveScreenshot(`108-Willowburn-Road-0-r.jpg`, { maxDiffPixelRatio: 0.1, delay:1000 });
  
  // lightbox modal is covered by carousal modal
  await expect(page2.locator(`div[height="100vh"]`)).toBeVisible()
  
  await page2.locator(`.material-icons:text("close"):visible`).last().click({force: true})
  
  
});