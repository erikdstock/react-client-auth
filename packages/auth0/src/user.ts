import { LoggedInUser } from "@react-client-auth/core";

export * from "./auth0Service";
export * from "./user";

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  expiresAt: number;
}

export interface LoggedInAuth0User<T extends {} = any> extends LoggedInUser<T> {
  isLoggedIn: true;
  profile: T;
  tokens: AuthTokens;
}
