interface BaseUser<T extends {}> {
  isLoggedIn: boolean;
  profile?: T;
}

export type User = LoggedInUser | LoggedOutUser;

export interface LoggedInUser<T extends {} = any> extends BaseUser<T> {
  isLoggedIn: true;
  profile: T;
}

export interface LoggedOutUser<T extends {} = any> extends BaseUser<T> {
  isLoggedIn: false;
}

/** A LoggedOutUser, the AnonymousUser */
export const AnonymousUser: LoggedOutUser<any> = {
  isLoggedIn: false,
};
