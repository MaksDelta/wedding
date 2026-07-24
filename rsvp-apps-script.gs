/**
 * RSVP → Google Таблиця (Google Apps Script)
 * ─────────────────────────────────────────────
 * Приймає відповіді з форми на сайті й дописує рядок у таблицю.
 *
 * ЯК ПІДКЛЮЧИТИ (≈10 хв):
 * 1. Створіть Google Таблицю (sheets.new). У першому рядку зробіть заголовки:
 *      A1: Час | B1: Ім'я | C1: Присутність | D1: К-сть гостей | E1: Побажання
 * 2. У таблиці: Розширення → Apps Script.
 * 3. Видаліть увесь код, вставте цей файл повністю, збережіть (значок дискети).
 * 4. Натисніть «Розгорнути» (Deploy) → «Новий розгорток» (New deployment).
 *      • Тип: Веб-застосунок (Web app)
 *      • Виконувати від імені: Я (Me)
 *      • Хто має доступ: Усі (Anyone)  ← ВАЖЛИВО
 *      • Розгорнути → надайте дозвіл своєму акаунту.
 * 5. Скопіюйте «URL веб-застосунку» (закінчується на /exec).
 * 6. Дайте цей URL мені — я вставлю його в сайт (js/main.js → SCRIPT_URL).
 *
 * Після цього кожна відповідь з форми з'являтиметься новим рядком у таблиці.
 */

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('RSVP') || ss.getSheets()[0];
    var p = (e && e.parameter) ? e.parameter : {};

    sheet.appendRow([
      new Date(),          // Час
      p.name || '',        // Ім'я та прізвище
      p.attending || '',   // Буду / Не зможу
      p.guests || '',      // Кількість гостей
      p.message || ''      // Побажання
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Необов'язково: перевірка, що застосунок працює (відкрийте URL у браузері).
function doGet() {
  return ContentService
    .createTextOutput('RSVP endpoint is running')
    .setMimeType(ContentService.MimeType.TEXT);
}
