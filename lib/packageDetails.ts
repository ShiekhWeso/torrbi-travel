export const packageDetails: Record<string, {
  rating: number; reviews: number; gallery: string[];
  en: {description: string}; ar: {description: string};
}> = {
  bali: {
    rating: 4.8, reviews: 1284,
    gallery: ['/destinations/bali.webp', '/destinations/phuket.webp', '/destinations/penang.webp', '/destinations/langkawi.webp', '/destinations/vietnam.webp'],
    en: {description: 'Seven days across Bali: cultural Ubud, the cliffs of Nusa Penida and beach days in Seminyak, with hotel, transfers and guided tours included.'},
    ar: {description: 'سبعة أيام في بالي بين أوبود الثقافية، وجروف نوسا بينيدا، وشواطئ سيمينياك، مع الفندق والاستقبال والجولات المرشدة.'}
  },
  istanbul: {
    rating: 4.9, reviews: 2310,
    gallery: ['/destinations/istanbul.jpg', '/destinations/georgia.webp', '/destinations/azerbaijan.webp', '/destinations/bali.webp', '/destinations/phuket.webp'],
    en: {description: 'Five days in Istanbul: historic Sultanahmet, a Bosphorus cruise and a day trip to Cappadocia, with hotel, transfers and guided tours included.'},
    ar: {description: 'خمسة أيام في إسطنبول بين السلطان أحمد التاريخية، ورحلة في البوسفور، ويوم في كابادوكيا، مع الفندق والاستقبال والجولات المرشدة.'}
  },
  phuket: {
    rating: 4.7, reviews: 976,
    gallery: ['/destinations/phuket.webp', '/destinations/langkawi.webp', '/destinations/penang.webp', '/destinations/bali.webp', '/destinations/vietnam.webp'],
    en: {description: 'Six days in Phuket: island hopping to Phi Phi, Patong nightlife and the charm of Old Town, with hotel, transfers and guided tours included.'},
    ar: {description: 'ستة أيام في بوكيت بين جزر فاي فاي، وحياة باتونغ، وسحر البلدة القديمة، مع الفندق والاستقبال والجولات المرشدة.'}
  }
};

export const reviews = {
  en: [
    {name: 'Keziah', country: 'United Kingdom', date: 'November 10, 2026', text: 'Our guide was kind and informative, and stayed in touch throughout the trip. Great photos too. Would definitely recommend.'},
    {name: 'Renzo', country: 'Canada', date: 'November 8, 2026', text: 'Amazing guide, made sure we were comfortable from start to finish. Could not recommend this trip enough!'}
  ],
  ar: [
    {name: 'خالد', country: 'السعودية', date: '10 نوفمبر 2026', text: 'المرشد كان ودوداً وخبيراً، وبقي على تواصل معنا طوال الرحلة. أنصح بها بشدة.'},
    {name: 'سارة', country: 'الإمارات', date: '8 نوفمبر 2026', text: 'تنظيم رائع وراحة من البداية للنهاية. تجربة تستحق كل ريال.'}
  ]
};