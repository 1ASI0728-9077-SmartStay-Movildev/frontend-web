import {IamApi} from "../infrastructure/iam-api.js";
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {SignInAssembler} from "../infrastructure/sign-in.assembler.js";
import {UserAssembler} from "../infrastructure/user.assembler.js";
import {SignUpAssembler} from "../infrastructure/sign-up.assembler.js";
import {SignInCommand} from "../domain/sign-in.command.js";
import {SignUpCommand} from "../domain/sign-up.command.js";

const iamApi = new IamApi();

/**
 * Application service store for the IAM bounded context.
 * It coordinates authentication commands and exposes UI-facing identity state.
 *
 * @module useIamStore
 * @returns {Object} Store state and actions.
 */
const useIamStore = defineStore('iam', () => {
    /** @type {import('vue').Ref<Array<import('../domain/user.entity.js').User>>} Array of user entities. */
    const users = ref([]);
    /** @type {import('vue').Ref<Array<Error>>} Errors raised by IAM use-case execution. */
    const errors = ref([]);
    /** @type {import('vue').Ref<boolean>} Flag indicating if users have been loaded. */
    const usersLoaded = ref(false);
    /** @type {import('vue').Ref<boolean>} Flag indicating if a user is signed in. */
    const isSignedIn = ref(false);
    /** @type {import('vue').Ref<string|null>} Current signed-in username. */
    const currentUsername = ref(null);
    /** @type {import('vue').Ref<number>} Current signed-in user identifier. */
    const currentUserId = ref(0);
    /** @type {import('vue').ComputedRef<string|null>} Authentication token in local storage. */
    const currentToken = computed(() => isSignedIn.value ? localStorage.getItem('token') : null);

    /**
     * Executes the sign-in use case and updates authentication state.
     * @param {SignInCommand} signInCommand - Sign-in command.
     * @param {import('vue-router').Router} router - Router used to redirect on result.
     * @returns {void}
     */
    function signIn(signInCommand, router) {
        // Implementation for sign-in action
        console.log(signInCommand);
        iamApi.signIn(signInCommand)
            .then(response => {
                let signInResource = SignInAssembler.toResourceFromResponse(response);
                if (signInResource) {
                    let currentUser = UserAssembler.toEntityFromResource(signInResource);
                    currentUsername.value = currentUser.emailAddress;
                    currentUserId.value = currentUser.id;
                    localStorage.setItem('token', signInResource.token);
                    isSignedIn.value = true;
                    console.log(`User signed in: ${currentUsername.value}`);
                    errors.value = [];
                    router.push({name: 'home'});
                } else {
                    isSignedIn.value = false;
                    console.log('Sign-in failed');
                    errors.value.push(new Error('Sign-in failed'));
                    router.push({name: 'login'});
                }

            })
            .catch(error => {
                isSignedIn.value = false;
                currentUsername.value = error.name;
                console.log(error);
                errors.value.push(error);
                router.push({name: 'login'});
            });
    }

    /**
     * Executes the sign-up use case and routes the user to the next screen.
     * @param {SignUpCommand} signUpCommand - Sign-up command.
     * @param {import('vue-router').Router} router - Router used to redirect on result.
     * @returns {void}
     */
    function signUp(signUpCommand, router) {
        // Implementation for sign-up action
        iamApi.signUp(signUpCommand)
            .then(response => {
                let signUpResource = SignUpAssembler.toResourceFromResponse(response);
                if (signUpResource) {
                    console.log(signUpResource.message);
                    errors.value = [];
                    router.push({name: 'login'});
                } else {
                    console.log('Sign-up failed');
                    errors.value.push(new Error('Sign-up failed'));
                    router.push({name: 'register'});
                }
            })
            .catch(error => {
                console.log(error);
                errors.value.push(error);
                router.push({name: 'register'});
            });
    }

    /** Clears the active IAM session and local auth artifacts. */
    function signOut() {
        currentUsername.value = null;
        currentUserId.value = 0;
        localStorage.removeItem('token');
        isSignedIn.value = false;
        console.log('User signed out');
        errors.value = [];
    }

    /**
     * Loads user entities from infrastructure.
     * @returns {void}
     */
    function fetchUsers() {
        iamApi.getUsers().then(response => {
            users.value = UserAssembler.toEntitiesFromResponse(response);
            usersLoaded.value = true;
            console.log(`Loaded ${users.value.length} users.`);
            errors.value = [];
        }).catch(error => {
            console.error('Error fetching users:', error);
            errors.value.push(error);
        });
    }

    return {
        users,
        errors,
        usersLoaded,
        currentUsername,
        currentUserId,
        currentToken,
        isSignedIn,
        signIn,
        signUp,
        signOut,
        fetchUsers
    };
});

export default useIamStore;