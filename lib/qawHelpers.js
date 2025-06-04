// Require syntax update
const dateFns = require("date-fns");
const axios = require("axios");
const Excel = require("exceljs");
const assert = require("assert");
const { expect, test } = require("@playwright/test");
const { getInbox } = require("../infrastructure/email");
const dotenv = require("dotenv");
dotenv.config();

async function launch() {
  const { chromium } = require("playwright");

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  return { browser, context };
}

export {
  assert,
  expect,
  test,
  getInbox,
  launch,
  dotenv,
  dateFns,
  axios,
  Excel,
};
