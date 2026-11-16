const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '00000000000';

export const waLink = (text: string, phone = number) => {
  const url = `https://wa.me/${phone.replace(/\D/g, '')}`;
  return text ? `${url}?text=${encodeURIComponent(text)}` : url;
};
