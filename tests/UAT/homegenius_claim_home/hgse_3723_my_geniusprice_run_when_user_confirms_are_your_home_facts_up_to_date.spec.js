const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius} = require("../../../lib/node_20_helpers");

test("hgse_3723_my_geniusprice_run_when_user_confirms_are_your_home_facts_up_to_date", async () => {
 // Step 1. HGSE-3723: MyGeniusprice run when user confirms "Are your home facts up to date?
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constants
  const searchAddress = {
    searchAddress: "4940 Pinebrook Drive, Fort Wayne, IN 46804",
    searchAddr2: "4940 Pinebrook Dr",
    addressLineOne: "4940 Pinebrook Dr",
    addressLineTwo: "Fort Wayne, IN 46804",
    addressAssert: "4940 Pinebrook Dr",
    addressAssert2: "Fort Wayne, IN 46804",
  };
  
  // 1
  // Perform a search
  // Claim a property
  
  // Login to Homeogenius UAT-Portal
  const { page } = await logInHomegeniusQAUser();
  
  // Clean Up
  try {
    await unclaimProperty(page, searchAddress);
  } catch (error) {
    console.log(error);
  }
  
  // Claim the property
  await claimProperty(page, searchAddress);
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // 2
  // Go to Edit Home Facts page
  // Make no edits to the data or photos
  
  // Click on Edit for Your Home Facts
  await page.getByRole(`button`, { name: `edit Edit` }).click({delay: 3000});
  
  // Click Continue
  await page.getByRole(`button`, { name: `Continue` }).click({delay: 3000});
  
  // 3
  // Click the 'Skip and Close' button
  // View the Claimed View 'Your Home Facts' section and see the
  // "Are your home facts up to date?"
  
  // Click on "Skip and Close"
  await page.getByRole(`button`, { name: `Skip and Close` }).click();
  
  // Click on Close
  await page.getByRole(`button`, { name: `Close`, exact: true }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  // 4
  // Click "Yes they are"
  // https://www.figma.com/design/dw2RHEkuIxng9A3jJAOnws/Review-Document?node-id=1490-15528&t=fSEQgOg0laKt0ttb-4
  // Expected behavior:
   
  // The 'Are your home facts up to date?' message disappears
  // The mygeniusprice value is run with the default/confirmed data 
  // and a value is displayed at the top of the page
  // Edge case: if there are default data that are missing/incomplete 
  // or in violation of mygeniusprice rules (e.g., room counts in excess 
  // of permissible entry values), then take the user to the edit data 
  // modal to view those issues and resolve.
   
   
   
   
   
   
   
  
  
  
  
  
  
  
});