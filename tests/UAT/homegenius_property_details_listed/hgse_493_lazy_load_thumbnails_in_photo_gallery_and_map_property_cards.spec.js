const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_493_lazy_load_thumbnails_in_photo_gallery_and_map_property_cards", async () => {
 // Step 1. HGSE-493 Lazy Load Thumbnails in Photo Gallery and Map Property Cards - Chrome
  // Constants and Helpers
  
  const address = "413 Eagle Road Unit 7, Wayne, PA 19087";
  const addressLine1 = "413 Eagle Rd # 7";
  
  // Function to check if an image is fully loaded and not blurry
  async function assertImageIsNotBlurry(page, imageSelector) {
    await page.waitForSelector(imageSelector);  // Ensure the image is present
  
    // Wait for the image to load fully
    const isLoaded = await page.locator(imageSelector).evaluate((img) => img.complete && img.naturalWidth > 0);
    expect(isLoaded).toBeTruthy();
  
  }
  
  //--------------------------------
  // Arrange:
  //--------------------------------
  const {page, browser, context} = await goToHomegenius();
  
  // Simulate slower network conditions
  const networkConditions = {
    Slow: {
      download: ((5000 * 1000) / 8) * 0.5, // 5000 kbps download, reduced by 20%
      upload: ((5000 * 1000) / 8) * 0.5,   // 5000 kbps upload, reduced by 20%
      latency: 800,                        // 400 ms latency
    },
  };
  
  // Start a timer to test normal speeds
  const start = new Date().getTime();
  await page.goto("http://www.google.com");
  const normalEnd = (new Date().getTime() - start) / 1000;
  
  // Create new session with slowed down network
  const cdpSession = await context.newCDPSession(page);
  await cdpSession.send("Network.emulateNetworkConditions", {
    downloadThroughput: networkConditions["Slow"].download,
    uploadThroughput: networkConditions["Slow"].upload,
    latency: networkConditions["Slow"].latency,
    offline: false,
  });
  
  // Start a timer to test the slower network speeds
  const start2 = new Date().getTime();
  await page.goto("http://www.google.com");
  const slowEnd = (new Date().getTime() - start2) / 1000;
  
  // Assert the slower speeds load takes longer
  // and console log both speeds for visibility
  console.log("Normal speed in seconds", normalEnd);
  console.log("Slow speed in seconds", slowEnd);
  expect(slowEnd).toBeGreaterThan(normalEnd);
  
  // Go to /home-search
  await page.goto(process.env.URL_HOMEGENIUS + `/home-search`);
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Step 2: Search an address
  await page.waitForTimeout(3000);
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).fill(address);
  
  // Click on the first address
  await page.locator(`li:has-text("${addressLine1}")`).first().click();
  
  // Close the overlay menu
  await page.locator(`//*[@id='__next']/main/div[3]/div/button[1]/span/span`).click();
  
  // Step 3: Click "All Photos"
  await page.locator(`:text("photo_libraryAll Photos")`).click();
  
  // Select thumbnails in the sidebar
  const eagerThumbnailSelector = '.css-161aiis img[loading="eager"]';
  const lazyThumbnailSelector = '.css-161aiis img[loading="lazy"]';
  
  // --------------------------------
  // Assert Lazy Loading:
  // --------------------------------
  
  // Wait for lazy-loaded thumbnails to be present
  await page.waitForSelector(lazyThumbnailSelector);
  
  // Get all lazy-loaded thumbnail elements
  const lazyThumbnails = await page.$$(lazyThumbnailSelector);
  
  // Assert that lazy-loaded images are not yet fully loaded initially
  for (let i=lazyThumbnails.length-1;i>=0 ;i--) {
    const thumbnail = lazyThumbnails[i]
    const isNotLoaded = await thumbnail.evaluate((img) => img.complete === false || img.naturalWidth === 0);
    expect(isNotLoaded).toBeTruthy();
  }
  
  // --------------------------------
  // Assert Eager Loading:
  // --------------------------------
  
  // Wait for eager-loaded thumbnails to be present
  await page.waitForSelector(eagerThumbnailSelector);
  
  // Get all eager-loaded thumbnail elements
  const eagerThumbnails = await page.$$(eagerThumbnailSelector);
  
  // Pause for the UI
  await expect(async ()=> {
    // Assert that eager-loaded images are already fully loaded
    for (const thumbnail of eagerThumbnails) {
      const isEagerLoaded = await thumbnail.evaluate((img) => img.complete && img.naturalWidth > 0);
      expect(isEagerLoaded).toBeTruthy();
    }
  }).toPass({timeout:60_000})
  
  // --------------------------------
  // Assert Lazy Loaded Images are Loaded after Scroll:
  // --------------------------------
  
  // Scroll to load more images if needed
  await page.locator(`.css-161aiis`).hover();
  await page.mouse.wheel(0, 5000);
  
  // Pause for UI 
  await page.waitForTimeout(7000)
  
  await expect(async ()=> {
    // Assert that lazy-loaded images are now fully loaded after scrolling
    for (const thumbnail of lazyThumbnails) {
      // Wait for the image to load fully
  
      // Assert that the image is now fully loaded
      const isLoaded = await thumbnail.evaluate((img) => img.complete && img.naturalWidth > 0);
      expect(isLoaded).toBeTruthy();
    }
  }).toPass({timeout:60_000})
  
  //--------------------------------
  // Assert clicking left/right in the pictures does not show blurred images:
  //--------------------------------
  
  // Click the left arrow in the image preview modal
  const leftArrowSelector = page.getByLabel(`PHOTOS`).getByRole(`button`, { name: `chevron_left` })
  const rightArrowSelector = page.getByLabel(`PHOTOS`).getByRole(`button`, { name: `chevron_right` })
  const imageInCenterSelector = '#photos-tab-pane > div > div + div img:visible';  // Update this selector to match the image in the center of the modal
  const totalImageSelector = ".css-161aiis img"
  
  const iteration = await page.locator(totalImageSelector).count()
  
  // Click the first image
  await page.locator(totalImageSelector).first().click()
  
  // Click the right arrow and assert the image is not blurry
  for (let i = 0; i < iteration; i++) {
    await page.waitForTimeout(1000); // Optionally wait for any transition animations
  
    await assertImageIsNotBlurry(page, imageInCenterSelector);
  
    await expect(page.locator(imageInCenterSelector)).toHaveScreenshot(`lazyLoadImageRightsCambriaCourtNew${i}.png`,
    {maxDiffPixelRatio:0.1})
  
    await rightArrowSelector.click();
  }
  
  // Click the first image
  await page.locator(totalImageSelector).first().click()
  
  // Click the left arrow and assert the image is not blurry
  for (let i = 0; i < iteration; i++) {
    await page.waitForTimeout(500); // Optionally wait for any transition animations
  
    await assertImageIsNotBlurry(page, imageInCenterSelector);
  
    await expect(page.locator(imageInCenterSelector)).toHaveScreenshot(`lazyLoadImageLeftsCambriaCourtNew${i}.png`, {maxDiffPixelRatio:0.1})
    
    await leftArrowSelector.click();
  
  }
  
});