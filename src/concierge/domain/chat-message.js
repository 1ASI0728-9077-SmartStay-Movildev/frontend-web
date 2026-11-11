import { validStay } from '../../shared/domain/stay.js';

// Keep only fields accepted by the backend. Previous chat turns are UI-only.
export function conciergeRequest(message, preferences) {
  return {
    message: message.trim(), checkIn: preferences.checkIn, checkOut: preferences.checkOut,
    guests: Number(preferences.guests), district: preferences.district.trim(),
    budgetTotal: Number(preferences.budgetTotal), currency: 'USD',
  };
}
export function validConciergeRequest(body) {
  return body.message.length >= 1 && body.message.length <= 500 &&
    validStay(body.checkIn, body.checkOut) && Number.isInteger(body.guests) &&
    body.guests >= 1 && body.guests <= 10 && Number.isFinite(body.budgetTotal) && body.budgetTotal >= 0;
}
export function chatExchange(body, response) {
  return {
    message: body.message,
    text: response.assistantMessage,
    offers: response.offers || [],
    fallbackUsed: !!response.fallbackUsed,
    preferences: { ...body },
    dates: { checkIn: body.checkIn, checkOut: body.checkOut },
  };
}
