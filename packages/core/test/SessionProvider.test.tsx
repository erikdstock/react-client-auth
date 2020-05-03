import React from "react";
import { render, act } from "@testing-library/react";

import { SessionProvider } from "../src/SessionProvider";
import { useAuth } from "../src";

const mockAuth = {
  checkSession: jest.fn(),
  authorize: jest.fn(),
  logout: jest.fn(),
  handleAuthentication: jest.fn(),
};

const Child: React.FC = () => {
  const { user, isLoading } = useAuth();
  return (
    <div>
      {isLoading
        ? "Loading"
        : `Hello, ${user.isLoggedIn ? user.profile.name : "Anonymous"}`}
    </div>
  );
};

describe("<SessionProvider />", () => {
  beforeEach(() => jest.resetAllMocks());

  it("sets a user after mounting if logged in", async () => {
    mockAuth.checkSession.mockResolvedValue({
      isLoggedIn: true,
      profile: { name: "Ms. User" },
    });

    let rendered;
    await act(async () => {
      rendered = render(
        <SessionProvider auth={mockAuth}>
          <Child />
        </SessionProvider>
      );
      await rendered.findByText("Hello, Ms. User");
    });

    expect(rendered.queryByText("Hello, Ms. User")).not.toBeNull();
  });
});
