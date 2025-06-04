import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_328_detailed_search_menu_styling_header_row_menu_filter_selected_from_drop_down", async () => {
 // Step 1. HGSE-328 - [Detailed Search Menu Styling) Header Row Menu-Filter selected from drop down
  //--------------------------------
  // Arrange:
  //--------------------------------
  const mlsNumber = "879876"
  
  // Login to Homeogenius UAT-Portal
  const {page,context} = await logInHomegeniusUser()
  
  await goToSearchPage(page, mlsNumber);
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Assert 4 basic searches
  await expect(page.locator(`button:has-text("SEARCH WITH AI")`)).toBeVisible()
  await expect(page.locator(`button:has-text("for sale")`)).toBeVisible()
  await expect(page.locator(`button:has-text("PRICEexpand_more")`)).toBeVisible()
  await expect(page.locator(`button:has-text("beds & baths")`)).toBeVisible()
  
  // Go to right of filters
  await page.locator(`span:text("chevron_right")`).first().click();
  await expect(page.locator(`button:has-text("moreexpand_more")`)).toBeVisible()
  
  // Click more
  await page.locator(`button:text("moreexpand_more")`).click();
  
  // select home type amenties and time on homegenius and apply filter
  await page.locator(`label:has-text("Single-family"):visible`).first().click();
  await page.locator(`label:has-text("Pool"):visible`).last().click();
  await page.locator(`p:text("Time on homegenius") + div`).hover();
  await page.locator(`p:text("Time on homegenius") + div`).click();
  await page.locator(`li:text("Less than 1 month")`).click();
  await page.locator(`button:has-text("reset filters")+button:has-text("apply")`).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert the filter shows 3 filters applied to it
  await expect(page.locator(`button:has-text("moreexpand_more")+div div:has-text("3")`)).toBeVisible()
  
  // Add price for sale and beds baths filter
  // for rent
  await page.locator(`button:has-text("for sale")`).click();
  await page.locator(`button :text("For Rent")`).click();
  await page.locator(`button:has-text("Done"):visible`).click();
  // Add a bed bath filter
  await page.locator(`button:has-text("beds & baths")`).click();
  await page.locator(`button[name="numberOfBedrooms"]:has-text("2+")`).click();
  await page.locator(`button[name="numberOfBathrooms"]:text-is("2+")`).click();
  await page.locator(`button:has-text("Done"):visible`).click();
  // min price
  await page.locator(`button:has-text("price")`).click();
  await page.locator(`div:text("No Min")`).click();
  await page.locator(`li:has-text("$500"):visible`).click();
  await page.locator(`button:has-text("Done"):visible`).click();
  
  // Assert the filter shows 3 filters applied to it unchanged
  await expect(page.locator(`button:has-text("moreexpand_more")+div div:has-text("3")`)).toBeVisible()
  
  
});