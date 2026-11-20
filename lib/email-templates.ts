export type EmailLocale = 'en' | 'ar';

export type BookingEmailData = {
  name: string;
  reference: string;
  title: string;
  date: string;
  guests: number;
  totalUsd: number | null;
};

type EmailContent = {subject: string; html: string};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character] ?? character);
}

function siteUrls() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();
  let origin = 'http://localhost:3000';
  if (configured) {
    try {
      origin = new URL(configured.includes('://') ? configured : `https://${configured}`).origin;
    } catch {
      console.error('Invalid site URL for email templates.');
    }
  }
  return {origin, logo: new URL('/logo.webp', origin).toString()};
}

function layout(locale: EmailLocale, heading: string, content: string) {
  const rtl = locale === 'ar';
  const align = rtl ? 'right' : 'left';
  const {origin, logo} = siteUrls();
  return `<!doctype html>
<html lang="${locale}" dir="${rtl ? 'rtl' : 'ltr'}">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
  <body style="margin:0;padding:24px 12px;background:#f3f4f8;font-family:Arial,Helvetica,sans-serif;color:#172044;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;border-collapse:separate;border-spacing:0;background:#ffffff;border-radius:16px;overflow:hidden;">
          <tr><td style="height:5px;background:#FE9962;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr><td style="padding:24px 28px;border-bottom:1px solid #e8eaf0;text-align:${align};">
            <a href="${escapeHtml(origin)}" style="display:inline-block;text-decoration:none;">
              <img src="${escapeHtml(logo)}" alt="Torrbi Travel" width="150" style="display:block;width:150px;max-width:100%;height:auto;border:0;">
            </a>
          </td></tr>
          <tr><td style="padding:30px 28px;text-align:${align};">
            <h1 style="margin:0 0 16px;color:#0F1859;font-size:24px;line-height:1.35;">${escapeHtml(heading)}</h1>
            ${content}
          </td></tr>
          <tr><td style="padding:20px 28px;background:#0F1859;color:#ffffff;text-align:${align};font-size:13px;line-height:1.6;">
            <a href="${escapeHtml(origin)}" style="color:#FE9962;text-decoration:none;font-weight:bold;">Torrbi Travel</a>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function paragraph(text: string) {
  return `<p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#343b54;">${text}</p>`;
}

function detailRows(locale: EmailLocale, data: BookingEmailData) {
  const date = (() => {
    const timestamp = Date.parse(`${data.date}T00:00:00Z`);
    return Number.isNaN(timestamp)
      ? data.date
      : new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en-US', {dateStyle: 'medium', timeZone: 'UTC'}).format(timestamp);
  })();
  const total = data.totalUsd == null
    ? (locale === 'ar' ? 'عند الطلب' : 'On request')
    : new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(data.totalUsd);
  const rows = locale === 'ar'
    ? [
        ['رقم الحجز', data.reference],
        ['الخيار', data.title],
        ['التاريخ', date],
        ['الضيوف', `${data.guests} ضيوف`],
        ['الإجمالي', total]
      ]
    : [
        ['Booking reference', data.reference],
        ['Trip', data.title],
        ['Date', date],
        ['Guests', `${data.guests} guests`],
        ['Total', total]
      ];
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;border-collapse:collapse;">
    ${rows.map(([label, value]) => `<tr>
      <td style="padding:10px 0;border-bottom:1px solid #e8eaf0;color:#69708a;font-size:14px;">${escapeHtml(label)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e8eaf0;color:#172044;font-size:14px;font-weight:bold;text-align:${locale === 'ar' ? 'left' : 'right'};">${escapeHtml(value)}</td>
    </tr>`).join('')}
  </table>`;
}

function bookingContent(locale: EmailLocale, data: BookingEmailData, message: string) {
  return `${paragraph(message)}${detailRows(locale, data)}`;
}

export function welcome(locale: EmailLocale, data: {name: string}): EmailContent {
  const name = escapeHtml(data.name);
  return locale === 'ar'
    ? {
        subject: 'مرحباً بك في Torrbi Travel',
        html: layout(locale, `أهلاً ${name}`, paragraph('تم إنشاء حسابك بنجاح. يسعدنا مساعدتك في التخطيط لرحلتك القادمة.'))
      }
    : {
        subject: 'Welcome to Torrbi Travel',
        html: layout(locale, `Welcome, ${name}`, paragraph('Your account is ready. We look forward to helping you plan your next trip.'))
      };
}

export function bookingReceived(locale: EmailLocale, data: BookingEmailData): EmailContent {
  const name = escapeHtml(data.name);
  return locale === 'ar'
    ? {
        subject: `تم استلام طلب الحجز ${escapeHtml(data.reference)}`,
        html: layout(locale, `شكراً لك يا ${name}`, bookingContent(locale, data, 'تم استلام طلب الحجز. سيتواصل معك فريقنا لتأكيده خلال 4 ساعات.'))
      }
    : {
        subject: `Booking request received ${escapeHtml(data.reference)}`,
        html: layout(locale, `Thank you, ${name}`, bookingContent(locale, data, 'We received your booking request. Our team will confirm it within 4 hours.'))
      };
}

export function bookingConfirmed(locale: EmailLocale, data: BookingEmailData): EmailContent {
  const name = escapeHtml(data.name);
  return locale === 'ar'
    ? {
        subject: `تم تأكيد الحجز ${escapeHtml(data.reference)}`,
        html: layout(locale, `تم تأكيد حجزك يا ${name}`, bookingContent(locale, data, 'تم تأكيد حجزك. نتطلع إلى أن تحظى برحلة رائعة معنا.'))
      }
    : {
        subject: `Booking confirmed ${escapeHtml(data.reference)}`,
        html: layout(locale, `Your booking is confirmed, ${name}`, bookingContent(locale, data, 'Your booking is confirmed. We look forward to making your trip wonderful.'))
      };
}

export function bookingCancelled(locale: EmailLocale, data: BookingEmailData): EmailContent {
  const name = escapeHtml(data.name);
  return locale === 'ar'
    ? {
        subject: `تم إلغاء الحجز ${escapeHtml(data.reference)}`,
        html: layout(locale, `تم إلغاء الحجز يا ${name}`, bookingContent(locale, data, 'تم إلغاء حجزك. يرجى التواصل معنا إذا كنت بحاجة إلى أي مساعدة.'))
      }
    : {
        subject: `Booking cancelled ${escapeHtml(data.reference)}`,
        html: layout(locale, `Your booking was cancelled, ${name}`, bookingContent(locale, data, 'Your booking has been cancelled. Please contact us if you need any help.'))
      };
}

export function newBookingAdmin(data: BookingEmailData & {email: string}): EmailContent {
  return {
    subject: `New booking ${escapeHtml(data.reference)}`,
    html: layout('en', 'New booking', `${paragraph('A new booking request was submitted.')}${detailRows('en', data)}${paragraph(`Customer email: ${escapeHtml(data.email)}`)}`)
  };
}
