const express = require("express");
const multer = require("multer");
const upload = multer(); // Needed for multi-part uploads
let filteredEmail;

let messages = [];

// An in-memory example of how getInbox can work using Send Grid's ability to translate an email to a webhook:
// https://www.twilio.com/docs/sendgrid/for-developers/parsing-email/setting-up-the-inbound-parse-webhook
export async function getInbox(options) {
  // Only filter incoming emails to the above email
  filteredEmail = options.email;

  // Init server listening to a domain

  const app = express();
  app.use(express.json());
  const port = 3000;

  app.post("/email", upload.any(), (req, res) => {
    console.log(JSON.stringify(req.body));
    messages.push({ time: new Date(), data: req.body });
    res.send("Hello World!");
  });

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

export async function waitForMessage(options) {
  let after = options?.after;

  return messages[0];
}
