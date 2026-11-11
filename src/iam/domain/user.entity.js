export class User {
  constructor({ id, username, role, hotelId = null, chainId = null, status, createdAt, updatedAt }) {
    Object.assign(this, { id, username, role, hotelId, chainId, status, createdAt, updatedAt });
  }
}
