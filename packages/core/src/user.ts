interface BaseUser<T extends {}> {
  isLoggedIn: boolean;
  profile?: T;
  tokens: Tokens;
}

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  expiresAt: number;
}

export type Tokens = {} | AuthTokens;

export type User = LoggedInUser | LoggedOutUser;

export interface LoggedInUser<T extends {} = any> extends BaseUser<T> {
  isLoggedIn: true;
  profile: T;
  tokens: AuthTokens;
}

export interface LoggedOutUser<T extends {} = any> extends BaseUser<T> {
  isLoggedIn: false;
  tokens: {};
}

/** The only LoggedOutUser, the AnonymousUser */
export const AnonymousUser: LoggedOutUser<any> = {
  isLoggedIn: false,
  tokens: {},
};
