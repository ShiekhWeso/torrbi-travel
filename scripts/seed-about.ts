import 'dotenv/config';
import {eq} from 'drizzle-orm';
import {db} from '../lib/db';
import {aboutContent} from '../lib/db/schema';

const i18n = {
  en: {
    title: 'About TORRBI TRAVEL',
    subtitle: 'We turn travel dreams into well-planned trips.',
    storyTitle: 'Our story',
    story: 'TORRBI TRAVEL started with a simple idea: planning a trip should be as enjoyable as taking it. We bring together hand-picked hotels, trusted guides and honest prices, and we stay with you on WhatsApp from the first question to the flight home.',
    whatTitle: 'What we do',
    cards: [
      {icon: 'luggage', title: 'Tour packages', text: 'Complete trips with hotel, transfers and guided tours, designed around each destination.'},
      {icon: 'flight', title: 'Flights', text: 'Tell us where and when, and we find you the best options.'},
      {icon: 'hiking', title: 'Activities', text: 'Local experiences and day tours to make your trip memorable.'}
    ]
  },
  ar: {
    title: 'عن TORRBI TRAVEL',
    subtitle: 'نحوّل أحلام السفر إلى رحلات مخططة بإتقان.',
    storyTitle: 'قصتنا',
    story: 'بدأت TORRBI TRAVEL بفكرة بسيطة: تخطيط الرحلة يجب أن يكون ممتعاً مثل الرحلة نفسها. نجمع لك فنادق مختارة بعناية ومرشدين موثوقين وأسعاراً واضحة، ونبقى معك على واتساب من أول سؤال حتى العودة.',
    whatTitle: 'ماذا نقدم',
    cards: [
      {icon: 'luggage', title: 'باقات سياحية', text: 'رحلات كاملة تشمل الفندق والتنقلات والجولات المرشدة، مصممة لكل وجهة.'},
      {icon: 'flight', title: 'تذاكر الطيران', text: 'أخبرنا إلى أين ومتى، ونجد لك أفضل الخيارات.'},
      {icon: 'hiking', title: 'الأنشطة', text: 'تجارب محلية وجولات يومية تجعل رحلتك لا تُنسى.'}
    ]
  }
};

async function main() {
  const [existing] = await db.select({id: aboutContent.id}).from(aboutContent)
    .where(eq(aboutContent.id, 1)).limit(1);
  if (existing) {
    console.log('About content already exists; skipping seed.');
    process.exit(0);
  }

  await db.insert(aboutContent).values({id: 1, i18n});
  console.log('About content seeded.');
  process.exit(0);
}

main().catch((error) => {
  console.error('FAILED:', error);
  process.exit(1);
});
