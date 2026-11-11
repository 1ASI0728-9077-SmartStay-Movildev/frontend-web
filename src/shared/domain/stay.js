export function nightsBetween(checkIn, checkOut) {
  const parse = value => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return NaN;
    const time = Date.parse(value + 'T00:00:00Z');
    return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time : NaN;
  };
  return (parse(checkOut) - parse(checkIn)) / 86400000;
}
export const validStay = (start, end) => {
  const nights = nightsBetween(start, end);
  return Number.isInteger(nights) && nights >= 1 && nights <= 30;
};
export const toBookingDate = value => value + 'T00:00:00Z';
