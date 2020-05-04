# React-Client-Auth

_Pluggable client-side authentication for react_

`react-client-auth` is a solution for handling client-side authentication in react. It supports any authentication provider that can supply a handful of key methods and exposes a user and session controls via the React Context API as well as a `useAuth()` hook.

This is still pretty beta.

## Setup

1. Install the `@react-client-auth/core` plus a provider or configure your own.

```sh
yarn add @react-client-auth/core @react-client-auth/auth0
```

2. Near the top of your component tree, add the `SessionProvider`, passing it a [compatible `auth` service prop](#authentication-services).

```jsx
import React from "react";
import { SessionProvider } from "@react-client-auth/core";
import { Auth0Service } from "@react-client-auth/auth0";

const App = ({ Component, pageProps }) => {
  const auth = new Auth0Service();
  return (
    <SessionProvider auth={auth}>
      <Component {...pageProps} />
    </SessionProvider>
  );
};
```

4. Use the `useAuth()` hook (or `SessionContext.Consumer` in a class component) to access the active `user` and other utilities.

_In your authentication flow (here a typical 0Auth callback page like `/auth/callback`):_

```jsx
import { useRouter } from "next/router";
import { useAuth } from "@react-client-auth/core";

const postLogin = (router) => {
  const postLoginUrl = localStorage.getItem("postLoginUrl");
  localStorage.removeItem("postLoginUrl");
  router.push(postLoginUrl || "/");
};

const CallbackPage = () => {
  const session = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (/access_token|id_token|error/.test(location.hash)) {
      session.auth
        .handleAuthentication()
        .then((user) => {
          session.setUser(user);
          postLogin(router);
        })
        .catch((error) => {
          console.warn("authentication rejected", error);
          router.push("/");
        });
    }
  }, []);

  return <pre>Loading ...</pre>;
};
```

_In a presentational component:_

```jsx
import { useAuth } from "@react-client-auth/core";

const SessionButton = () => {
  const { user, auth } = useAuth();

  return user.isLoggedIn ? (
    <div>
      <h2>Hello, {user.profile.nickname}</h2>
      <button onClick={() => auth.logout()}>Log Out</button>
    </div>
  ) : (
    <div>
      <h2>Who are you?</h2>
      <button onClick={() => auth.authorize()}>Sign In</button>
    </div>
  );
};
```

## API & Authentication Services

It is simple to write your own service for use with the SessionProvider by satisfying a minimal interface. Methods should be capable of working in a browser environment and politely exiting in a server environment.

### Authentication Service Interface

#### `reloadSession(): Promise<User>` - _Required_

**The only hard dependency of the service**, this method is used by the SessionProvider when mounting the app to load a user from the client. You will need to have some method of contacting an identity provider from your client and retrieving the necessary info to construct a [`User`](#user-interface).

#### `handleAuthentication(): Promise<User>`

This method should be used to trigger any post-login authentication steps - commonly a token exchange on a page like `/auth/callback`. Like `reloadSession()` it should return a Promise containing the authenticated user, but how you actually use this is up to you

#### `authorize(): void` + `logout(): void`

These methods should simply trigger the login + logout flows with your authentication provider along with any side effects (directing the user to a landing page, etc).

### `User` interface

The [User interface](/packages/core/src/user.ts) is very simple and extendable. It should have a boolean `isLoggedIn` property and a `profile` object property which can hold any local user data (name, photo, etc). You can extend this interface as needed - see the Auth0 package's [`user`](/packages/auth0/src/user.ts) and [`service`](/packages/auth0/src/auth0Service.ts) for an example.

### `useAuth()` and `SessionContext`

The `SessionContext` is a react Context containing a getter and setter for the current user, a reference to your authentication service and boolean for the loading state of the session. _Aside from the required `reloadSession()` method mentioned above, the interface on your `auth` object is up to you. Please make a pull request to loosen any type restriction issues you have here._

```tsx
interface Session {
  isLoading: boolean;
  user: User;
  setUser: (u: User) => void;
  auth: {
    authorize: () => void;
    logout: () => void;
    handleAuthentication: () => {};
  };
}

// In use:
const { isLoading user, setUser, auth } = useAuth() // = useContext(SessionContext)

<SessionContext.Consumer>
  { ({user}) => <h1>Hello, {user.profile.name}</h1> }
</SessionContext.Consumer>

```

## Contributing

[Contributors' Covenant](CONTRIBUTING.md).
Issues and pull requests welcome.

## License

[MIT](LICENSE.md).
