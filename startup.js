#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

// Get the argument passed from npm script
const fileName = process.argv[2];

if (!fileName) {
  console.error("Usage: npm run file --arg1=<filename>");
  console.error(
    "Example: npm run file --arg1=tests/QA/homegenius_basic_search/hgse_258_verify_basic_search_with_mls_id.spec.js"
  );
  process.exit(1);
}

// Check if the file has a .spec.js extension, if not add it
let testFile = fileName;
if (!testFile.endsWith(".spec.js")) {
  testFile = `${fileName}.spec.js`;
}

// Run the playwright test command
console.log(`Running test: ${testFile}`);
const child = spawn("npx", ["playwright", "test", testFile, "--headed"], {
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => {
  process.exit(code);
});
