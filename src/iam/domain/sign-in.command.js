/**
 * Command used by the IAM application layer to request authentication.
 *
 * @class SignInCommand
 */
export class SignInCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {string} params.emailAddress - Email address credential.
     * @param {string} params.password - Password credential.
     */
    constructor({emailAddress, password}) {
        this.emailAddress = emailAddress;
        this.password = password;
    }
}