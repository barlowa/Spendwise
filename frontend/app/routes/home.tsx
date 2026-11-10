import { Welcome } from "../welcome/welcome";
import type { Route } from "./+types/home";

export function meta() {
	return [
		{ title: "New React Router App" },
		{ name: "description", content: "Welcome to React Router!" },
	];
}

export function loader() {
	return "data";
}

export default function Home({ loaderData }: Route.ComponentProps) {
	// const { getAccessTokenSilently } = useAuth0();

	async function testToken() {
		// const token = await getAccessTokenSilently();
		console.log(loaderData);
	}
	return (
		<>
			<Welcome />
			<a href="/transactions">View Transactions</a>
			<button type="button" onClick={testToken}>
				test
			</button>
		</>
	);
}
