import * as React from "react";
import { useRouter } from "next/router";
import { useAuth } from "@react-client-auth/core";
import { NextPage } from "next";

const postLogin = (router) => {
  const postLoginUrl = localStorage.getItem("postLoginUrl");
  localStorage.removeItem("postLoginUrl");
  router.push(postLoginUrl || "/");
};

const CallbackPage: NextPage = () => {
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
          console.warn("auth0 authentication rejected", error);
          router.push("/");
        });
    }
  }, []);

  return <pre>Loading ...</pre>;
};

export default CallbackPage;
