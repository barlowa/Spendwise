import { Outlet } from "react-router";
import { TokenError } from "@auth0/auth0-react-router/errors";

import type { Route } from "./+types/auth.$";
import { Auth0Provider } from "@auth0/auth0-react-router";
import {
  getAccessToken,
  rootAuthLoader,
} from "@auth0/auth0-react-router/server";
import axios from "axios";

export const loader = async ({ request }: Route.LoaderArgs) => {
  try {
    // get token once authenticated
    const token = await getAccessToken(request);
    // add the token to the axios instance for future requests
    axios.defaults.baseURL = import.meta.env.VITE_API_URL;
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } catch (err) {
    if (err instanceof TokenError) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/auth/login" },
      });
    }
    throw err;
  }

  return rootAuthLoader(request);
};

export default function AuthLayout() {
  return (
    <Auth0Provider>
      <Outlet />
    </Auth0Provider>
  );
}
