/* eslint-disable @typescript-eslint/no-empty-function */
import React from "react";
import { User, AnonymousUser } from "./user";

import { isBrowser } from "./environment";

// TODO: consider combining
interface SessionState {
  isLoading: boolean;
  user: User;
}

export interface Session<T = any, U = any, V = any> extends SessionState {
  setUser: (u: User) => void;
  auth: Pick<
    AuthService<T, U, V>,
    "authorize" | "logout" | "handleAuthentication"
  >;
}

export const SessionContext = React.createContext<Session>({
  isLoading: true,
  user: AnonymousUser,
  setUser: () => {},
  auth: {
    authorize: () => {},
    logout: () => {},
    handleAuthentication: (() => {}) as any,
  },
});

interface AuthService<T = any, U = any, V = any> {
  authorize: (options?: T) => void;
  logout: (options?: U) => void;
  handleAuthentication: (options?: V) => Promise<User>;
  reloadSession: () => Promise<User>;
}

/**
 * The SessionProvider maintains user authentication state and provides it to the app
 * via the context API. Auth0-related functions are proxied to the Auth service singleton.
 */
export const SessionProvider: React.FC<{ auth: AuthService }> = ({
  auth,
  children,
}) => {
  const [sessionState, setSessionState] = React.useState<SessionState>({
    isLoading: true,
    user: AnonymousUser,
  });

  const setUser = (user: User) => {
    setSessionState({ isLoading: false, user });
  };

  React.useEffect(() => {
    if (isBrowser) {
      auth.reloadSession().then((u) => {
        setUser(u);
      });
    } else {
      setSessionState({ isLoading: false, user: sessionState.user });
    }
  }, []);

  return (
    <SessionContext.Provider
      value={{
        ...sessionState,
        setUser,
        auth,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
