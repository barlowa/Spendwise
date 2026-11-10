import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/auth.$";
import { Auth0Provider } from "@auth0/auth0-react-router";
import { rootAuthLoader } from "@auth0/auth0-react-router/server";

export const loader = ({ request }: Route.LoaderArgs) =>
  rootAuthLoader(request);

export default function AuthLayout() {
  return (
    <Auth0Provider>
      <Outlet />
    </Auth0Provider>
  );
}
