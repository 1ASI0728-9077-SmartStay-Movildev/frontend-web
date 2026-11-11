/**
 *  Represents Users into bounded.
 *  @class
 */
export class User {
    /**
     * Create an instance of User.
     * @param {Object} object - Object container of user.
     * @param {string} object.id - Unique user identifier.
     * @param {string} object.emailAddress - Email address linked to user.
     */
    constructor({id, emailAddress}) {
        this.id = id;
        this.emailAddress = emailAddress;
    }
}