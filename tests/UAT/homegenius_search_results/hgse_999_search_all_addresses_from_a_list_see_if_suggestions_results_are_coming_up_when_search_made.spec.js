import { assert, expect, test, getInbox, launch, dotenv, PNG, dateFns, faker, axios, fse, playwright } from '../../qawHelpers';

test("hgse_999_search_all_addresses_from_a_list_see_if_suggestions_results_are_coming_up_when_search_made", async () => {
 // Step 1. HGSE-999 Search all addresses from a list & see suggestions/results are coming up when search made
  // Function to read the excel file and return an object
  async function getCsvData(filePath) {
    const { readFile } = await import("node:fs/promises");
    const csvData = await readFile(filePath, "utf8");
  
    const rows = csvData.split("\r\n");
  
    // Extract the header row
    const header = rows[0].split(",").map((h) => h.trim());
  
    // Extract the data rows
    const dataRows = rows.slice(1).filter((row) => row.trim() !== "");
  
    // Create an array of objects
    const result = dataRows.map((row) => {
      const values = row.split(",").map((value) => value.trim());
      const obj = {};
      header.forEach((key, index) => {
        obj[key] = values[index];
      });
      return obj;
    });
  
    return result;
  }
  
  // Function to check the suggested address contain at least 1 of the search words
  function containsSearchTerm(words, str) {
    // Excemptions
    let acceptWords;
    if (words.includes("Enfield")) {
      acceptWords = [...words, "03749", "NH"]; // zip 03749 is Enfield Center, NH
      console.log("Contain special words");
    } else if (words.includes("Shoals")) {
      console.log("Contain special words");
      acceptWords = [...words, "28077", "NC"]; //zip 28077 is High Shoals, NC
    } else if (words.includes("Unionville")) {
      console.log("Contain special words");
      acceptWords = [...words, "43077", "OH"]; //zip 28077 is High Shoals, NC
    } else {
      acceptWords = [...words];
    }
    const pattern = new RegExp(`(${acceptWords.join("|")})`, "i");
    console.log(pattern);
    return pattern.test(str);
  }
  
  // Ignore endings with s
  function ignoreS(words) {
    const exceptions = ["Heights", "Condominiums"];
    return words.map((word) => {
      if (exceptions.includes(word)) {
        return word.slice(0, -1); // Remove the last character
      }
      return word;
    });
  }
  
  // File constants
  const filePath = "/home/wolf/team-storage/MultisearchTest.csv";
  
  // Read and get the addresses from CSV File
  const addressList = await getCsvData(filePath);
  console.log(addressList[0], addressList.length);
  expect(addressList.length).toEqual(985);
  //--------------------------------
  // Arrange:
  //--------------------------------
  //--------------------------------------Step 1------------------------------------
  //--------------------------------------------------------------------------------
  // Navigate to application URL
  // qa-portal.homegeniusrealestate.com
  // uat-portal.homegeniusrealestate.com
  // User should be on Home page of the application
  const { browser, context, page } = await goToHomegenius();
  
  // Cick on Renovation Studio modal to close
  try {
    await page.getByRole(`button`, { name: `Maybe Later` }).click();
  } catch {
    console.log('No need to close')
  }
  
  // Click on Find a Home
  await page.getByRole(`link`, { name: `Find a Home`, exact: true }).click();
  
  //--------------------------------
  // Act & Assert:
  //--------------------------------
  //--------------------------------------Step 2------------------------------------
  //--------------------------------------------------------------------------------
  // Search all addresses from a list attached here on the csv file 'MultisearchTest'
  // User should be able to see that suggestions/results are coming up when search are made
  
  for (let i = 0; i < addressList.length; i++) {
    // Address
    const inputAddress = `${addressList[i]["name"]}, ${addressList[i]["state"]}`;
    const searchArray =
      `${addressList[i]["name"]} ${addressList[i]["state"]}`.split(" ");
    const assertArray = ignoreS(searchArray);
    console.log(assertArray);
  
    // Retry logic for the expect().toPass block
    const maxRetries = 3;
    let attempt = 0;
    let success = false;
  
    while (attempt < maxRetries && !success) {
      try {
        attempt++;
        console.log(`Attempt ${attempt} for address index ${i}`);
  
        // Fill in the address
        await page
          .locator(
            `[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`,
          )
          .first()
          .type(`${inputAddress}`, { delay: 50 });
  
        await expect(async () => {
          const suggestedAddress = await page
            .locator(`ul [role="option"]:visible`)
            .allTextContents();
  
          // Assert that there is at least one suggestion
          expect(suggestedAddress.length).toBeGreaterThanOrEqual(1, {
            timeout: 1000,
          });
  
          // Assert that each suggestion contains at least one search term
          for (let j = 0; j < suggestedAddress.length; j++) {
            expect(
              containsSearchTerm(assertArray, suggestedAddress[j]),
            ).toBeTruthy();
          }
        }).toPass({ timeout: 10_000 });
  
        // If no error is thrown, mark as success to exit the retry loop
        success = true;
        console.log(`Success on attempt ${attempt} for address index ${i}`);
      } catch (error) {
        console.error(
          `Attempt ${attempt} failed for address index ${i}: ${error.message}`,
        );
  
        if (attempt < maxRetries) {
          // Wait for a short period before retrying
          console.log(`Retrying after delay...`);
          await page.waitForTimeout(1000); // 1 second delay
        } else {
          // After max retries, throw the error to fail the test or handle accordingly
          console.error(
            `All ${maxRetries} attempts failed for address index ${i}.`,
          );
          throw new Error(
            `Failed to validate suggestions for address index ${i}: ${error.message}`,
          );
        }
      }
      // Clear the search field
      await expect(async () => {
        await page
          .locator(
            `[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`,
          )
          .first()
          .fill(``);
        await expect(
          page
            .locator(
              `[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`,
            )
            .first(),
        ).toHaveValue("", { timeout: 1000 });
      }).toPass({ timeout: 5000 });
    }
  }
  
});