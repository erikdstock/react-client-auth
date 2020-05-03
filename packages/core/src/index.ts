import { useContext } from "react";
import { SessionContext, Session } from "./SessionProvider";
export * from "./SessionProvider";
export * from "./user";

export const useAuth: () => Session = () => {
  return useContext(SessionContext);
};
