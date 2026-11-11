const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '00000000000';

export const waLink = (text: string) =>
  `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
