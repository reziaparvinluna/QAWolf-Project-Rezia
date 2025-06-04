import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_1477_uploading_image_redesign", async () => {
 // Step 1. HGSE-1477: Uploading Image Redesign
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Login to Homeogenius UAT-Portal
  const {page,context} = await logInHomegeniusUser()
  
  // if find a home bugged out, go to search directly
  // Take current url
  const url = page.url()
  console.log(url)
  
  // Go to home search and wait for load
  await page.goto(`${url}home-search`);
  
  //--------------------------------
  // Act:
  //--------------------------------
  // Filter by image and example image
  await page.locator(`button:has-text("search with ai")`).click()
  await page.getByText(`Search with My Photos`).click();
  
  //--------------------------------
  // Assert example images:
  //--------------------------------
  // Assert header
  await expect(page.getByText(`Upload up to 3 room photos to filter and view matching properties. Want to describe features with text?`)).toBeVisible();
  await expect(page.getByText(`Choose a file or drag it here`)).toBeVisible();
  
  
  // Assert example images
  // default not shown
  await expect(page.locator(`div:has(>div:text-is("Example Images")) + span:has-text("expand_less")`)).not.toBeVisible();
  // open
  await page.getByText(`Example Images`).click();
  // header shown
  await expect(page.locator(`:text("Example ImagesDon't have an image to upload? Try one of our presets.expand_less")`)).toBeVisible();
  // shown
  await expect(page.locator(`div[open] >div>> div `).first()).toBeVisible();
  // click on 1st preset
  await page.locator(`div[open] >div>> div `).first().click()
  // tab list shown
  await expect(page.getByText(`hgIQ Filters Identified:`)).toBeVisible();
  // reset
  await page.getByRole(`button`, { name: `Start Over` }).click();
  await page.getByRole(`button`, { name: `Confirm` }).click();
  // assert reset works
  await expect(page.getByText(`hgIQ Filters Identified:`)).not.toBeVisible();
  
  // Close the filter
  await page.locator(`div`).filter({ hasText: /^Search with AIclose$/ }).getByRole(`button`).click();
  
  //--------------------------------
  // Assert example images:
  //--------------------------------
  // Filter by image and example image
  await page.getByRole(`button`, { name: `SEARCH WITH AI` }).click();
  // default - images are collapsed
  await expect(page.getByText(`My uploadsAccess your previously uploaded images.expand_more`)).toBeVisible();
  // click my uploads
  await page.getByText(`My uploads`).click();
  // shown
  await expect(page.getByText(`My uploadsAccess your previously uploaded images.expand_less`)).toBeVisible();
  
  //--------------------------------
  // Assert example upload correct images:
  //--------------------------------
  const elementSelector = `:text("Choose a file")`;
  const filePaths = [`/home/wolf/team-storage/room1.jpg`, `/home/wolf/team-storage/room2.jpg`, `/home/wolf/team-storage/room3.jpg`]
  
  // Upload Images
  await uploadMultipleImages(page, elementSelector, filePaths)
  
  // assert successfuly, tabs shown
  await expect(page.locator(`p:text("Your images have been successfully uploaded! homegeniusIQ has identified new filters that will be applied to your search.")`)).toBeVisible({ timeout: 60 * 1000 });
  await expect(page.locator(`button:text("Multi-Purpose Room")`)).toBeVisible();
  await expect(page.locator(`button:text("Bedroom")`)).toBeVisible();
  
  // reset and apply enabled 
  await page.getByRole(`button`, { name: `Advanced Filters check` }).click();
  await expect(page.locator(`button:text("Reset")`)).toBeEnabled()
  await expect(page.locator(`button:text("Reset") + button:text("Apply")`)).toBeEnabled();
  
  // reset
  await page.locator(`button:text("Reset")`).click()
  
  //--------------------------------
  // Assert example upload incorrect images:
  //--------------------------------
  // Click on Search with AI
  await page.locator(`button:has-text("search with ai")`).click({delay: 3000})
  await page.getByText(`Search with My Photos`).click();
  await page.getByRole(`button`, { name: `Start Over` }).click();
  await page.getByRole(`button`, { name: `Confirm` }).click();
  
  const filePaths2 = [`/home/wolf/team-storage/homegenius_code_05_10_24.json`, `/home/wolf/team-storage/blurred-terrace-entrance.jpg`, `/home/wolf/team-storage/bedroom.jpg`]
  
  // Upload Multiple Images
  await uploadMultipleImages(page, elementSelector, filePaths2)
  
  await expect(page.locator(`
    p:text("Invalid file type(s) for some selected files. Please use jpeg, png or jpg")`
  )).toBeVisible({timeout: 60 * 1000});
  
});