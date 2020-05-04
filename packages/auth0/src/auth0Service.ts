import * as auth0 from "auth0-js";
import { AnonymousUser, LoggedOutUser } from "@react-client-auth/core";

import { config } from "./config";
import { isBrowser } from "./environment";
import { LoggedInAuth0User, AuthTokens } from "./user";

type Auth0UserResult = LoggedInAuth0User | LoggedOutUser;

export class Auth0Service {
  private client: auth0.WebAuth | undefined;

  constructor() {
    if (isBrowser && !process.env.AUTH0_DOMAIN) {
      console.error("AUTH0_DOMAIN missing");
    }
    this.client = isBrowser ? new auth0.WebAuth(config) : undefined;
  }

  /**
   * Handle the auth callback page. Checks the hash from the browser location, parses
   * the user data and returns that in a promise
   * @returns {Promise<User>} a Promise with the current user
   */
  public handleAuthentication = (): Promise<Auth0UserResult> => {
    return new Promise((resolve, reject) => {
      this.client
        ? this.client.parseHash((err, authResult) => {
            if (authResult && authResult.accessToken && authResult.idToken) {
              const user = this.userFromAuthResult(authResult);
              return resolve(user);
            } else if (err) {
              return reject(err);
            }
            return resolve();
          })
        : resolve(AnonymousUser);
    });
  };

  /**
   * Refresh the user's auth0 session (if their browser claims that they are logged in).
   * @returns {Promise<User>} a Promise with the current user
   */
  public reloadSession(): Promise<Auth0UserResult> {
    return new Promise((resolve, reject) => {
      this.client && this.isAuthenticated()
        ? this.client.checkSession({}, (err, authResult) => {
            if (err) reject(err);
            if (authResult && authResult.accessToken && authResult.idToken) {
              const user = this.userFromAuthResult(authResult);
              resolve(user);
            }
            if (err && err.error === "login_required") {
              // User has been logged out from Auth0 server.
              // Remove local session.
              this.localLogout();
              resolve(AnonymousUser);
            }
          })
        : resolve(AnonymousUser);
    });
  }

  /**
   * Turn an incoming auth0 hash from your callback into a user object.
   * @param authResult The auth result
   * @returns {User}
   */
  private userFromAuthResult(
    authResult: auth0.Auth0DecodedHash
  ): Auth0UserResult {
    if (!isBrowser) return AnonymousUser;
    if (
      !authResult ||
      !authResult.accessToken ||
      !authResult.idToken ||
      !authResult.expiresIn
    ) {
      return AnonymousUser;
    } else {
      const expiresAt = authResult.expiresIn * 1000 + new Date().getTime();
      const tokens: AuthTokens = {
        accessToken: authResult.accessToken,
        idToken: authResult.idToken,
        expiresAt,
      };
      const user: LoggedInAuth0User = {
        isLoggedIn: true,
        profile: authResult.idTokenPayload,
        tokens: tokens,
      };
      localStorage.setItem("isAuthenticated", "true");
      return user;
    }
  }

  /**
   * Begin the auth0 login flow.
   *
   * Sets browser to return to the current page after login (via localStorage).
   * TODO: consider whether this can be handled via the callback route (eg auth0 returnTo param)
   *   and whether `window.location.pathname` will work correctly for urls with a hash or query string
   */
  public authorize = (options: auth0.AuthorizeOptions = {}) => {
    if (!isBrowser) return;
    // Save postLoginUrl so we can redirect user back to where they left off after login screen
    localStorage.setItem("postLoginUrl", window.location.pathname); // TODO: use auth options?

    this.client && this.client.authorize(options);
  };

  /**
   * Log out, both locally and on auth0. Redirects to home.
   */
  public logout(options: auth0.LogoutOptions = {}): void {
    if (!isBrowser) return;
    this.localLogout();
    this.client &&
      this.client.logout({ returnTo: window.location.origin, ...options });
  }

  /**
   * Whether the browser _thinks_ that this user is authenticated.
   */
  public isAuthenticated(): boolean {
    if (!isBrowser) return false;
    return localStorage.getItem("isAuthenticated") === "true";
  }

  /**
   * Tell the browser (localStorage) to _stop_ considering this user authenticated.
   */
  private localLogout(): void {
    if (!isBrowser) return;
    localStorage.removeItem("isAuthenticated");
  }
}
