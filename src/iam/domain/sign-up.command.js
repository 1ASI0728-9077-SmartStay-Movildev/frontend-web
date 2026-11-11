/**
 * Command used by the IAM application layer to register a new user.
 *
 * @class SignUpCommand
 */
export class SignUpCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {string} params.emailAddress - Desired username.
     * @param {string} params.password - Desired password.
     */
    constructor({emailAddress, password}) {
        this.emailAddress = emailAddress;
        this.password = password;
    }
}