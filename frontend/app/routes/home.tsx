import { Link } from "@heroui/react";

export function meta() {
	return [
		{ title: "New React Router App" },
		{ name: "description", content: "Welcome to React Router!" },
	];
}

export default function Home() {
	return (
		<div>
			<Link href="/transactions">View Transactions</Link>
			<Link href="/profile">View Profile</Link>
		</div>
	);
}
