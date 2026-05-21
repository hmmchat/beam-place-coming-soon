/**
 * Google Apps Script — append waitlist and dare rows to a Sheet
 *
 * 1. Create a new Google Sheet (or open an existing one).
 * 2. Extensions → Apps Script → paste this file's contents.
 * 3. Run doPost once from the editor to authorize (or use Test deployments).
 * 4. Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone (required for the Next.js server to POST)
 * 5. Copy the Web app URL into GOOGLE_APPS_SCRIPT_URL in your hosting env.
 *
 * Waitlist columns: submittedAt | name | email | source
 * Dares columns: submittedAt | email | dare | source
 * Direct waitlist submissions reject duplicate emails. Dare submissions can repeat,
 * and automatically add new emails to the waitlist sheet as "Dare drop".
 */

function doPost(e) {
  var payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400);
  }

  if (payload.action === "submit_dares") {
    return handleDares_(payload);
  }

  return handleWaitlist_(payload);
}

function handleWaitlist_(payload) {
  var name = (payload.name || "").toString().trim();
  var email = (payload.email || "").toString().trim().toLowerCase();
  var source = (payload.source || "BEAM").toString();
  var submittedAt = payload.submittedAt || new Date().toISOString();

  if (!name || !email) {
    return jsonResponse({ ok: false, error: "Missing name or email" }, 400);
  }

  var sheet = getWaitlistSheet_();
  ensureHeaders_(sheet, ["submittedAt", "name", "email", "source"]);

  if (emailExistsInSheet_(sheet, email)) {
    return jsonResponse({
      ok: false,
      code: "duplicate_email",
      error: "This email is already registered.",
    });
  }

  sheet.appendRow([submittedAt, name, email, source]);

  return jsonResponse({ ok: true });
}

function handleDares_(payload) {
  var email = (payload.email || "").toString().trim().toLowerCase();
  var source = (payload.source || "BEAM_DARE").toString();
  var submittedAt = payload.submittedAt || new Date().toISOString();
  var dares = Array.isArray(payload.dares) ? payload.dares : [];
  var normalizedDares = [];

  for (var i = 0; i < dares.length; i++) {
    var dare = (dares[i] || "").toString().trim();
    if (dare) {
      normalizedDares.push(dare);
    }
  }

  if (!email || normalizedDares.length < 1) {
    return jsonResponse({ ok: false, error: "Missing email or dare" }, 400);
  }

  var waitlistSheet = getWaitlistSheet_();
  ensureHeaders_(waitlistSheet, ["submittedAt", "name", "email", "source"]);
  if (!emailExistsInSheet_(waitlistSheet, email)) {
    waitlistSheet.appendRow([submittedAt, "Dare drop", email, source]);
  }

  var daresSheet = getOrCreateSheet_("Dares");
  ensureHeaders_(daresSheet, ["submittedAt", "email", "dare", "source"]);
  for (var j = 0; j < normalizedDares.length; j++) {
    daresSheet.appendRow([submittedAt, email, normalizedDares[j], source]);
  }

  return jsonResponse({ ok: true, count: normalizedDares.length });
}

function getWaitlistSheet_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var namedSheet = spreadsheet.getSheetByName("Interested") || spreadsheet.getSheetByName("Waitlist");
  if (namedSheet) {
    return namedSheet;
  }

  var sheets = spreadsheet.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName() !== "Dares") {
      return sheets[i];
    }
  }

  return spreadsheet.insertSheet("Waitlist");
}

function getOrCreateSheet_(name) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
}

function ensureHeaders_(sheet, headers) {
  if (sheet.getLastRow() < 1) {
    sheet.appendRow(headers);
  }
}

/** Column C = email (submittedAt | name | email | source). */
function emailExistsInSheet_(sheet, normalizedEmail) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return false;
  }
  var EMAIL_COL = 3;
  var values = sheet.getRange(2, EMAIL_COL, lastRow - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    var cell = (values[i][0] || "").toString().trim().toLowerCase();
    if (cell === normalizedEmail) {
      return true;
    }
  }
  return false;
}

function jsonResponse(obj, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  if (statusCode && statusCode >= 400) {
    // Apps Script HTTP status for web apps is limited; client still parses body.
    return output;
  }
  return output;
}
