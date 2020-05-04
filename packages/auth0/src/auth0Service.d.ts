import * as auth0 from "auth0-js";
import { User } from "@react-client-auth/core";
export declare class Auth0Service {
    private client;
    constructor();
    /**
     * Handle the auth callback page. Checks the hash from the browser location, parses
     * the user data and returns that in a promise
     * @returns {Promise<User>} a Promise with the current user
     */
    handleAuthentication: () => Promise<User>;
    /**
     * Refresh the user's auth0 session (if their browser claims that they are logged in).
     * @returns {Promise<User>} a Promise with the current user
     */
    checkSession(): Promise<User>;
    /**
     * Turn an incoming auth0 hash from your callback into a user object.
     * @param authResult The auth result
     * @returns {User}
     */
    private userFromAuthResult;
    /**
     * Begin the auth0 login flow.
     *
     * Sets browser to return to the current page after login (via localStorage).
     * TODO: consider whether this can be handled via the callback route (eg auth0 returnTo param)
     *   and whether `window.location.pathname` will work correctly for urls with a hash or query string
     */
    authorize: (options?: auth0.AuthorizeOptions) => void;
    /**
     * Log out, both locally and on auth0. Redirects to home.
     */
    logout(options?: auth0.LogoutOptions): void;
    /**
     * Whether the browser _thinks_ that this user is authenticated.
     */
    isAuthenticated(): boolean;
    /**
     * Tell the browser (localStorage) to _stop_ considering this user authenticated.
     */
    private localLogout;
}
