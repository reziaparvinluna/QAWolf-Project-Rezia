const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_1428_social_media_in_footers", async () => {
 // Step 1. HGSE-1428 - Social Media in Footers
  //--------------------------------
  // Arrange:
  //--------------------------------
  //--------------------------------
  // Act:
  //--------------------------------
  //--------------------------------
  // Assert:
  //--------------------------------
  //--------------------------------
  // STEP 1:
  //--------------------------------
  // Login to Homeogenius UAT-Portal
  const {page,context} = await logInHomegeniusUser()
  
  //--------------------------------
  // STEP 2 3:
  //--------------------------------
  // Assert the icons are present and right size
  await expect(page.locator(`a[href="https://www.linkedin.com/company/homegenius-re/"] img[src="/images/linkedin-icon.svg"][alt="linkedin-icon"]`)).toHaveCSS('width', '28px');
  await expect(page.locator(`a[href="https://www.linkedin.com/company/homegenius-re/"] img[src="/images/linkedin-icon.svg"][alt="linkedin-icon"]`)).toHaveCSS('height', '28px');
  await expect(page.locator(`a[href="https://www.facebook.com/homegeniusre/"] img[src="/images/facebook-icon.svg"][alt="facebook-icon"]`)).toHaveCSS('width', '28px');
  await expect(page.locator(`a[href="https://www.facebook.com/homegeniusre/"] img[src="/images/facebook-icon.svg"][alt="facebook-icon"]`)).toHaveCSS('height', '28px');
  await expect(page.locator(`a[href^="https://www.instagram.com/homegeniusre"] img[src="/images/instagram-icon.svg"][alt="instagram-icon"]`)).toHaveCSS('width', '28px');
  await expect(page.locator(`a[href^="https://www.instagram.com/homegeniusre"] img[src="/images/instagram-icon.svg"][alt="instagram-icon"]`)).toHaveCSS('height', '28px');
  await expect(page.locator(`a[href="https://pin.it/4N5ljExCz"] img[src="/images/pinterest-icon.svg"][alt="pinterest-icon"]`)).toHaveCSS('width', '28px');
  await expect(page.locator(`a[href="https://pin.it/4N5ljExCz"] img[src="/images/pinterest-icon.svg"][alt="pinterest-icon"]`)).toHaveCSS('height', '28px');
  
  // Assert click on the icon leads to right website
  const [page2] = await Promise.all([
    page.waitForEvent("popup"),
    page.locator(`a[href="https://www.linkedin.com/company/homegenius-re/"] img[src="/images/linkedin-icon.svg"][alt="linkedin-icon"]`).click({delay:2000}),
  ]);
  await expect(page2).toHaveURL('https://www.linkedin.com/company/homegenius-re/');
  
  const [page3] = await Promise.all([
    page.waitForEvent("popup"),
    page.locator(`a[href="https://www.facebook.com/homegeniusre/"] img[src="/images/facebook-icon.svg"][alt="facebook-icon"]`).click({delay:2000}),
  ]);
  await expect(page3).toHaveURL(/https:\/\/www\.facebook\.com\/.*homegenius.*/);
  
  // const [page2] = await Promise.all([
  //   page.waitForEvent("popup"),
  //   page.locator(`a[href^="https://www.instagram.com/homegeniusre"] img[src="/images/instagram-icon.svg"][alt="instagram-icon"]`).click({delay:2000}),
  // ]);
  // await expect(page2).toHaveURL('https://www.instagram.com/homegeniusre'); // instagram blocks qaw
  
  const [page4] = await Promise.all([
    page.waitForEvent("popup"),
    page.locator(`a[href="https://pin.it/4N5ljExCz"] img[src="/images/pinterest-icon.svg"][alt="pinterest-icon"]`).click({delay:2000}),
  ]);
  await expect(page4).toHaveURL('https://www.pinterest.com/homegeniusre/?invite_code=c47d1c8bae494943b1a3913992223f0b&sender=317152136167170268');
  
  //--------------------------------
  // STEP 4 5:
  //--------------------------------
  const { page: page5 } = await goToHomegenius({url: "https://uat-portal.homegeniusrealestate.com/headertest1"})
  
  // Assert the icons are present and right size
  await expect(page5.locator(`a[href="https://www.linkedin.com/company/homegenius-re/"] img[src="/images/linkedin-icon.svg"][alt="linkedin-icon"]`)).toHaveCSS('width', '28px');
  await expect(page5.locator(`a[href="https://www.linkedin.com/company/homegenius-re/"] img[src="/images/linkedin-icon.svg"][alt="linkedin-icon"]`)).toHaveCSS('height', '28px');
  await expect(page5.locator(`a[href="https://www.facebook.com/homegeniusre/"] img[src="/images/facebook-icon.svg"][alt="facebook-icon"]`)).toHaveCSS('width', '28px');
  await expect(page5.locator(`a[href="https://www.facebook.com/homegeniusre/"] img[src="/images/facebook-icon.svg"][alt="facebook-icon"]`)).toHaveCSS('height', '28px');
  await expect(page5.locator(`a[href^="https://www.instagram.com/homegeniusre"] img[src="/images/instagram-icon.svg"][alt="instagram-icon"]`)).toHaveCSS('width', '28px');
  await expect(page5.locator(`a[href^="https://www.instagram.com/homegeniusre"] img[src="/images/instagram-icon.svg"][alt="instagram-icon"]`)).toHaveCSS('height', '28px');
  await expect(page5.locator(`a[href="https://pin.it/4N5ljExCz"] img[src="/images/pinterest-icon.svg"][alt="pinterest-icon"]`)).toHaveCSS('width', '28px');
  await expect(page5.locator(`a[href="https://pin.it/4N5ljExCz"] img[src="/images/pinterest-icon.svg"][alt="pinterest-icon"]`)).toHaveCSS('height', '28px');
  
  // Assert click on the icon leads to right website
  // Assert click on the icon leads to right website
  const [page6] = await Promise.all([
    page5.waitForEvent("popup"),
    page5.locator(`a[href="https://www.linkedin.com/company/homegenius-re/"] img[src="/images/linkedin-icon.svg"][alt="linkedin-icon"]`).click({delay:2000}),
  ]);
  await expect(page6).toHaveURL('https://www.linkedin.com/company/homegenius-re/');
  
  const [page7] = await Promise.all([
    page5.waitForEvent("popup"),
    page5.locator(`a[href="https://www.facebook.com/homegeniusre/"] img[src="/images/facebook-icon.svg"][alt="facebook-icon"]`).click({delay:2000}),
  ]);
  await expect(page7).toHaveURL(/https:\/\/www\.facebook\.com\/.*homegenius.*/);
  
  // const [page2] = await Promise.all([
  //   page.waitForEvent("popup"),
  //   page.locator(`a[href^="https://www.instagram.com/homegeniusre"] img[src="/images/instagram-icon.svg"][alt="instagram-icon"]`).click({delay:2000}),
  // ]);
  // await expect(page2).toHaveURL('https://www.instagram.com/homegeniusre'); // instagram blocks qaw
  
  const [page8] = await Promise.all([
    page5.waitForEvent("popup"),
    page5.locator(`a[href="https://pin.it/4N5ljExCz"] img[src="/images/pinterest-icon.svg"][alt="pinterest-icon"]`).click({delay:2000}),
  ]);
  await expect(page8).toHaveURL('https://www.pinterest.com/homegeniusre/?invite_code=c47d1c8bae494943b1a3913992223f0b&sender=317152136167170268');
  
 // Step 2. Social Media in Footers on iPhone 12
  //--------------------------------
  // Arrange:
  //--------------------------------
  //--------------------------------
  // Act:
  //--------------------------------
  //--------------------------------
  // Assert:
  //--------------------------------
  //--------------------------------
  // STEP 6:
  //--------------------------------
  // Login to Homeogenius UAT-Portal
  const {page:page9} = await logInHomegeniusUser({...devices["iPhone 12"]})
  
  //--------------------------------
  // check on search:
  //--------------------------------
  // Assert the icons are present and right size
  await expect(page9.locator(`a[href="https://www.linkedin.com/company/homegenius-re/"] img[src="/images/linkedin-icon.svg"][alt="linkedin-icon"]`)).toHaveCSS('width', '28px');
  await expect(page9.locator(`a[href="https://www.linkedin.com/company/homegenius-re/"] img[src="/images/linkedin-icon.svg"][alt="linkedin-icon"]`)).toHaveCSS('height', '28px');
  await expect(page9.locator(`a[href="https://www.facebook.com/homegeniusre/"] img[src="/images/facebook-icon.svg"][alt="facebook-icon"]`)).toHaveCSS('width', '28px');
  await expect(page9.locator(`a[href="https://www.facebook.com/homegeniusre/"] img[src="/images/facebook-icon.svg"][alt="facebook-icon"]`)).toHaveCSS('height', '28px');
  await expect(page9.locator(`a[href^="https://www.instagram.com/homegeniusre"] img[src="/images/instagram-icon.svg"][alt="instagram-icon"]`)).toHaveCSS('width', '28px');
  await expect(page9.locator(`a[href^="https://www.instagram.com/homegeniusre"] img[src="/images/instagram-icon.svg"][alt="instagram-icon"]`)).toHaveCSS('height', '28px');
  await expect(page9.locator(`a[href="https://pin.it/4N5ljExCz"] img[src="/images/pinterest-icon.svg"][alt="pinterest-icon"]`)).toHaveCSS('width', '28px');
  await expect(page9.locator(`a[href="https://pin.it/4N5ljExCz"] img[src="/images/pinterest-icon.svg"][alt="pinterest-icon"]`)).toHaveCSS('height', '28px');
  
  // Assert click on the icon leads to right website
  const [page10] = await Promise.all([
    page9.waitForEvent("popup"),
    page9.locator(`a[href="https://www.linkedin.com/company/homegenius-re/"] img[src="/images/linkedin-icon.svg"][alt="linkedin-icon"]`).click({delay:2000}),
  ]);
  await expect(page10).toHaveURL('https://www.linkedin.com/company/homegenius-re/');
  
  const [page11] = await Promise.all([
    page9.waitForEvent("popup"),
    page9.locator(`a[href="https://www.facebook.com/homegeniusre/"] img[src="/images/facebook-icon.svg"][alt="facebook-icon"]`).click({delay:2000}),
  ]);
  await expect(page11).toHaveURL(/https:\/\/(www|m)\.facebook\.com\/.*homegenius.*/);
  
  
  // const [page2] = await Promise.all([
  //   page.waitForEvent("popup"),
  //   page.locator(`a[href^="https://www.instagram.com/homegeniusre"] img[src="/images/instagram-icon.svg"][alt="instagram-icon"]`).click({delay:2000}),
  // ]);
  // await expect(page2).toHaveURL('https://www.instagram.com/homegeniusre'); // instagram blocks qaw
  
  const [page12] = await Promise.all([
    page9.waitForEvent("popup"),
    page9.locator(`a[href="https://pin.it/4N5ljExCz"] img[src="/images/pinterest-icon.svg"][alt="pinterest-icon"]`).click({delay:2000}),
  ]);
  await expect(page12).toHaveURL('https://www.pinterest.com/homegeniusre/?invite_code=c47d1c8bae494943b1a3913992223f0b&sender=317152136167170268');
  
  //--------------------------------
  // check on headertest:
  //--------------------------------
  
  const { page: page13 } = await goToHomegenius({url: "https://uat-portal.homegeniusrealestate.com/headertest1",...devices["iPhone 12"]})
  
  // Assert the icons are present and right size
  await expect(page13.locator(`a[href="https://www.linkedin.com/company/homegenius-re/"] img[src="/images/linkedin-icon.svg"][alt="linkedin-icon"]`)).toHaveCSS('width', '28px');
  await expect(page13.locator(`a[href="https://www.linkedin.com/company/homegenius-re/"] img[src="/images/linkedin-icon.svg"][alt="linkedin-icon"]`)).toHaveCSS('height', '28px');
  await expect(page13.locator(`a[href="https://www.facebook.com/homegeniusre/"] img[src="/images/facebook-icon.svg"][alt="facebook-icon"]`)).toHaveCSS('width', '28px');
  await expect(page13.locator(`a[href="https://www.facebook.com/homegeniusre/"] img[src="/images/facebook-icon.svg"][alt="facebook-icon"]`)).toHaveCSS('height', '28px');
  await expect(page13.locator(`a[href^="https://www.instagram.com/homegeniusre"] img[src="/images/instagram-icon.svg"][alt="instagram-icon"]`)).toHaveCSS('width', '28px');
  await expect(page13.locator(`a[href^="https://www.instagram.com/homegeniusre"] img[src="/images/instagram-icon.svg"][alt="instagram-icon"]`)).toHaveCSS('height', '28px');
  await expect(page13.locator(`a[href="https://pin.it/4N5ljExCz"] img[src="/images/pinterest-icon.svg"][alt="pinterest-icon"]`)).toHaveCSS('width', '28px');
  await expect(page13.locator(`a[href="https://pin.it/4N5ljExCz"] img[src="/images/pinterest-icon.svg"][alt="pinterest-icon"]`)).toHaveCSS('height', '28px');
  
  // Assert click on the icon leads to right website
  // Assert click on the icon leads to right website
  const [page14] = await Promise.all([
    page13.waitForEvent("popup"),
    page13.locator(`a[href="https://www.linkedin.com/company/homegenius-re/"] img[src="/images/linkedin-icon.svg"][alt="linkedin-icon"]`).click({delay:2000}),
  ]);
  await expect(page14).toHaveURL('https://www.linkedin.com/company/homegenius-re/');
  
  const [page15] = await Promise.all([
    page13.waitForEvent("popup"),
    page13.locator(`a[href="https://www.facebook.com/homegeniusre/"] img[src="/images/facebook-icon.svg"][alt="facebook-icon"]`).click({delay:2000}),
  ]);
  await expect(page15).toHaveURL(/https:\/\/(www|m)\.facebook\.com\/.*homegenius.*/);
  
  
  // const [page2] = await Promise.all([
  //   page.waitForEvent("popup"),
  //   page.locator(`a[href^="https://www.instagram.com/homegeniusre"] img[src="/images/instagram-icon.svg"][alt="instagram-icon"]`).click({delay:2000}),
  // ]);
  // await expect(page2).toHaveURL('https://www.instagram.com/homegeniusre'); // instagram blocks qaw
  
  const [page16] = await Promise.all([
    page13.waitForEvent("popup"),
    page13.locator(`a[href="https://pin.it/4N5ljExCz"] img[src="/images/pinterest-icon.svg"][alt="pinterest-icon"]`).click({delay:2000}),
  ]);
  await expect(page16).toHaveURL('https://www.pinterest.com/homegeniusre/?invite_code=c47d1c8bae494943b1a3913992223f0b&sender=317152136167170268');
  
  
});