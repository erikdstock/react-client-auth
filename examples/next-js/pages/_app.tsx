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

export default App;
