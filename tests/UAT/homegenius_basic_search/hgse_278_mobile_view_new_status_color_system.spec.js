const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius, devices} = require("../../../lib/node_20_helpers");

test("hgse_278_mobile_view_new_status_color_system", async () => {
 // Step 1. HGSE-278 [Mobile View] New Status Color System iPhone 14
  //--------------------------------
  // Arrange:
  //--------------------------------
  // off market
  const searchAddress1 = {
    searchAddress: "7865 Bahia Vista Court Unit 7865 Jacksonville, FL, 32256",
    searchAddr2: "7865 Bahia Vista Ct # 7865",
    addressLineOne: "7865 Bahia Vista Court Unit 7865",
    addressLineTwo: "Jacksonville, FL 32256",
    propertyType: "Condominium",
    bed: "2",
    bath: "2.5",
    sqft: "1,501",
    gar: "1",
    yr: "1974"
  }
  
  
  // Login to Homeogenius UAT-Portal
  const {page,context} = await logInHomegeniusUser({...devices['iPhone 14']})
  
  // Click "Find a home"
  await page.locator(`[data-testid="undecorate"] :text("Find a Home")`).last().click();
  await page.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).first().fill(searchAddress1.searchAddress);
  await page.locator(`li:visible p:has-text("${searchAddress1.searchAddr2}")`).first().click({delay:3000})
  
  // Assert property details color
  await expect(page.locator(`[class="css-sj7m08"]`)).toHaveCSS("background-color", "rgb(113, 113, 113)")
  await page.locator(`[width="100%"][height="100%"] .material-icons:text("chevron_right"):visible`).click();
  await page.locator(`[width="100%"][height="100%"] .material-icons:text("chevron_right"):visible`).click();
  
  // Assert similar properties color
  await page.locator(`button:text("similar properties")`).last().click();
  await expect(page.locator(`li:has(button:text("Sold on 06/04/2024"))`)).toHaveCSS("background-color", "rgb(9, 164, 173)")
  await expect(page.locator(`[class="css-tlqj7t"]`).nth(0)).toHaveCSS("background-color", "rgb(9, 164, 173)")
  
  // Assert map markers
  await page.locator(`:text("mapMap View")`).click();
  await page.locator(`[aria-label="7865 Bahia Vista Court"]`).click();
  await expect(page.locator(`[class="css-u5wfn8"]`)).toHaveCSS("background-color", "rgb(113, 113, 113)")
  
 // Step 2. new status system ipad pro
  //--------------------------------
  // Arrange:
  //--------------------------------
  // off market
  const searchAddress2 = {
    searchAddress: "7865 Bahia Vista Court Unit 7865 Jacksonville, FL, 32256",
    searchAddr2: "7865 Bahia Vista Ct # 7865",
    addressLineOne: "7865 Bahia Vista Court Unit 7865",
    addressLineTwo: "Jacksonville, FL 32256",
    propertyType: "Condominium",
    bed: "2",
    bath: "2.5",
    sqft: "1,501",
    gar: "1",
    yr: "1974"
  }
  
  
  // Login to Homeogenius UAT-Portal
  const {page: page2} = await logInHomegeniusUser({...devices['iPad Pro 11']})
  
  // Assert property details color
  await page2.locator(`[data-testid="undecorate"] :text("Find a Home")`).last().click();
  await page2.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).first().fill(searchAddress2.searchAddress);
  await page2.locator(`li:visible p:has-text("${searchAddress2.searchAddr2}")`).first().click({delay:3000})
  await expect(page2.locator(`[class="css-sj7m08"]`)).toHaveCSS("background-color", "rgb(113, 113, 113)")
  
  // Assert similar properties color
  await page2.locator(`button:text("similar properties")`).last().click();
  await expect(page2.locator(`li:has(button:text("Sold on 06/04/2024"))`)).toHaveCSS("background-color", "rgb(9, 164, 173)")
  await expect(page2.locator(`[class="css-tlqj7t"]`).nth(0)).toHaveCSS("background-color", "rgb(9, 164, 173)")
  
  // Assert map markers
  await page2.locator(`:text("mapMap View")`).click();
  await page2.locator(`[aria-label="7865 Bahia Vista Court"]`).click();
  await expect(page2.locator(`[class="css-u5wfn8"]`)).toHaveCSS("background-color", "rgb(113, 113, 113)")
  
  
  
 // Step 3. new status system android Galaxy Note 3
  //--------------------------------
  // Arrange:
  //--------------------------------
  // off market
  const searchAddress3 = {
    searchAddress: "7865 Bahia Vista Court Unit 7865 Jacksonville, FL, 32256",
    searchAddr2: "7865 Bahia Vista Ct # 7865",
    addressLineOne: "7865 Bahia Vista Court Unit 7865",
    addressLineTwo: "Jacksonville, FL 32256",
    propertyType: "Condominium",
    bed: "2",
    bath: "2.5",
    sqft: "1,501",
    gar: "1",
    yr: "1974"
  }
  
  
  // Login to Homeogenius UAT-Portal
  const {page: page3} = await logInHomegeniusUser({...devices['Galaxy Note 3']})
  
  // Assert property details color
  await page3.locator(`[data-testid="undecorate"] :text("Find a Home")`).last().click();
  await page3.locator(`[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`).first().fill(searchAddress3.searchAddress);
  await page3.locator(`li:visible p:has-text("${searchAddress3.searchAddr2}")`).first().click({delay:3000})
  await expect(page3.locator(`[class="css-sj7m08"]`)).toHaveCSS("background-color", "rgb(113, 113, 113)")
  await page3.locator(`[width="100%"][height="100%"] .material-icons:text("chevron_right"):visible`).click();
  await page3.locator(`[width="100%"][height="100%"] .material-icons:text("chevron_right"):visible`).click();
  
  // Assert similar properties color
  await page3.locator(`button:text("similar properties")`).last().click();
  await expect(page3.locator(`li:has(button:text("Sold on 06/04/2024"))`)).toHaveCSS("background-color", "rgb(9, 164, 173)")
  await expect(page3.locator(`[class="css-tlqj7t"]`).nth(0)).toHaveCSS("background-color", "rgb(9, 164, 173)")
  
  
  // Assert map markers
  await page3.locator(`:text("mapMap View")`).click();
  await page3.locator(`[aria-label="7865 Bahia Vista Court"]`).click();
  await expect(page3.locator(`[class="css-u5wfn8"]`)).toHaveCSS("background-color", "rgb(113, 113, 113)")
});