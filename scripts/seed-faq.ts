import 'dotenv/config';
import {db} from '../lib/db';
import {faqs} from '../lib/db/schema';

const entries = [
  {
    en: {
      question: 'How do I book a trip?',
      answer: 'Choose a package or contact us on WhatsApp. Our team will confirm availability and guide you through the booking.'
    },
    ar: {
      question: 'كيف أحجز رحلة؟',
      answer: 'اختر باقة أو تواصل معنا عبر واتساب. سيؤكد فريقنا التوفر ويساعدك في إتمام الحجز.'
    }
  },
  {
    en: {
      question: 'Which payment methods are available?',
      answer: 'Our team will share the available payment methods and instructions when confirming your booking.'
    },
    ar: {
      question: 'ما طرق الدفع المتاحة؟',
      answer: 'سيشاركك فريقنا طرق الدفع المتاحة والتعليمات عند تأكيد الحجز.'
    }
  },
  {
    en: {
      question: 'What is your cancellation and refund policy?',
      answer: 'Cancellation and refund terms depend on the trip and its providers. We will explain the applicable terms before you confirm.'
    },
    ar: {
      question: 'ما سياسة الإلغاء واسترداد المبلغ؟',
      answer: 'تعتمد شروط الإلغاء والاسترداد على الرحلة ومقدمي الخدمات. سنوضح لك الشروط المطبقة قبل التأكيد.'
    }
  },
  {
    en: {
      question: 'What is included in a package?',
      answer: 'Inclusions vary by package. Check its Included section for details; flights are included only when stated.'
    },
    ar: {
      question: 'ماذا تشمل الباقة؟',
      answer: 'تختلف المشمولات حسب الباقة. راجع قسم ما يشمله السعر للتفاصيل؛ ولا تشمل الباقة الطيران إلا إذا ذُكر ذلك.'
    }
  },
  {
    en: {
      question: 'Do I need a visa or other travel documents?',
      answer: 'Requirements depend on your nationality and destination. Check official guidance before travel, and contact us for help with a checklist.'
    },
    ar: {
      question: 'هل أحتاج إلى تأشيرة أو مستندات سفر أخرى؟',
      answer: 'تختلف المتطلبات حسب جنسيتك والوجهة. راجع الإرشادات الرسمية قبل السفر، وتواصل معنا لمساعدتك في إعداد قائمة بالمستندات.'
    }
  },
  {
    en: {
      question: 'Can I change my travel dates?',
      answer: 'Contact us as soon as possible. Changes depend on availability and provider terms, and fees may apply.'
    },
    ar: {
      question: 'هل يمكنني تغيير مواعيد السفر؟',
      answer: 'تواصل معنا في أقرب وقت ممكن. يعتمد التغيير على التوفر وشروط مقدمي الخدمات، وقد تُطبق رسوم.'
    }
  },
  {
    en: {
      question: 'How can I contact you?',
      answer: 'Message us on WhatsApp, call us, or email us using the contact details on our website.'
    },
    ar: {
      question: 'كيف يمكنني التواصل معكم؟',
      answer: 'راسلنا عبر واتساب أو اتصل بنا أو أرسل بريداً إلكترونياً باستخدام بيانات التواصل على موقعنا.'
    }
  }
];

async function main() {
  const existing = await db.select({id: faqs.id}).from(faqs).limit(1);
  if (existing.length > 0) {
    console.log('FAQ data already exists; skipping seed.');
    process.exit(0);
  }

  await db.insert(faqs).values(entries.map((i18n, sort) => ({i18n, sort})));
  console.log('FAQ entries seeded.');
  process.exit(0);
}

main().catch((e) => {
  console.error('FAILED:', e);
  process.exit(1);
});
