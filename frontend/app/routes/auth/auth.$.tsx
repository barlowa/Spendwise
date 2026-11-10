import type { Route } from "./+types/auth.$";

import { handleAuth } from "@auth0/auth0-react-router/server";
import { auth0 } from "~/routes/auth/auth0.server";

export const loader = ({ request }: Route.LoaderArgs) =>
  handleAuth(auth0, request);
export const action = ({ request }: Route.ActionArgs) =>
  handleAuth(auth0, request);
