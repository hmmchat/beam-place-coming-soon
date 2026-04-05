/**
 * Google Apps Script — append waitlist rows to a Sheet
 *
 * 1. Create a new Google Sheet (or open an existing one).
 * 2. Extensions → Apps Script → paste this file's contents.
 * 3. Run doPost once from the editor to authorize (or use Test deployments).
 * 4. Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone (required for the Next.js server to POST)
 * 5. Copy the Web app URL into GOOGLE_APPS_SCRIPT_URL in your hosting env.
 *
 * Expected columns (row 1 headers): submittedAt | name | email | source
 * Duplicate emails (same value in the email column, case-insensitive) are rejected.
 */

function doPost(e) {
  let payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400);
  }

  var name = (payload.name || "").toString().trim();
  var email = (payload.email || "").toString().trim().toLowerCase();
  var source = (payload.source || "BEAM").toString();
  var submittedAt = payload.submittedAt || new Date().toISOString();

  if (!name || !email) {
    return jsonResponse({ ok: false, error: "Missing name or email" }, 400);
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() < 1) {
    sheet.appendRow(["submittedAt", "name", "email", "source"]);
  }

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

/** Column C = email (submittedAt | name | email | source). */
function emailExistsInSheet_(sheet, normalizedEmail) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return false;
  }
  var EMAIL_COL = 3;
  var values = sheet.getRange(2, EMAIL_COL, lastRow, EMAIL_COL).getValues();
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
