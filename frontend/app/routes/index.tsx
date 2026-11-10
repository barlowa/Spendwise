import {
	AuthLoading,
	LoginButton,
	LogoutButton,
	SignedIn,
	SignedOut,
} from "@auth0/auth0-react-router";

export default function Home() {
	return (
		<main>
			<h1>Welcome</h1>
			<AuthLoading>
				<p>Loading…</p>
			</AuthLoading>
			<SignedOut>
				<LoginButton>Log in</LoginButton>
			</SignedOut>
			<SignedIn>
				<LogoutButton>Log out</LogoutButton>
			</SignedIn>
		</main>
	);
}
