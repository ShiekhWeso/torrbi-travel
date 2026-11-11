// Destination ids match messages → destinations.items.<id>
// Illustrations live in /public/destinations/<id>.webp
export const destinations = [
  {id: 'bali', image: '/destinations/bali.webp'},
  {id: 'istanbul', image: '/destinations/istanbul.webp'},
  {id: 'penang', image: '/destinations/penang.webp'},
  {id: 'kualaLumpur', image: '/destinations/kuala-lumpur.webp'},
  {id: 'vietnam', image: '/destinations/vietnam.webp'},
  {id: 'langkawi', image: '/destinations/langkawi.webp'},
  {id: 'phuket', image: '/destinations/phuket.webp'},
  {id: 'azerbaijan', image: '/destinations/azerbaijan.webp'},
  {id: 'georgia', image: '/destinations/georgia.webp'}
] as const;

export type DestinationId = (typeof destinations)[number]['id'];
