// Sensitive payload lives only in this instance; never serialize it to storage.
export class PaymentAttempt {
  constructor() { this.clear(); }
  start(body, newKey = () => crypto.randomUUID()) {
    if (!this.body) { this.body = Object.freeze({ ...body }); this.key = newKey(); }
    return { body: this.body, key: this.key };
  }
  clear() { this.body = null; this.key = null; }
}
export const normalizeCardNumber = value => String(value).replace(/[\s-]/g, '');
export function paymentTestData(now = new Date()) {
  return { cardNumber: '4111 1111 1111 1111', cardHolderName: 'SmartStay Demo',
    expirationDate: '12/' + String(now.getFullYear() + 2).slice(-2), cvv: '123' };
}
