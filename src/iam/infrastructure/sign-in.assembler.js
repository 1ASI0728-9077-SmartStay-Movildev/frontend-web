import { SignInResource } from './sign-in.resource.js';
export class SignInAssembler {
  static toResourceFromResponse(response) { return new SignInResource(response.data); }
}
