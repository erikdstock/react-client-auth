import { Auth0Service } from "../src/auth0Service";
import * as auth0 from "auth0-js";

jest.mock("../src/config", () => ({
  config: {
    domain: "process.env.AUTH0_DOMAIN",
    clientID: "process.env.AUTH0_CLIENT_ID",
    redirectUri: "process.env.AUTH0_REDIRECT_URI",
    audience: "process.env.AUTH0_AUDIENCE",
    responseType: 'process.env.AUTH0_RESPONSE_TYPE || "token id_token"',
    scope: 'process.env.AUTH0_SCOPE || "openid email profile"',
  },
}));
jest.mock("auth0-js");

const OLD_ENV = process.env;

const createService = () => {
  const service = new Auth0Service();
  const auth0ClientMock = (auth0.WebAuth as jest.Mock).mock.instances[0];

  return {
    service,
    auth0ClientMock,
  };
};

beforeEach(() => {
  jest.resetModules();
  process.env = { ...OLD_ENV, AUTH0_DOMAIN: "https://auth0.auth0.auth0.biz" };
});

afterEach(() => {
  process.env = OLD_ENV;
});

describe("Auth0Service", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("in the browser", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("has a auth0.WebAuth client in the browser", () => {
      new Auth0Service();
      expect(auth0.WebAuth as jest.Mock).toHaveBeenCalledWith({
        domain: "process.env.AUTH0_DOMAIN",
        clientID: "process.env.AUTH0_CLIENT_ID",
        redirectUri: "process.env.AUTH0_REDIRECT_URI",
        audience: "process.env.AUTH0_AUDIENCE",
        responseType: 'process.env.AUTH0_RESPONSE_TYPE || "token id_token"',
        scope: 'process.env.AUTH0_SCOPE || "openid email profile"',
      });
    });

    describe("handleAuthentication()", () => {
      it("calls the auth0 parseHash() method", () => {
        const { service, auth0ClientMock } = createService();

        service.handleAuthentication();

        expect(auth0ClientMock.parseHash).toHaveBeenCalled();
      });
    });

    describe("checkSession()", () => {
      it("does not call the auth0 checkSession() method if it thinks the client is not authenticated", () => {
        const { service, auth0ClientMock } = createService();
        jest.spyOn(service, "isAuthenticated");
        (service.isAuthenticated as jest.Mock).mockImplementation(() => false);

        service.checkSession();

        expect(auth0ClientMock.checkSession).not.toHaveBeenCalled();
      });

      it("calls the auth0 checkSession() method if it thinks the client is authenticated", () => {
        const { service, auth0ClientMock } = createService();
        jest.spyOn(service, "isAuthenticated");
        (service.isAuthenticated as jest.Mock).mockImplementation(() => true);

        service.checkSession();

        expect(auth0ClientMock.checkSession).toHaveBeenCalled();
      });
    });

    describe("authorize()", () => {
      it("calls the auth0 client authorize() method", () => {
        const { service, auth0ClientMock } = createService();
        service.authorize();
        expect(auth0ClientMock.authorize).toHaveBeenCalledWith({});
      });
    });

    describe("logout()", () => {
      it("removes 'isAuthenticated' from localStorage", () => {
        // This can also be accomplished with jsdom's Storage.prototype:
        // jest.spyOn(Storage.prototype, 'removeItem')
        // but NOT jest.spyOn(localStorage, 'removeItem')
        jest.spyOn(window.localStorage.__proto__, "removeItem");
        const { service } = createService();

        service.logout();
        expect(window.localStorage.__proto__.removeItem).toHaveBeenCalledWith(
          "isAuthenticated"
        );
      });
    });

    describe("isAuthenticated()", () => {
      it("returns true if the browser localStorage thinks it is authenticated", () => {
        const { service } = createService();
        jest.spyOn(window.localStorage.__proto__, "getItem");
        window.localStorage.__proto__.getItem.mockReturnValue("true");

        expect(service.isAuthenticated()).toEqual(true);
        expect(window.localStorage.__proto__.getItem).toHaveBeenCalledWith(
          "isAuthenticated"
        );
      });
      it("returns false otherwise", () => {
        const { service } = createService();
        jest.spyOn(window.localStorage.__proto__, "getItem");
        window.localStorage.__proto__.getItem.mockReturnValue("whatever");

        expect(service.isAuthenticated()).toEqual(false);
      });
    });
  });
});
