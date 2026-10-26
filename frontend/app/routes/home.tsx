import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { useAuth0 } from "@auth0/auth0-react";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const { getAccessTokenSilently } = useAuth0();
  async function testToken() {
    const token = await getAccessTokenSilently();
    console.log(token);
  }
  return (
    <>
      <Welcome />
      <button onClick={testToken}>test</button>
    </>
  );
}
