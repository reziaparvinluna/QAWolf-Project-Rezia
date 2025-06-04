import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_1554_results_redesign_batch_images", async () => {
 // Step 1. HGSE-1554: Results Redesign-Batch Images
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Login to Homegenius UAT-Portal
  const {page,context} = await logInHomegeniusUser()
  
  /** Click the 'Find a Home' link in the navigation menu */
  await page.getByRole("link", { name: "Find a Home", exact: true }).click();
  await page.waitForTimeout(5000);
  
  // Fill in two letters
  await page
    .getByPlaceholder("Address, city, neighborhood,")
    .first()
    .fill('Ne');
  
  // Click on New York
  await page.getByRole('option', { name: 'New York' }).click({ delay: 2000 })
  
  // Click on Search
  await page.getByRole(`button`, { name: `Search` }).first().click({delay: 5000});
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Filter by image and uploads image
  await page.locator(`button:has-text("search with ai")`).click()
  await page.getByText(`Search with My Photos`).click();
  const elementSelector = `:text("Choose a file")`;
  const filePaths = [`/home/wolf/team-storage/1554rm1.jpg`,`/home/wolf/team-storage/1554rm2.jpg`,`/home/wolf/team-storage/1554rm3.jpg`]
  
  await uploadMultipleImages(page, elementSelector, filePaths)
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert prompt and button
  await expect(page.locator(`p:text("Your images have been successfully uploaded! homegeniusIQ has identified new filters that will be applied to your search.")`)).toBeVisible();
  await expect(page.locator(`div:text("hgIQ Filters Identified: 9")`)).toBeVisible();
  
  // Assert kitchen
  await page.waitForTimeout(1000)
  await expect(page.locator(`button:text("Kitchen")`)).toBeVisible();
  await page.locator(`button:text("Kitchen")`).click();
  await expect(page.locator(`div:text("1/3")`)).toBeVisible();
  await expect(page.locator(`span:has-text("Room Condition:")`)).toBeVisible();
  
  // Hover and button visible
  await page.waitForTimeout(1000)
  await expect(page.locator(`button:has-text("chevron_left")`).last()).toBeVisible();
  await expect(page.locator(`button:has-text("chevron_right")`).last()).toBeVisible();
  await page.locator(`div:text("1/3")`).hover({force:true});
  await expect(page.locator(`span:text("delete")`)).toBeVisible();
  
  // Go to 2nd image
  await page.waitForTimeout(1000)
  await page.locator(`button:has-text("chevron_right")`).last().click();
  await expect(page.locator(`div:text("2/3")`)).toBeVisible();
  await page.locator(`div:text("2/3")`).hover({force:true});
  await expect(page.locator(`span:text("delete")`)).toBeVisible();
  
  // Go to 3rd image
  await page.waitForTimeout(1000)
  await page.locator(`button:has-text("chevron_right")`).last().click();
  await expect(page.locator(`div:text("3/3")`)).toBeVisible();
  await page.locator(`div:text("3/3")`).hover({force:true});
  await expect(page.locator(`span:text("delete")`)).toBeVisible();
  
  // Reset and apply enabled 
  await page.waitForTimeout(1000)
  await expect(page.locator(`button:text("Advanced Filters")`)).toBeEnabled();
  await page.getByRole(`button`, { name: `Advanced Filters check` }).click();
  await expect(page.getByRole(`button`, { name: `Reset` })).toBeEnabled();
  // Click the Back button
  await page.locator(`div`).filter({ hasText: /^chevron_leftAdvanced Filters$/ }).getByRole(`button`).click();
  // Filter hover
  await page.waitForTimeout(1000)
  await page.locator(`label:has-text("Ceiling: Coffer")`).hover();
  await page.mouse.wheel(0, 1000);
  await expect(page.locator(`label:has-text("Stove: Non-Stainless"):visible`)).toBeVisible();
  await page.mouse.wheel(0, -1000);
  
  // Click goes to bottom
  await page.waitForTimeout(1000)
  await expect(page.locator(`label:has-text("Countertop: Other"):below(label:has-text("Ceiling: Coffer"))`)).toBeVisible();
  await page.waitForTimeout(1000)
  await expect(page.locator(`label:has-text("Dishwasher: Stainless"):below(label:has-text("Countertop: Other"))`)).toBeVisible();
  await page.waitForTimeout(1000)
  await expect(page.locator(`label:has-text("Flooring: Wood"):below(label:has-text("Dishwasher: Stainless"))`)).toBeVisible();
  await page.waitForTimeout(1000)
  await page.locator(`label:has-text("Countertop: Other"):below(label:has-text("Ceiling: Coffer"))`).click({delay: 3000});
  await page.mouse.wheel(0, 1000);
  await page.waitForTimeout(1000)
  await expect(page.locator(`label:has-text("Countertop: Other"):below(label:has-text("Stove: Non-Stainless"))`)).toBeVisible();
  await page.waitForTimeout(1000)
  await expect(page.locator(`label:has-text("Dishwasher: Stainless"):below(label:has-text("Ceiling: Coffer"))`)).toBeVisible();
  await page.waitForTimeout(1000)
  await page.locator(`label:has-text("Countertop: Other"):below(label:has-text("Stove: Non-Stainless"))`).click({delay: 3000});
  await page.mouse.wheel(0, -1000);
  await expect(page.locator(`label:has-text("Countertop: Other"):below(label:has-text("Ceiling: Coffer"))`)).toBeVisible();
  await page.waitForTimeout(1000)
  await expect(page.locator(`label:has-text("Dishwasher: Stainless"):below(label:has-text("Countertop: Other"))`)).toBeVisible();
  await page.waitForTimeout(1000)
  await expect(page.locator(`label:has-text("Flooring: Wood"):below(label:has-text("Dishwasher: Stainless"))`)).toBeVisible();
  
  // delete image
  await page.locator(`div:text("3/3")`).hover({force:true, delay: 3000});
  await page.waitForTimeout(1000)
  await page.locator(`span:text("delete")`).click({});
  await page.waitForTimeout(1000)
  
  // Click advanced filter and filter retains
  await page.locator(`button:text("Advanced Filters")`).click();
  await expect(page.locator(`button:has-text("Apply (")`)).toBeVisible();
  await expect(page.locator(`[aria-haspopup="listbox"]:has-text("Good")`)).toBeVisible();
  await expect(page.locator(`[aria-haspopup="listbox"]:has-text("Yes")`)).toBeVisible();
  await expect(page.locator(`p:text("Refrigerator") ~ div:has-text("Stainless")`)).toBeVisible();
  await expect(page.locator(`p:text("Stove") ~ div:has-text("Stainless")`)).toBeVisible();
  await expect(page.locator(`p:text("Oven") ~ div:has-text("Stainless")`)).toBeVisible();
  await expect(page.locator(`p:text("Kitchen") ~ div:has-text("Wood")`)).toBeVisible();
  await expect(page.locator(`p:text("Kitchen") ~ div:has-text("Other")`)).toBeVisible();
  await expect(page.locator(`p:text("Kitchen") ~ div:has-text("Coffer")`)).toBeVisible();
  
  // select pool yes
  await page.waitForTimeout(500)
  await page.locator(`p:has-text("pool")+div [aria-haspopup="listbox"]`).scrollIntoViewIfNeeded();
  await page.locator(`p:has-text("pool")+div [aria-haspopup="listbox"]`).hover({force:true});
  await page.locator(`p:has-text("pool")+div [aria-haspopup="listbox"]`).click({force:true});
  await page.locator(`li:has-text("yes"):visible`).click();
  
  // Go back and asssert all filters applied
  await page.locator(`button:has-text("chevron_left"):visible`).last().click();
  await expect(page.locator(`div:text("hgIQ Filters Identified: ")`)).toBeVisible();
  await page.getByRole(`button`, { name: `Apply` }).click();
  
  // assert pool choice retain
  await page.locator(`button:has-text("search with ai")`).click()
  await page.getByText(`Search with My Photos`).click();
  await page.locator(`button:text("Advanced Filters")`).click();
  await page.locator(`:text("pool"):visible`).last().scrollIntoViewIfNeeded();
  await expect(page.locator(`p:has-text("pool")+div [aria-haspopup="listbox"]:has-text("yes")`)).toBeVisible();
  
  // Close out advances filter 
  await page.getByRole(`button`, { name: `close` }).nth(2).click();
  await page.waitForTimeout(500)
  
  // Wait for listings to load
  await page.waitForTimeout(30 * 1000);
  
  // Assert first 20 listing are 100% match the hgiq 
  for(let i=0; i < 20 ;i++) {
    await page.waitForTimeout(200)
    const picCard = page.locator(`.card-media-container`).nth(i)
    await expect(picCard.locator(`:text("% match")`)).toBeVisible()
  }
  
  
});