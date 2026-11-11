export const destinations = [
  {
    id: 'santorini',
    region: 'europe',
    span: 'lg:col-span-7',
    height: 'min-h-[460px] lg:min-h-[520px]',
    big: true,
    icon: 'wb_sunny',
    days: null as number | null,
    price: null as string | null,
    image:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Panoramic_view_of_Oia,_Santorini_island_(Thira),_Greece.jpg?width=1200'
  },
  {
    id: 'maldives',
    region: 'asia',
    span: 'lg:col-span-5',
    height: 'min-h-[460px] lg:min-h-[520px]',
    big: false,
    icon: 'water',
    days: null as number | null,
    price: null as string | null,
    image: 'https://images.pexels.com/photos/6934/beach-vacation-water-summer.jpg?cs=tinysrgb&dpr=1&w=1000'
  },
  {
    id: 'kyoto',
    region: 'asia',
    span: 'lg:col-span-6',
    height: 'min-h-[420px]',
    big: false,
    icon: 'park',
    days: null as number | null,
    price: null as string | null,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDxbMCK5tDspNVK-JvFqBqBuZlV06GtVJi2TnBvN5u6h4EUOM5DcEoHgzRZG3Fg92j30NIAf4AalzjnmX8lgCFbXbHgPzntWUGyFG82ZIxu3wLJ8A4pXsXhDFbFPDGSmQk5L6eu0lvkvUVg6fhnQRSq9iVk3mZPybJSPulo1x_mbxGDQiI9rO-SiC0vtnwIAJzn5-k0z_QXzb-QCL5XRsnCQj05jrlt8yjH29hpYoM'
  },
  {
    id: 'swiss',
    region: 'europe',
    span: 'lg:col-span-6',
    height: 'min-h-[420px]',
    big: false,
    icon: 'downhill_skiing',
    days: null as number | null,
    price: null as string | null,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuASJIKB5W4uuN4CyFyrT99nSYT8snCxINUipwxpMqI-uaFdSgncHHVBjvoGVZhPH8XU-0jEVi2ARcarmkwyQrq_nBT2hN3xOb4OBVFWTLnlusVFFHv4JeNVC-lStYs2DI6fi0aqy6HrZPf8OToUUeuUZzZwfuaacagaeTwK2OyRz8mfk1V4eBo8sMQyn_r6OU9OCXtBdAEOuLztV56Yzl-hq_3GSPxMUXXqWjrpwZE'
  }
];

export const flights = [
  {
    id: 'nyc-jtr',
    region: 'na',
    from: 'nyc',
    to: 'jtr',
    h: 9,
    m: 20,
    dep: '19:40',
    depPlace: 'JFK Terminal 7',
    arr: '11:00',
    arrPlace: 'JTR Main',
    old: 780,
    price: 540,
    note: 'limited',
    taxes: 'taxesSeat'
  },
  {
    id: 'lon-mle',
    region: 'eu',
    from: 'lon',
    to: 'mle',
    h: 10,
    m: 15,
    dep: '21:15',
    depPlace: 'LHR Terminal 5',
    arr: '12:30',
    arrPlace: 'MLE Velana Intl',
    old: 1150,
    price: 890,
    note: 'value',
    taxes: 'taxes'
  },
  {
    id: 'sfo-zrh',
    region: 'na',
    from: 'sfo',
    to: 'zrh',
    h: 11,
    m: 5,
    dep: '14:20',
    depPlace: 'SFO International',
    arr: '10:25',
    arrPlace: 'ZRH Kloten',
    old: 670,
    price: 490,
    note: 'transfer',
    taxes: 'taxes'
  }
];
