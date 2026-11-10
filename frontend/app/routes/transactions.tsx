import { requireSession } from "@auth0/auth0-react-router/server";
import type { Route } from "./+types/transactions";
import axios from "axios";

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireSession(request);

  const response = await axios.get("/transactions");

  return response.data;
};

export const action = async ({ request }: Route.ActionArgs) => {
  await requireSession(request);
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
