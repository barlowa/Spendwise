import Link from "~/components/Link";

export function meta() {
	return [
		{ title: "New React Router App" },
		{ name: "description", content: "Welcome to React Router!" },
	];
}

export default function Home() {
	return (
		<div>
			<Link to="/transactions">View Transactions</Link>
			<Link to="/profile">View Profile</Link>
		</div>
	);
}
