export function bookingRef(id: number) {
  return `TB-${String(id).padStart(4, '0')}`;
}
