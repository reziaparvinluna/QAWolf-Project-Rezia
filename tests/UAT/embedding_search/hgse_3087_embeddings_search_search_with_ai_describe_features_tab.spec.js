const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius, faker} = require("../../../lib/node_20_helpers");

test("hgse_3087_embeddings_search_search_with_ai_describe_features_tab", async () => {
 // Step 1. HGSE-3087 [Embeddings Search] Search with AI - Describe Features Tab, before upload
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  //--------------------------------------Step 1------------------------------------
  //--------------------------------------------------------------------------------
  // Login to https://qa-portal.homegeniusrealestate.com/
  // Under AC, all the figma design are present for new designs
  // https://qa-portal.homegeniusrealestate.com/ is launched
  
  const { page, context } = await logInHomegeniusUser({slowMo: 300});
  
  /** Click the 'Find a Home' link in the navigation menu */
  await page.getByRole("link", { name: "Find a Home", exact: true }).click();
  await page.waitForTimeout(5000);
  
  //--------------------------------------Step 2------------------------------------
  //--------------------------------------------------------------------------------
  // Make a search and navigate to home search page and select 'Search With AI'
  // Search with AI modal is launched
  
  // Fill in two letters
  await page.getByPlaceholder("Address, city, neighborhood,").first().fill("Ne");
  
  // Click on New York
  await page.locator(`ul li:has-text("New York"):visible`).click({ delay: 1000, timeout: 45_000 });
  
  // Click on Search
  await page
    .getByRole(`button`, { name: `Search` })
    .first()
    .click({ delay: 5000 });
  
  //--------------------------------
  // Act:
  //--------------------------------
  //--------------------------------------Step 3------------------------------------
  //--------------------------------------------------------------------------------
  // The Search with AI Modal will open defaulted to Describe Features tab
  // >A variation of this, is when a user performs a homegeniusIQ search from the
  // landing page, then when being routed to search results page, then Search with
  // AI will open up and default to Search with AI Modal.
  // Search with AI opened up and default to Search with AI Modal
  
  // Click on Search with AI
  await page.getByRole(`button`, { name: `SEARCH WITH AI` }).click();
  
  // Soft Assert Search with AI modal is displaying
  await expect(page.locator(`h3:text("Search with AI")`)).toBeVisible();
  
  // Soft Assert defaulted to Features tab
  await expect(page.locator(`div:text("Describe Features")`)).toHaveCSS(
    "color",
    "rgb(31, 31, 255)",
  );
  await expect(page.locator(`div:text("Describe Features")`)).toHaveCSS(
    "border-bottom",
    "4px solid rgb(31, 31, 255)",
  );
  
  //--------------------------------------Step 4------------------------------------
  //--------------------------------------------------------------------------------
  // Select Search with My Photos tab
  // https://www.figma.com/design/qn28OPrjWQ7hmbRrkmTYTT/Ai-Filter-Option?node-id=1952-291634&t=Gve4ca6ztmkm4grX-4
  // See figma designs - This tab will function like the existing Filter by Image
  // modal, but with design changes.
  // Tab subtext copy: Upload up to 3 room photos to filter and view matching properties.
  // Want to describe features with text? Click Here
  
  // Click on Search with My Photos
  await page.getByText(`Search with My Photos`).click();
  
  // Soft assert text message
  await expect(
    page.locator(
      `div:text("Upload up to 3 room photos to filter and view matching properties. Want to describe features with text? Click Here")`,
    ),
  ).toBeVisible();
  
  //--------------------------------------Step 5------------------------------------
  //--------------------------------------------------------------------------------
  // Click Here is a link and when selecting it will take the user to the Describe Features tab
  // Upload photo area design changes include:
  // a. New upload cloud icon
  // b. Choose a file or drag is here (Choose a file is selectable and will open prompt to browser for photos)
  // c. Additional text copy: "File types: jpeg, png or jpg"
  // d. see States section for for default and hover state
  
  // Click on Click Here
  await page.getByRole(`link`, { name: `Click Here` }).click();
  
  // Soft Assert we are back at the Describe Feature tab
  await expect(page.locator(`div:text("Describe Features")`)).toHaveCSS(
    "color",
    "rgb(31, 31, 255)",
  );
  await expect(page.locator(`div:text("Describe Features")`)).toHaveCSS(
    "border-bottom",
    "4px solid rgb(31, 31, 255)",
  );
  
  // Click on Search with My Photos to go back
  await page.getByText(`Search with My Photos`).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert Upload Cloud Icon
  await expect(page.locator(`span:text("cloud_upload")`)).toHaveScreenshot(
    "upload_cloud_icon",
    { maxDiffPixelRatio: 0.01 },
  );
  
  // Assert text message
  await expect(
    page.locator(`div:text("Choose a file or drag it here")`),
  ).toBeVisible();
  await expect(
    page.locator(`div:text("File types: jpeg, png or jpg")`),
  ).toBeVisible();
  
  // Assert Hover State
  await expect(async () => {
    await page.locator(`div:text("Choose a file or drag it here")`).hover();
    await expect(
      page.locator(`[role="presentation"]:has-text("Choose a file")`),
    ).toHaveCSS("background-color", "rgb(233, 243, 255)");
  }).toPass({ timeout: 30_000 });
  
 // Step 2. HGSE-3087 [Embeddings Search] Search with AI - Describe Features Tab, after upload
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  //--------------------------------
  // Act:
  //--------------------------------
  //--------------------------------------Step 6------------------------------------
  //--------------------------------------------------------------------------------
  // Once photos are uploaded
  // a. Copy: "Your images have been successfully uploaded! homegeniusIQ has identified new filters that will be applied to your search."
  // b. X will appear for user to close the message
  
  // Drag and drop the image
  let fileName = "kitchen.jpeg";
  await dragAndDropFile(
    page,
    `[id="instructions-text"]`,
    `/home/wolf/team-storage/${fileName}`,
  );
  
  // Assert Message
  await expect(
    page.getByText(
      `Your images have been successfully uploaded! homegeniusIQ has identified new filters that will be applied to your search.`,
    ),
  ).toBeVisible();
  
  // Assert It has an X to close message
  await expect(
    page.locator(
      `p:text("Your images have been successfully uploaded! homegeniusIQ has identified new filters that will be applied to your search.") + button:has-text("close")`,
    ),
  ).toBeVisible();
  
  //--------------------------------------Step 7------------------------------------
  //--------------------------------------------------------------------------------
  // Once photos are uploaded
  // a. The individual rooms will be displayed across the top per new designs
  // b. Room photos displayed on left per new designs
  // c. User may delete the photo using trash icon on to right
  // d. See States section for default and hover state
  
  // Assert Room is displaying
  await expect(page.getByRole(`button`, { name: `Kitchen` })).toBeVisible();
  
  // Assert Photo displaying
  await expect(async () => {
    await expect(
      page.locator(`div:has([id="delete-embeded-batch-icon-btn"]) img`),
    ).toHaveScreenshot("embedded_kitchennew", { maxDiffPixelRatio: 0.05 });
  }).toPass({ timeout: 30_000 });
  
  // Assert trash icon on hover state
  await expect(async () => {
    await page
      .locator(`div:has([id="delete-embeded-batch-icon-btn"]) img`)
      .hover();
    await expect(
      page.locator(`[id="delete-embeded-batch-icon-btn"]`),
    ).toBeVisible();
  }).toPass({ timeout: 30_000 });
  
  //--------------------------------------Step 8------------------------------------
  //--------------------------------------------------------------------------------
  // Note: Rezia confirmed no confirmation modal is expected now 11/7/24
  // Deleting the photo will open a delete confirmation pop-up
  // a. Copy: Are you sure you want to delete this photo?
  // b. Cancel to go back without deleting
  // c. Confirm to continue with Deleted; photo will be removed along with objects associated with it.
  // d. Room objects displayed to the right as existing but with updated designs and copy
  
  // Delete a Photo
  await expect(async () => {
    await page
      .locator(`div:has([id="delete-embeded-batch-icon-btn"]) img`)
      .hover();
    await page.locator(`[id="delete-embeded-batch-icon-btn"]`).click();
  }).toPass({ timeout: 30_000 });
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // Assert image is deleted
  await expect(
    page.locator(`div:has([id="delete-embeded-batch-icon-btn"]) img`),
  ).not.toBeVisible();
  
  //--------------------------------------Step 10-----------------------------------
  //--------------------------------------------------------------------------------
  // Example Images
  // a. collapsible section - main change is description text will be in second line
  // b. Collapsed by default
  // c. Selecting an example photo will be treated as a images and not preset batches.
  
  // Assert Example Images and text
  await expect(page.getByText(`Example Images`)).toBeVisible();
  await expect(
    page.getByText(`Don't have an image to upload? Try one of our presets.`),
  ).toBeVisible();
  
  // Click on Dropdown/Collapse
  await page.locator(`.css-5p07fs > .material-icons`).first().click();
  
  // Assert there are example images
  await expect(page.locator(".css-193uwxg")).toBeVisible({ timeout: 30_000 });
  
  //--------------------------------------Step 11-----------------------------------
  //--------------------------------------------------------------------------------
  // My uploads - updated per new design
  // a. collapsible section - main change is description text will be in second line
  // b. collapsed by default
  
  // Assert My Uploads and Text
  await expect(page.getByText(`My uploads`)).toBeVisible();
  await expect(
    page.getByText(`Access your previously uploaded images`),
  ).toBeVisible();
  
  // Click on Dropdown/Collapse
  await page
    .locator(`div:has-text("My Uploads") span:text("expand_more")`)
    .click();
  
  // Assert there are image from previous upload
  // Unable to find a good selector for this section
  await expect(
    page
      .locator(`div:has-text("My Uploads")`)
      .last()
      .locator("..")
      .locator("..")
      .locator(".."),
  ).toHaveScreenshot("my-uploads-screenshot", { maxDiffPixelRatio: 0.25 });
  
  //--------------------------------------Step 9------------------------------------
  //--------------------------------------------------------------------------------
  // Add Photos
  // a. Once a user has successfully uploaded at least one photo, Add Photos will appear in bottom right
  // b. Selecting this will open the upload photo in a new page within the body of the tab
  // c. This page will have a back button to get back to main page with photo object results
  // This button should be disabled if there are 3 photos already uploaded
  // d. The current batch process that only allows uploading once, should now allow users to continue to add and remove photos and redisplay the results
  
  // Upload back the photo
  await dragAndDropFile(
    page,
    `[id="instructions-text"]`,
    `/home/wolf/team-storage/${fileName}`,
  );
  
  // Click on Add Photos
  await page.getByRole(`button`, { name: `Add Photos` }).click();
  
  // Assert Back Button
  await expect(
    page.getByRole(`button`, { name: `arrow_back Back` }),
  ).toBeVisible();
  
  // Upload two more images
  const filePaths = [
    `/home/wolf/team-storage/uploadImage38.jpg`,
    `/home/wolf/team-storage/uploadImage40.jpg`,
  ];
  await uploadMultipleImages(page, '[id="instructions-text"]', filePaths);
  
  // Assert the Add Photos button is now disabled
  await expect(page.getByRole(`button`, { name: `Add Photos` })).toBeDisabled({
    timeout: 60 * 1000,
  });
  
  // Assert New Buttons and Kitchen Button
  await expect(page.getByRole(`button`, { name: `Kitchen` })).toBeVisible();
  await expect(page.getByRole(`button`, { name: `Bedroom` })).toBeVisible();
  await expect(page.getByRole(`button`, { name: `Bathroom` })).toBeVisible();
  
});