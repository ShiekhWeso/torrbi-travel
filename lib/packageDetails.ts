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
  },
    penang: {
    rating: 4.6, reviews: 642,
    gallery: ['/destinations/penang.webp', '/destinations/kuala-lumpur.webp', '/destinations/langkawi.webp', '/destinations/bali.webp', '/destinations/phuket.webp'],
    en: {description: 'Five days in Penang: George Town street art, Penang Hill views and beach evenings in Batu Ferringhi, with hotel, transfers and guided tours included.'},
    ar: {description: 'خمسة أيام في بينانغ بين فن الشارع في جورج تاون، وإطلالات بينانغ هيل، وأمسيات شاطئ باتو فيرينغي، مع الفندق والاستقبال والجولات المرشدة.'}
  },
  vietnam: {
    rating: 4.8, reviews: 1120,
    gallery: ['/destinations/vietnam.webp', '/destinations/langkawi.webp', '/destinations/penang.webp', '/destinations/bali.webp', '/destinations/phuket.webp'],
    en: {description: 'Eight days in Vietnam: Hanoi old quarter, a Ha Long Bay cruise and the landscapes of Ninh Binh, with hotel, transfers and guided tours included.'},
    ar: {description: 'ثمانية أيام في فيتنام بين هانوي القديمة، ورحلة خليج ها لونغ، ومناظر نينه بينه، مع الفندق والاستقبال والجولات المرشدة.'}
  },
  georgia: {
    rating: 4.7, reviews: 803,
    gallery: ['/destinations/georgia.webp', '/destinations/azerbaijan.webp', '/destinations/istanbul.jpg', '/destinations/bali.webp', '/destinations/phuket.webp'],
    en: {description: 'Six days in Georgia: Tbilisi old town, the mountains of Kazbegi and the Black Sea coast in Batumi, with hotel, transfers and guided tours included.'},
    ar: {description: 'ستة أيام في جورجيا بين تبليسي القديمة، وجبال كازبيجي، وساحل البحر الأسود في باتومي، مع الفندق والاستقبال والجولات المرشدة.'}
  },
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