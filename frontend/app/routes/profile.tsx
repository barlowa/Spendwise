import { useUser } from "@auth0/auth0-react-router";
import { requireSession } from "@auth0/auth0-react-router/server";
import type { Route } from "./+types/profile";

export const loader = async ({ request }: Route.LoaderArgs) => {
	await requireSession(request);
	return null;
};

export default function Profile() {
	const user = useUser();

	return (
		<main>
			<h1>Profile</h1>
			{user && (
				<div>
					<img
						src={user.picture}
						alt={user.name ?? ""}
						width={80}
						height={80}
					/>
					<p>
						<strong>{user.name}</strong>
					</p>
					<p>{user.email}</p>
				</div>
			)}
		</main>
	);
}
