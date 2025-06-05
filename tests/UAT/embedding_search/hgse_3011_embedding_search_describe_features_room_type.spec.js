const { test,expect, launch } = require("../../../lib/qawHelpers");
const { logInHomegeniusUser, goToHomegenius, faker} = require("../../../lib/node_20_helpers");

test("hgse_3011_embedding_search_describe_features_room_type", async () => {
 // Step 1. 1. HGSE-3011 [Embedding Search] Describe Features - Room Type
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  const city = "Miami";
  const state = "FL";
  const roomType = "Kitchen";
  const roomDescription = "White cabinets";
  
  const { page } = await goToHomegenius({ slowMo: 500 });
  
  // Click the Find a Home link in the nav
  await page.getByRole(`link`, { name: `Find a Home`, exact: true }).click();
  
  // Fill the search field with the city and state
  await page
    .locator(
      `[placeholder="Address, city, neighborhood, ZIP, school/district, MLS#"]`,
    )
    .first()
    .type(`${city}, ${state}`, { delay: 100 });
  
  // Click the correct option from the dropdown
  await page.locator(`:text("${city}${state}")`).first().click({ delay: 1000 });
  
  // Click Search
  await page.getByRole(`button`, { name: `Search` }).first().click();
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Click the SEARCH WITH AI button
  await page.getByRole(`button`, { name: `SEARCH WITH AI` }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // Assert the Apply button is disabled to start
  await expect(page.getByRole('button', { name: 'Apply' })).toBeDisabled();
  
  // Assert the Describe Features button is selected by checking for Blue color
  await expect(page.getByText(`Describe Features`)).toHaveCSS(
    `color`,
    "rgb(31, 31, 255)",
  );
  
  // User should see three selections across the top. >Room Type 1 - (selected by Default), Room Type 2, Room Type 3
  // Assert that Room Type 1 is Selected by checking for a Blue background
  await expect(page.getByRole(`button`, { name: `Room Type 1` })).toHaveCSS(
    "background-color",
    "rgb(31, 31, 255)",
  );
  
  // Assert that Room Type 2 and Room Type 3 are visible
  await expect(page.getByRole(`button`, { name: `Room Type 2` })).toBeVisible();
  await expect(page.getByRole(`button`, { name: `Room Type 3` })).toBeVisible();
  
  // Assert the Start Over button is not visible
  await expect(page.getByRole(`button`, { name: `Start Over` })).not.toBeVisible();
  
  // Assert the Delete Room button is disabled
  await expect(page.getByRole(`button`, { name: `Delete Room` })).toBeDisabled();
  
 // Step 2. 2. Describe Features - Room Types - Check Persistence
  //--------------------------------
  // Arrange:
  //--------------------------------
  // User does not need to start with Room 1, they can choose any of the 3 and begin entering Room Type and Desired Features
  // Start with Room 2
  await page.getByRole(`button`, { name: `Room Type 2` }).click();
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Once the user enters Room type field below, the labels will be replaced with the the User selection/entry
  await page.getByRole(`combobox`, { name: `Room Type` }).fill(`${roomType}`);
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // Once the user enters Room type field below, the labels will be replaced with the the User selection/entry
  // Assert that the Room Type 2 button changes to {roomType}
  await expect(
    page.getByRole(`button`, { name: `Room Type 2` }),
  ).not.toBeVisible();
  await expect(page.getByRole(`button`, { name: `${roomType}` })).toBeVisible();
  
  // As user enters data, it will be saved and can switch back and forth between the 3 room selections
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Fill the textbox with the room description
  await page
    .getByRole(`textbox`, { name: `e.g., white cabinets, wood` })
    .fill(`${roomDescription}`);
  
  // Switch to Room Type 1
  await page.getByRole(`button`, { name: `Room Type 1` }).click();
  
  // Switch back to Room Type 2 ({roomType})
  await page.getByRole(`button`, { name: `${roomType}` }).click();
  
  //--------------------------------
  // Assert: Persistence
  //--------------------------------
  
  // Assert the room type and description persist after switching between rooms
  await expect(page.getByRole(`combobox`, { name: `Room Type` })).toHaveValue(
    `${roomType}`,
  );
  await expect(
    page.getByRole(`textbox`, { name: `e.g., white cabinets, wood` }),
  ).toHaveValue(roomDescription);
  
 // Step 3. 3. Describe Features - Room Types - Preset Categories
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  // Slight timeout
  await page.waitForTimeout(1000);
  
  // Room_Types_List.xlsx (Using predefined list to avoid 3rd party xlsx reader)
  const popularRooms = ["Kitchen", "Bathroom", "Bedroom", "Living Room", "Patio"];
  
  const moreRooms = [
    "Art Studio",
    "Attic",
    "Backyard",
    "Balcony",
    "Basement",
    "Bathroom",
    "Bedroom",
    "Carport",
    "Carriage House",
    "Cinema",
    "Closet",
    "Conservatory",
    "Courtyard",
    "Deck",
    "Den",
    "Dining Room",
    "Driveway",
    "Entryway",
    "Exercise Room",
    "Exterior Back",
    "Exterior Front",
    "Family Room",
    "Finished Basement",
    "Florida Room",
    "Foyer",
    "Front yard",
    "Game Room",
    "Garage",
    "Garage",
    "Garden",
    "Gazebo",
    "Guest Room",
    "Gym",
    "Home Gym",
    "Home Office",
    "Home Theater",
    "Kitchen",
    "Lanai",
    "Laundry Room",
    "Library",
    "Living Room",
    "Master Bedroom",
    "Mudroom",
    "Music Room",
    "Office",
    "Outdoor kitchen",
    "Pantry",
    "Patio",
    "Pergola",
    "Playroom",
    "Porch",
    "Recreation Room",
    "Sauna",
    "Shed",
    "Study",
    "Sunroom",
    "Terrace",
    "Theater",
    "Three-season Room",
    "Unfinished Basement",
    "Veranda",
    "Walkway",
    "Wine Cellar",
    "Workshop",
  ];
  
  // Go to Room 1
  await page.getByRole(`button`, { name: `Room Type 1` }).click();
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Click in the Enter Room Type field
  await page.getByRole(`combobox`, { name: `Room Type` }).click();
  
  // When user engages the field the pre-populated text will disappear
  // This screenshot should be a blank rectangle. If there was a placeholder you would see placeholder text
  await expect(async () => {
    await expect(
      page.getByRole(`combobox`, { name: `Room Type` }),
    ).toHaveScreenshot("no_placeholder", { maxDiffPixelRatio: 0.01 });
  }).toPass({ timeout: 30 * 1000 });
  
  // Wait for the dropdown to be visible
  const dropdownOptions = page.locator(
    `ul:has-text("Popular Rooms"):visible li:visible`,
  );
  await dropdownOptions.first().waitFor();
  
  // Get all of the options in the dropdown
  const fullDropdownOptionsList = await dropdownOptions.allTextContents();
  
  // Split by Popular Rooms and More Rooms
  const popularRoomsInDropdown = fullDropdownOptionsList.slice(1, 6);
  const moreRoomsInDropdown = fullDropdownOptionsList.slice(7);
  
  // Get the selector for the gray separator
  const separator = page
    .getByRole("listbox", { name: "Room Type" })
    .getByRole("separator");
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // When user engages the field, selected state will appear with blue border
  await expect(
    page.getByRole(`combobox`, { name: `Room Type` }).locator(".."),
  ).toHaveCSS("border", "1px solid rgb(31, 31, 255)");
  
  // A gray bar will be used to separate the categories
  await expect(separator).toHaveCSS(
    "border-bottom",
    "1px solid rgb(184, 184, 184)",
  );
  
  // The element following the separator should be the More Rooms category
  await expect(
    separator.locator("..").locator("xpath=following-sibling::*").first(),
  ).toContainText("More Rooms");
  
  // List will be separated by two categories: Popular Rooms and More Rooms
  expect(fullDropdownOptionsList[0]).toBe("Popular Rooms");
  expect(fullDropdownOptionsList[6]).toBe("More Rooms");
  
  // Without typing, once cursor is placed in the entry field, a list of suggested values will appear
  // Assert that each expected item in popularRooms is in popularRoomsInDropdown
  for (const room of popularRooms) {
    expect(moreRoomsInDropdown).toContain(room);
    // Popular Rooms will be repeated in the More Rooms category
    expect(popularRoomsInDropdown).toContain(room);
  }
  
  // Assert that each expected item in moreRooms is in moreRoomsInDropdown
  for (const room of moreRooms) {
    expect(moreRoomsInDropdown).toContain(room);
  }
  
  // Assert that the categories are not clickable
  await expect(
    page.getByRole("option", { name: "Popular Rooms" }),
  ).not.toBeVisible();
  await expect(
    page.getByRole("option", { name: "More Rooms" }),
  ).not.toBeVisible();
  
  // Popular Rooms will be repeated in the More Rooms category in Alphabetical Order
  expect([...popularRoomsInDropdown].sort()).toStrictEqual(
    popularRoomsInDropdown,
  );
  
 // Step 4. 4. Describe Features - Room Types - Search with Options
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  const character = 'B';
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Once the user starts typing at least one character, then the list will filter down
  await page.getByRole(`combobox`, { name: `Room Type` }).fill(character);
  
  // Wait for the separator to go away to know the filtering happened
  await expect(separator).not.toBeVisible();
  
  // Get the updated dropdown list
  let dropdownOptionsList = await page.getByRole('option').allTextContents();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // Assert there are options
  expect(dropdownOptionsList.length).toBeGreaterThan(0);
  
  // The dropdown should filter properly (using the 'starts with', not 'contains').
  for (const option of dropdownOptionsList) {
    expect(option[0]).toEqual(character)
  }
  
  // Even though a suggested list appears, the system will accept any freeform text entered by the user.
  await expect(page.getByRole(`button`, { name: `${character}`, exact: true })).toBeVisible();
  
 // Step 5. 5. Describe Features - Room Types - Search without Options
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  const badCharacter = 'Z';
  
  //--------------------------------
  // Act: Fill a character with no dropdown options
  //--------------------------------
  
  // If no matches are found, then the users entry will be used as the Room Type.
  await page.getByRole(`combobox`, { name: `Room Type` }).fill(`${badCharacter}`);
  
  //--------------------------------
  // Assert: The room type changes
  //--------------------------------
  
  // Assert the room button changes to be {badCharacter}
  await expect(page.getByRole(`button`, { name: `${character}`, exact: true })).not.toBeVisible();
  await expect(page.getByRole(`button`, { name: `${badCharacter}`, exact: true })).toBeVisible();
  
  //--------------------------------
  // Act: Click outside of the textbox
  //--------------------------------
  
  // Click anywhere outside the field 
  await page.locator(`:text("There's more to discover with homegeniusIQ")`).click();
  
  //--------------------------------
  // Assert: 
  //--------------------------------
  
  // The input is saved
  await expect(page.getByRole(`combobox`, { name: `Room Type` })).toHaveValue(`${badCharacter}`);
  
  // The respective Room Type selection labels across the top is changed
  await expect(page.getByRole(`button`, { name: `${badCharacter}`, exact: true })).toBeVisible();
  
 // Step 6. 6. Describe Features - Room Types - Clear the Entry
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  //--------------------------------
  // Act: Clear the textbox
  //--------------------------------
  
  // If the user clears entry
  await page.getByRole(`combobox`, { name: `Room Type` }).fill(``);
  
  // Wait for the dropdown to appear
  await dropdownOptions.first().waitFor();
  
  // Get all of the options in the dropdown
  dropdownOptionsList = await dropdownOptions.allTextContents();
  
  //--------------------------------
  // Assert: The full list reappears
  //--------------------------------
  
  // The full list reappears
  expect(fullDropdownOptionsList).toEqual(dropdownOptionsList);
  
  //--------------------------------
  // Act: Click away
  //--------------------------------
  
  // If the user clears entry and clicks away
  await page
    .locator(`:text("There's more to discover with homegeniusIQ")`)
    .click();
  
  //--------------------------------
  // Assert: Populated text re-appears
  //--------------------------------
  
  // The Pre-populated text will reappear
  await expect(async () => {
    await expect(
      page.getByRole(`combobox`, { name: `Room Type` }),
    ).toHaveScreenshot("placeholder", { maxDiffPixelRatio: 0.01 });
  }).toPass({ timeout: 30 * 1000 });
  
  // Assert the Features text box is disabled when there is no text entry
  await expect(
    page.getByRole(`textbox`, { name: `e.g., white cabinets, wood` }),
  ).toBeDisabled();
  
 // Step 7. 7. Describe Features - Room Types - Persistence
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  await page.getByRole(`combobox`, { name: `Room Type` }).fill(`${character}`);
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // If the user leaves the modal after entering data and doesn't click Apply
  
  // Click the X to close the Search with AI modal
  await page.locator(`div`).filter({ hasText: /^Search with AIclose$/ }).getByRole(`button`).click();
  
  // Click into the first home
  await page.locator(`[data-testid="undecorate"] .card-media-container`).first().click();
  
  // Go back to search
  await page.getByRole(`button`, { name: `arrow_back Search` }).click();
  
  // Reopen the Search with AI modal
  await page.getByRole(`button`, { name: `SEARCH WITH AI` }).click();
  
  //--------------------------------
  // Assert:.
  //--------------------------------
  
  // Assert the Room type button persists
  await expect(page.getByRole(`button`, { name: `${character}`, exact: true })).toBeVisible();
  
  // Assert the Room type textbox persists
  await expect(page.getByRole(`combobox`, { name: `Room Type` })).toHaveValue(`${character}`);
  
  // Assert the Features text box is enabled when there is text
  await expect(page.getByRole(`textbox`, { name: `e.g., white cabinets, wood` })).toBeEnabled();
  
  // Assert the Start Over button is enabled when there is text
  await expect(page.getByRole(`button`, { name: `Start Over` })).toBeEnabled();
  
  // Assert the Delete Room button is enabled when there is text
  await expect(page.getByRole(`button`, { name: `Delete Room` })).toBeEnabled();
  
  
 // Step 8. 8. Describe Features - Room Types - Start Over Button
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Click the Start Over button
  await page.getByRole(`button`, { name: `Start Over` }).click();
  
  // Assert the confirmation modal appears
  await expect(page.getByText(`Are you sure you want to start over?`)).toBeVisible();
  
  // Click the Confirm button in the modal
  await page.getByRole(`button`, { name: `Confirm` }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // Assert all of the rooms are reset
  await expect(page.getByRole(`button`, { name: `Room Type 1` })).toBeVisible();
  await expect(page.getByRole(`button`, { name: `Room Type 2` })).toBeVisible();
  await expect(page.getByRole(`button`, { name: `Room Type 3` })).toBeVisible();
  
  // Assert that the Room Type is reset in each room (Room Type 1)
  await expect(page.getByRole(`combobox`, { name: `Room Type` })).toHaveValue(``);
  
  // Click into Room Type 2
  await page.getByRole(`button`, { name: `Room Type 2` }).click()
  
  // Assert that the Room Type is reset in Room Type 2
  await expect(page.getByRole(`combobox`, { name: `Room Type` })).toHaveValue(``);
 // Step 9. 9. Describe Features - Room Types - Delete Room button
  //--------------------------------
  // Arrange:
  //--------------------------------
  // Fill the Room Type in Room 2
  await page.getByRole(`combobox`, { name: `Room Type` }).fill(roomType)
  
  // Fill the Room Description in Room 2
  await page.getByRole(`textbox`, { name: `e.g., white cabinets, wood` }).fill(roomDescription);
  
  // Slight timeout
  await page.waitForTimeout(500);
  
  // Click Room Type 1
  await page.getByRole(`button`, { name: `Room Type 1` }).click();
  
  // Slight timeout
  await page.waitForTimeout(500);
  
  // Fill the Room Type in Room 1
  await page.getByRole(`combobox`, { name: `Room Type` }).fill(character)
  
  // Fill the Room Description in Room 1
  await page.getByRole(`textbox`, { name: `e.g., white cabinets, wood` }).fill(roomDescription);
  
  // Navigate back to Room Type 2
  await page.getByRole(`button`, { name: roomType }).click();
  
  //--------------------------------
  // Act: Delete Room 2
  //--------------------------------
  
  // Click the "Delete Room" button
  await page.getByRole(`button`, { name: `Delete Room` }).click();
  
  // Assert the do you want to delete this room modal appears
  await expect(page.getByText(`Are you sure you want to delete this room?`)).toBeVisible();
  
  // Click Confirm in the modal
  await page.getByRole(`button`, { name: `Confirm` }).click();
  
  //--------------------------------
  // Assert: Only room type 2 was deleted
  //--------------------------------
  
  // Assert the button changed from {roomType} to Room Type 2
  await expect(page.getByRole(`button`, { name: roomType })).not.toBeVisible();
  await expect(page.getByRole(`button`, { name: `Room Type 2` })).toBeVisible();
  
  // Assert the Room type text field was cleared
  await expect(page.getByRole(`combobox`, { name: `Room Type` })).toHaveValue(``);
  
  // Assert the Features text field was cleared
  await expect(page.getByRole(`textbox`, { name: `e.g., white cabinets, wood` })).toHaveValue(``);
  
  // Assert the first room was not cleared
  await expect(page.getByRole(`button`, { name: character, exact: true })).toBeVisible();
  
  // Click the first room
  await page.getByRole(`button`, { name: character, exact: true }).click();
  
  // Assert the Room type text field was not cleared
  await expect(page.getByRole(`combobox`, { name: `Room Type` })).toHaveValue(`${character}`);
  
  // Assert the Features text field was not cleared
  await expect(page.getByRole(`textbox`, { name: `e.g., white cabinets, wood` })).toHaveValue(`${roomDescription}`);
  
 // Step 10. 10. Describe Features - Room Types - Field Requirements
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  // Click Room Type 2
  await page.getByRole(`button`, { name: `Room Type 2` }).click();
  
  // Once the Field is limited to 25 characters, when the limit is reached, the user is not able to continue entering data.
  const roomType2 = "This room type is over 25 characters";
  
  // roomType2 with only 25 characters
  const roomType2Limited = roomType2.slice(0, 25);
  
  //--------------------------------
  // Act: 25 Character Max
  //--------------------------------
  
  // Type {roomType2} into the text field
  await page
    .getByRole(`combobox`, { name: `Room Type` })
    .type(roomType2, { delay: 200 });
  
  // Click the Apply button
  await page.getByRole("button", { name: "Apply" }).click();
  
  //--------------------------------
  // Assert: 25 Character Max
  //--------------------------------
  
  // Assert only the first 25 characters were accepted
  await expect(page.getByRole(`combobox`, { name: `Room Type` })).toHaveValue(
    roomType2Limited,
  );
  
  // Assert the button was changed to fit only the first 25 characters
  await expect(
    page.getByRole(`button`, { name: roomType2Limited, exact: true }),
  ).toBeVisible();
  
  // Red border around the features field
  await expect(
    page
      .getByRole(`textbox`, { name: `e.g., white cabinets, wood` })
      .locator("..")
      .locator(".."),
  ).toHaveCSS("border", "1px solid rgb(223, 38, 33)");
  
  // Assert the error message is visible
  let errorMessage = page.locator(
    `:text("Please describe room features in order to proceed"):visible`,
  );
  await expect(errorMessage).toBeVisible({ timeout: 100 });
  
  // Assert the error message is red
  await expect(errorMessage).toHaveCSS("color", "rgb(223, 38, 33)");
  
  // Assert the Apply button is disabled
  await expect(page.getByRole("button", { name: "Apply" })).toBeDisabled();
  
 // Step 11. 11. Describe Features - Room Types - Duplicate Room Type Error
  //--------------------------------
  // Arrange:
  //--------------------------------
  
  // Fill the room description
  await page
    .getByRole(`textbox`, { name: `e.g., white cabinets, wood` })
    .fill(roomDescription);
  
  // Click Room Type 3
  await page.getByRole(`button`, { name: `Room Type 3` }).click();
  
  //--------------------------------
  // Act:
  //--------------------------------
  
  // Type {character} into the text field
  await page.getByRole(`combobox`, { name: `Room Type` }).fill(character);
  await page.keyboard.press("Enter");
  
  // Click out of the Room type text field
  await page.getByRole(`textbox`, { name: `e.g., white cabinets, wood` }).click();
  
  //--------------------------------
  // Assert:
  //--------------------------------
  
  // When the user entered a Room Type that is a duplicate of another Room Type, then there is an ERROR state for the field
  // Red border around field
  await expect(
    page.getByRole(`combobox`, { name: `Room Type` }).locator(".."),
  ).toHaveCSS("border", "1px solid rgb(223, 38, 33)");
  
  // Assert the error message is visible
  errorMessage = page.locator(
    `:text("Please use each room type only once. Add any additional features to your existing room type"):visible`,
  );
  await expect(errorMessage).toBeVisible({ timeout: 100 });
  
  // Assert the error message is red
  await expect(errorMessage).toHaveCSS("color", "rgb(223, 38, 33)");
  
  // Assert the Apply button is disabled
  await expect(page.getByRole("button", { name: "Apply" })).toBeDisabled();
  
});