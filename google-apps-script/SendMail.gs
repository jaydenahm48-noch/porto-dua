// ============================================================
// NochyOS Portfolio — SendMail Web App
// Deploy: Execute as "Me", Access "Anyone"
// ============================================================

const SENDER_NAME = 'Zaidan — NochyOS Portfolio';

function doPost(e) {
  var result;
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action || 'sendEmail';

    if (action !== 'sendEmail') {
      throw new Error('Unknown action: ' + action);
    }

    var to = data.email;                       // tujuan email (inbox kamu)
    var subject = data.subject || '(no subject)';
    var body = data.body || '';
    var senderName = (data.name || '').trim();
    var fromEmail = (data.fromEmail || '').trim();

    if (!to) throw new Error('email target required');
    if (!subject) throw new Error('subject required');

    var fullBody = ''
      + (senderName ? ('Name: ' + senderName + '\n') : '')
      + (fromEmail ? ('From: ' + fromEmail + '\n') : '')
      + '\n' + body
      + '\n\n--\nDikirim dari form "Say hello!" di NochyOS Portfolio';

    var options = {
      to: to,
      subject: subject,
      body: fullBody,
      name: senderName || SENDER_NAME,
    };
    if (fromEmail) options.replyTo = fromEmail;

    MailApp.sendEmail(options);
    result = { status: 'ok', id: 'sent' };
  } catch (err) {
    result = { error: err.message };
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
