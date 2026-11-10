import {
  createApiClient,
  getAccessToken,
  requireSession,
} from "@auth0/auth0-react-router/server";
import { TokenError } from "@auth0/auth0-react-router/errors";
import type { Route } from "./+types/transactions";

export const loader = async ({ request }: Route.LoaderArgs) => {
  let token: string;
  try {
    token = await getAccessToken(request);
  } catch (err) {
    if (err instanceof TokenError) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/auth/login" },
      });
    }
    throw err;
  }
  const data = await fetch(`${import.meta.env.VITE_API_URL}/transactions`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());
  return { data };
};

export default function Transactions({ loaderData }: Route.ComponentProps) {
  console.log(loaderData);
  //   const { name, description } = loaderData;
  //   return (
  //     <div>
  //       <h1>{name}</h1>
  //       <p>{description}</p>
  //     </div>
  return <div>test transactions</div>;
}
