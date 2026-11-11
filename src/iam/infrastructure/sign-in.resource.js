export class SignInResource {
  constructor({ id, username, token, role, hotelId = null, chainId = null }) {
    Object.assign(this, { id, username, token, role, hotelId, chainId });
  }
}
