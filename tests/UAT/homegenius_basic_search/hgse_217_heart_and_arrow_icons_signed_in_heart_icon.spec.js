import { assert, expect, test } from "@playwright/test";
import {cleanUpSavedHomes,logInHomegeniusUser, createFlexibleAddressRegex,} from "../../../lib/node_20_helpers.js";

import dotenv from "dotenv";
dotenv.config();

test("hgse_217_heart_and_arrow_icons_signed_in_heart_icon", async () => {
  // Step 1. HGSE-217: Heart and Arrow Icons - "Signed In - Heart Icon"
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Constant
  const address = "Roseville, CA";
  const city = "Roseville";
  const state = "CA";

  // Clean Up
  const { page: cleanUpPage } = await logInHomegeniusUser();

  // -- Clean up Saved Homes
  await cleanUpSavedHomes(cleanUpPage, `${city}, ${state}`);

  // Step 1
  // Access hgre site with valid credentials

  // LOGIN-HGCOM-3050
  // Logged successfully.
  const { page, context } = await logInHomegeniusUser({ slowMo: 2000 });

  /** Click the 'Find a Home' link in the navigation menu */
  await page.getByRole("link", { name: "Find a Home", exact: true }).click();
  await page.waitForTimeout(5000);

  //--------------------------------
  // Act:
  //--------------------------------
  // Step 2
  // Type and search for a valid listed address on the search bar

  // Fill in the address
  await page
    .getByPlaceholder("Address, city, neighborhood,")
    .first()
    .fill(address);

  // Click on City State
  await page.locator(`ul li:has-text("${city}${state}")`).click({ delay: 100 });

  // Click on Search
  await page
    .getByRole(`button`, { name: `Search` })
    .first()
    .click({ delay: 5000 });

  // Click on the first property that's not liked
  await page
    .locator(
      `[data-testid="undecorate"]:has-text("$"):not(:has([d*="M12 21.6229"])) >> nth=0`
    )
    .click();

  // Grab the address on the property
  const addressSavedAssert = await page
    .locator(
      `div:has(div button span:text-is("All Photos")) + div:has(p:text("${state}"))`
    )
    .first()
    .textContent();
  console.log(addressSavedAssert);

  // Step 3
  // Soft assert
  // Validate that the property card displays a black-bordered and white filled heart icon on the top right corner
  await expect(
    page.locator(`nav + div button [name="favorite"] + p:text("Save")`)
  ).toBeVisible();

  //--------------------------------
  // Assert:
  //--------------------------------
  // Step 4
  // Validate that the icon is displayed with the next properties:
  // - Width x Height = 24x24px
  await expect(
    page.locator(`nav + div button [name="favorite"] >> nth=0`)
  ).toHaveAttribute("width", "24");
  await expect(
    page.locator(`nav + div button [name="favorite"] >> nth=0`)
  ).toHaveAttribute("height", "24");

  // - Border Color: #121212
  await expect(
    page.locator(`nav + div button [name="favorite"] >> nth=0`)
  ).toHaveCSS("border-color", "rgb(0, 0, 0)");

  // - Color fill: #FFFFFF
  await expect(
    page.locator(`nav + div button [name="favorite"] >> nth=0 >> g path`)
  ).toHaveCSS("color", "rgb(0, 0, 0)");

  // Step 5
  // Hover over the icon with the mouse and validate that the border of heart icon turns blue. Fill color should be #FFFFFF.
  await page.locator(`nav + div button [name="favorite"] >> nth=0`).hover();
  await expect(
    page.locator(`nav + div button [name="favorite"] >> nth=0`)
  ).toHaveCSS("border-color", "rgb(31, 31, 255)");

  // Step 6
  // Click on the heart icon. Validate that the heart icon turns black,
  await page.locator(`nav + div button [name="favorite"] >> nth=0`).click();
  await page.getByRole(`button`, { name: `arrow_back Search` }).hover();
  await expect(
    page.locator(`nav + div button [name="favorite"] >> nth=0 >> g path`)
  ).toHaveCSS("color", "rgb(0, 0, 0)");

  // Step 7
  // Click on the "Saved Homes" option on the top menu bar.
  // Click on Account
  await page.waitForTimeout(5000);
  await page.getByRole(`button`, { name: `ACCOUNT` }).click({ delay: 5000 });

  await page.waitForTimeout(5000);
  // Click on Saved Homes
  await page.getByRole(`link`, { name: `Saved Homes` }).click({ delay: 5000 });

  // Step 8
  // Validate that the previously selected home with the white heart icon is properly displayed on the Saved Homes page. Fill color should be #FFFFFF.

  // Assert address saved is showing on page
  await expect(
    page.locator(`[data-testid="undecorate"]:has-text("${addressSavedAssert}")`)
  ).toBeVisible();

  // Assert the Heart icon is filled black color
  await expect(
    page.locator(
      `[data-testid="undecorate"]:has-text("${addressSavedAssert}") span:text("favorite")`
    )
  ).toHaveCSS("color", "rgb(0, 0, 0)");

  // Step 2. Find Multiple Homes & Use Heart to Save Homes
  //--------------------------------
  // Arrange:
  //--------------------------------

  //--------------------------------
  // Act:
  //--------------------------------

  // Step 9
  // Select the "Find a Home" option on the top menu bar. Search for a city.

  /** Click the 'Find a Home' link in the navigation menu */
  await page.getByRole("link", { name: "Find a Home", exact: true }).click();
  await page.waitForTimeout(5000);

  // Fill in the address
  await page
    .getByPlaceholder("Address, city, neighborhood,")
    .first()
    .fill(address);

  // Click on Flushing New York
  await page.locator(`ul li:has-text("${city}${state}")`).click({ delay: 100 });

  // Click on Search
  await page
    .getByRole(`button`, { name: `Search` })
    .first()
    .click({ delay: 5000 });

  //--------------------------------
  // Assert:
  //--------------------------------
  // Step 10
  // Validate that the heart Icon on Property Cards is displayed with the next specifications:
  // - Width x Height = 24x24px
  await expect(
    page.locator(`button svg[name="favorite"] >> nth=1`)
  ).toHaveAttribute("width", "24");
  await expect(
    page.locator(`button svg[name="favorite"] >> nth=1`)
  ).toHaveAttribute("height", "24");

  // - Border Color: #121212
  await expect(page.locator(`button svg[name="favorite"] >> nth=1`)).toHaveCSS(
    "border-color",
    "rgb(0, 0, 0)"
  );

  // - Color fill: #FFFFFF
  await expect(
    page.locator(`button svg[name="favorite"] >> nth=1 >> g path`)
  ).toHaveCSS("color", "rgb(0, 0, 0)");

  // Step 11
  // Hover over the icon with the mouse and validate that the heart icon turns blue. Fill color should be #FFFFFF.
  await page.locator(`button svg[name="favorite"] >> nth=1`).hover();
  await expect(page.locator(`button svg[name="favorite"] >> nth=1`)).toHaveCSS(
    "border-color",
    "rgb(31, 31, 255)"
  );

  // Step 12
  // Click on the heart icon of different property cards. Validate that the heart icon turns completely white. Fill color should be #FFFFFF.
  await page
    .locator(`button svg[name="favorite"] >> nth=1`)
    .click({ delay: 3000 });
  await page.getByRole(`button`, { name: address }).hover();
  await expect(
    page.locator(`button svg[name="favorite"] >> nth=1 >> g path`)
  ).toHaveCSS("color", "rgb(0, 0, 0)");

  // Step 13
  // Click on the "Saved Homes" option on the top menu bar.
  const addressSaved = await page
    .locator(
      `[data-testid="undecorate"]:has-text("$") >> nth=1 >> [type="LARGE_CARD"] >> nth=0`
    )
    .textContent();
  const addressSavedLine1 = addressSaved.split(city)[0];

  // Click on Account
  await page.getByRole(`button`, { name: `ACCOUNT` }).click();

  // Click on Saved Homes
  await page.getByRole(`link`, { name: `Saved Homes` }).click();

  // Step 14
  // Validate that the previously selected homes with the white heart icon is properly displayed on the Saved Homes page. Fill color should be #FFFFFF.

  // Validate that the previously selected home with the white heart icon is properly displayed
  const regex = createFlexibleAddressRegex(addressSavedLine1);
  console.log("Regex being tested:", regex);
  await expect(
    page.locator('[data-testid="undecorate"]', { hasText: regex })
  ).toBeVisible();

  // Assert the Heart icon is filled black color
  await expect(
    page
      .locator('[data-testid="undecorate"]', { hasText: regex })
      .locator(`span:text("favorite")`)
  ).toHaveCSS("color", "rgb(0, 0, 0)");

  // -- Clean up Saved Homes
  await cleanUpSavedHomes(page, `${city}, ${state}`);
});
 