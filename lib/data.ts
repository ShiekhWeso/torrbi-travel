// Destination ids match messages → destinations.items.<id>
// Illustrations live in /public/destinations/<id>.webp
export const destinations = [
  {id: 'bali', image: '/destinations/bali.webp'},
  {id: 'istanbul', image: '/destinations/istanbul.jpg'},
  {id: 'penang', image: '/destinations/penang.webp'},
  {id: 'kualaLumpur', image: '/destinations/kuala-lumpur.jpg'},
  {id: 'vietnam', image: '/destinations/vietnam.webp'},
  {id: 'langkawi', image: '/destinations/langkawi.webp'},
  {id: 'phuket', image: '/destinations/phuket.webp'},
  {id: 'azerbaijan', image: '/destinations/azerbaijan.webp'},
  {id: 'georgia', image: '/destinations/georgia.webp'}
] as const;

export type DestinationId = (typeof destinations)[number]['id'];

// Tourist packages. Text lives in messages → packages.items.<id>.title
// days and price are optional: fill them in and they appear on the card
// (price is shown as written, e.g. '$850'). Leave null to show "Price on request".
// NOTE: these three entries are SAMPLES, replace them with your real packages.
export const packages: {id: string; image: string; days: number; price: string; priceNum: number; region: 'asia' | 'turkey' | 'caucasus'}[] = [
  {id: 'bali', image: '/destinations/bali.webp', days: 7, price: '$850', priceNum: 850, region: 'asia'},
  {id: 'istanbul', image: '/destinations/istanbul.jpg', days: 5, price: '$720', priceNum: 720, region: 'turkey'},
  {id: 'phuket', image: '/destinations/phuket.webp', days: 6, price: '$790', priceNum: 790, region: 'asia'},
  {id: 'penang', image: '/destinations/penang.webp', days: 5, price: '$640', priceNum: 640, region: 'asia'},
  {id: 'vietnam', image: '/destinations/vietnam.webp', days: 8, price: '$910', priceNum: 910, region: 'asia'},
  {id: 'georgia', image: '/destinations/georgia.webp', days: 6, price: '$690', priceNum: 690, region: 'caucasus'}
];