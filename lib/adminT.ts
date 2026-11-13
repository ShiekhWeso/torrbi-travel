const en = {
  dashboard: 'Dashboard', packages: 'Packages', destinations: 'Destinations', offers: 'Offers', faq: 'FAQ',
  logout: 'Log out', add: '+ Add', edit: 'Edit', delete: 'Delete', save: 'Save',
  published: 'Published', hidden: '(hidden)', featured: 'Featured (home page)', none: 'None',
  newPackage: 'New package', editPackage: 'Edit package', newDestination: 'New destination',
  editDestination: 'Edit destination', newOffer: 'New offer', editOffer: 'Edit offer',
  newFaq: 'New FAQ', editFaq: 'Edit FAQ', question: 'Question', answer: 'Answer',
  itinerary: 'Itinerary days', noItems: 'Nothing yet.',
  slug: 'Slug (url)', region: 'Region', name: 'Name', country: 'Country', about: 'About',
  image: 'Image URL / path', temp: 'Temp (e.g. 28°C)', rating: 'Rating', flightHours: 'Flight hours',
  bestFrom: 'Best from (month 1-12)', bestTo: 'Best to (month 1-12)', sort: 'Sort order',
  title: 'Title', intro: 'Intro', highlights: 'Highlights', stay: 'Stay (hotels)',
  includes: 'Includes', excludes: 'Excludes', text: 'Text', badge: 'Badge (e.g. -20%)',
  linkedPackage: 'Linked package', validUntil: 'Valid until', days: 'Days', nights: 'Nights',
  price: 'Price USD (empty = on request)', cover: 'Cover image URL / path',
  gallery: 'Gallery - one URL per line', perLine: 'one per line',
  dayNo: 'Day #', stage: 'Stage / city', items: 'Items', saveDay: 'Save day',
  addDay: '+ Add day', deleteDay: 'Delete day'
};

const ar: typeof en = {
  dashboard: 'لوحة التحكم', packages: 'الباقات', destinations: 'الوجهات', offers: 'العروض', faq: 'الأسئلة الشائعة',
  logout: 'تسجيل الخروج', add: '+ إضافة', edit: 'تعديل', delete: 'حذف', save: 'حفظ',
  published: 'منشور', hidden: '(مخفي)', featured: 'مميز (الصفحة الرئيسية)', none: 'بدون',
  newPackage: 'باقة جديدة', editPackage: 'تعديل الباقة', newDestination: 'وجهة جديدة',
  editDestination: 'تعديل الوجهة', newOffer: 'عرض جديد', editOffer: 'تعديل العرض',
  newFaq: 'سؤال شائع جديد', editFaq: 'تعديل السؤال الشائع', question: 'السؤال', answer: 'الإجابة',
  itinerary: 'أيام البرنامج', noItems: 'لا يوجد شيء بعد.',
  slug: 'الرابط (slug)', region: 'المنطقة', name: 'الاسم', country: 'الدولة', about: 'نبذة',
  image: 'رابط / مسار الصورة', temp: 'الحرارة (مثال 28°C)', rating: 'التقييم', flightHours: 'ساعات الطيران',
  bestFrom: 'أفضل وقت من (شهر 1-12)', bestTo: 'إلى (شهر 1-12)', sort: 'الترتيب',
  title: 'العنوان', intro: 'مقدمة', highlights: 'أبرز النقاط', stay: 'الإقامة (الفنادق)',
  includes: 'يشمل', excludes: 'لا يشمل', text: 'النص', badge: 'الشارة (مثال -20%)',
  linkedPackage: 'الباقة المرتبطة', validUntil: 'صالح حتى', days: 'الأيام', nights: 'الليالي',
  price: 'السعر بالدولار (فارغ = عند الطلب)', cover: 'رابط / مسار صورة الغلاف',
  gallery: 'المعرض - رابط في كل سطر', perLine: 'واحد في كل سطر',
  dayNo: 'رقم اليوم', stage: 'المرحلة / المدينة', items: 'العناصر', saveDay: 'حفظ اليوم',
  addDay: '+ إضافة يوم', deleteDay: 'حذف اليوم'
};

export const tr = (locale: string) => (locale === 'ar' ? ar : en);